package com.example.Logistics.service;

import com.example.Logistics.model.*;
import com.example.Logistics.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private FuelLogRepository fuelLogRepository;

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    // 🎯 ADD THIS: Auto-link Shipment with Trips
    @Autowired
    private ShipmentRepository shipmentRepository;

    // 1. Create Trip (With Shipment Linkage)
    @Transactional
    public Trip createTrip(Trip trip) {
        boolean hasVehicle = false;
        boolean hasDriver = false;

        // Validate Vehicle
        if (trip.getVehicle() != null && trip.getVehicle().getId() != null) {
            Vehicle vehicle = vehicleRepository.findById(trip.getVehicle().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle Not Found for this trip"));

            if (!"AVAILABLE".equalsIgnoreCase(vehicle.getStatus())) {
                throw new RuntimeException("Error: Cannot assign vehicle! It is currently " + vehicle.getStatus());
            }

            vehicle.setStatus("ON_TRIP");
            vehicleRepository.save(vehicle);
            trip.setVehicle(vehicle);
            hasVehicle = true;
        } else {
            trip.setVehicle(null);
        }

        // Validate Driver
        if (trip.getDriver() != null && trip.getDriver().getId() != null) {
            Driver driver = driverRepository.findById(trip.getDriver().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Driver Not Found for this trip"));

            if (!"AVAILABLE".equalsIgnoreCase(driver.getStatus())) {
                throw new RuntimeException("Error: Assigned driver is already on trip!");
            }
            driver.setStatus("ON_TRIP");
            driverRepository.save(driver);
            trip.setDriver(driver);
            hasDriver = true;
        } else {
            trip.setDriver(null);
        }

        // Link driver and vehicle
        if (hasVehicle && hasDriver) {
            trip.getDriver().setVehicle(trip.getVehicle());
            driverRepository.save(trip.getDriver());
        }

        // Dynamic Status Assignment
        if (hasVehicle && hasDriver) {
            trip.setStatus("ACTIVE");
            trip.setStartDate(LocalDateTime.now());
        } else {
            trip.setStatus("SCHEDULED");
        }

        // Save Trip first to generate ID
        Trip savedTrip = tripRepository.save(trip);

        // 🔗 LINK PENDING SHIPMENTS TO THIS TRIP AUTOMATICALLY
        if (hasVehicle && hasDriver) {
            linkPendingShipmentsToTrip(savedTrip);
        }

        return savedTrip;
    }

    // Helper: Find & Link matching Shipments to Trip
    private void linkPendingShipmentsToTrip(Trip trip) {
        if (trip.getDestinationCity() != null && trip.getDriver() != null) {
            List<Shipment> matchingShipments = shipmentRepository.findByDriverIdAndStatus(trip.getDriver().getId(), "PENDING");
            if (matchingShipments.isEmpty()) {
                // Search by Destination City if not directly linked by Driver ID
                matchingShipments = shipmentRepository.findByDeliveryCityAndStatus(trip.getDestinationCity(), "PENDING");
            }

            for (Shipment shipment : matchingShipments) {
                shipment.setTrip(trip);
                shipment.setStatus("ON_GOING");
                shipmentRepository.save(shipment);
            }
        }
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Page<Trip> getAllTripsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return tripRepository.findAll(pageable);
    }

    public Optional<Trip> getTripById(long id) {
        return tripRepository.findById(id);
    }

    // 🏁 Complete Trip (Triggers Maintenance & Free Resources)
    @Transactional
    public Trip completeTrip(long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip Not Found with id: " + tripId));

        if ("COMPLETED".equalsIgnoreCase(trip.getStatus())) {
            throw new RuntimeException("Trip is already completed!");
        }

        trip.setStatus("COMPLETED");
        trip.setEndDate(LocalDateTime.now());
        trip = tripRepository.saveAndFlush(trip);

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // 🚨 AUTOMATIC MAINTENANCE ALERT LOGIC
        if (vehicle != null) {
            long completedTripsCount = tripRepository.countByVehicleIdAndStatus(vehicle.getId(), "COMPLETED");

            if (completedTripsCount > 0 && completedTripsCount % 5 == 0) { // Changed %1 to %5
                vehicle.setStatus("IN_MAINTENANCE");

                MaintenanceLog maintenanceLog = new MaintenanceLog();
                maintenanceLog.setVehicle(vehicle);
                maintenanceLog.setMaintenanceDate(LocalDateTime.now());
                maintenanceLog.setDescription("Routine Inspection Triggered (" + completedTripsCount + " Trips Completed)");
                maintenanceLog.setCost(0.0);

                maintenanceLogRepository.save(maintenanceLog);
            } else {
                vehicle.setStatus("AVAILABLE");
            }
            vehicleRepository.save(vehicle);
        }

        // 🏁 FREE DRIVER LOGIC
        if (driver != null) {
            driver.setStatus("AVAILABLE");
            driver.setVehicle(null);
            driverRepository.save(driver);
        }

        return trip;
    }

    // Assign Resources (With Shipment Linkage)
    @Transactional
    public Trip assignResourcesToTrip(Long tripId, Long vehicleId, Long driverId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));
        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException("Error: Selected vehicle is already " + vehicle.getStatus());
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + driverId));
        if (!"AVAILABLE".equalsIgnoreCase(driver.getStatus())) {
            throw new RuntimeException("Error: Selected driver is already " + driver.getStatus());
        }

        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setStatus("ACTIVE");
        trip.setStartDate(LocalDateTime.now());

        driver.setVehicle(vehicle);
        vehicle.setStatus("ON_TRIP");
        driver.setStatus("ON_TRIP");

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);

        Trip savedTrip = tripRepository.save(trip);

        // 🔗 LINK SHIPMENTS TO THIS TRIP UPON ASSIGNMENT
        linkPendingShipmentsToTrip(savedTrip);

        return savedTrip;
    }
}
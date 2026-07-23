package com.example.Logistics.service;

import com.example.Logistics.model.Shipment;
import com.example.Logistics.model.ShipmentTrackingLog;
import com.example.Logistics.model.Trip;
import com.example.Logistics.model.TripShipment;
import com.example.Logistics.model.Vehicle;
import com.example.Logistics.model.Driver;
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
import java.util.UUID;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripShipmentRepository tripShipmentRepository;

    @Autowired
    private ShipmentTrackingLogRepository shipmentTrackingLogRepository;

    // Create
    public Shipment createShipment(Shipment shipment) {
        String trackingNumber = "TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        shipment.setTrackingNumber(trackingNumber);
        shipment.setStatus("PENDING");
        shipment.setCreatedAt(LocalDateTime.now());

        return shipmentRepository.save(shipment);
    }

    // Read
    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Page<Shipment> getAllShipmentsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return shipmentRepository.findAll(pageable);
    }

    public Optional<Shipment> getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber);
    }

    public Optional<Shipment> getShipmentById(long id) {
        return shipmentRepository.findById(id);
    }

    // 🎯 FIX: Cascading Update across Shipment, TripShipment, Trip, Driver & Vehicle
    @Transactional
    public Shipment updateShipmentStatus(long id, String newStatus) {
    Shipment existingShipment = shipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

    existingShipment.setStatus(newStatus);

    // Tracking log entry
    ShipmentTrackingLog trackingLog = new ShipmentTrackingLog();
    trackingLog.setShipment(existingShipment);
    trackingLog.setTimestamp(LocalDateTime.now());
    trackingLog.setLocationCity(existingShipment.getDeliveryCity() != null ? existingShipment.getDeliveryCity() : "In Transit");

    if ("DELIVERED".equalsIgnoreCase(newStatus)) {
        existingShipment.setDeliveredAt(LocalDateTime.now());
        trackingLog.setStatusActivity("Parcel successfully delivered to destination.");

        // 1. Safe Optional handling for TripShipment
        Optional<TripShipment> tripShipmentOpt = tripShipmentRepository.findByShipmentId(id);
        if (tripShipmentOpt.isPresent()) {
            TripShipment tripShipment = tripShipmentOpt.get();
            tripShipment.setDeliveryStatus("DELIVERED");
            tripShipmentRepository.save(tripShipment);

            // 2. Fetch Parent Trip & Mark Complete
            Trip trip = tripShipment.getTrip();
            if (trip != null) {
                trip.setStatus("COMPLETED");
                trip.setEndDate(LocalDateTime.now());
                tripRepository.save(trip);

                // 3. Free Up Driver & Vehicle for future assignments
                if (trip.getDriver() != null) {
                    Driver driver = trip.getDriver();
                    driver.setStatus("AVAILABLE");
                    driverRepository.save(driver);
                }
                if (trip.getVehicle() != null) {
                    Vehicle vehicle = trip.getVehicle();
                    vehicle.setStatus("AVAILABLE");
                    vehicleRepository.save(vehicle);
                }
            }
        }

    } else if ("ON_GOING".equalsIgnoreCase(newStatus)) {
        existingShipment.setDispatchedAt(LocalDateTime.now());
        trackingLog.setStatusActivity("Shipment dispatched and currently on route.");
    } else {
        trackingLog.setStatusActivity("Shipment status updated to " + newStatus);
    }

    // Save tracking log
    shipmentTrackingLogRepository.save(trackingLog);

    return shipmentRepository.save(existingShipment);
}
    // Delete
    public void deleteShipment(long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new RuntimeException("Shipment not found with id: " + id);
        }
        shipmentRepository.deleteById(id);
    }

    // FIFO Assignment Method
    public Shipment assignToFirstAvailableDriver(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + shipmentId));

        Driver firstDriver = driverRepository.findFirstByStatus("AVAILABLE")
                .orElseThrow(() -> new RuntimeException("Abhi koi driver available nahi hai!"));

        shipment.setDriver(firstDriver);
        shipment.setStatus("ASSIGNED_PENDING_ACCEPTANCE");

        return shipmentRepository.save(shipment);
    }

    // Driver's pending requests fetch
    public List<Shipment> getPendingRequestsForDriver(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver not found for user ID: " + userId));

        return shipmentRepository.findByDriverIdAndStatus(driver.getId(), "ASSIGNED_PENDING_ACCEPTANCE");
    }

    // Accept Shipment & Auto-Assign Vehicle + Trip
    @Transactional
    public Shipment acceptShipment(Long shipmentId, Long userId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        Vehicle vehicle = vehicleRepository.findSuitableAvailableVehicle(shipment.getWeight())
                .orElseThrow(() -> new RuntimeException("No available vehicle found!"));

        driver.setStatus("ON_TRIP");
        vehicle.setStatus("ON_TRIP");
        shipment.setStatus("ON_GOING");
        shipment.setDriver(driver);
        shipment.setDispatchedAt(LocalDateTime.now());

        driverRepository.saveAndFlush(driver);
        vehicleRepository.saveAndFlush(vehicle);
        Shipment savedShipment = shipmentRepository.saveAndFlush(shipment);

        Trip newTrip = new Trip();
        newTrip.setTripNumber("TRP-" + System.currentTimeMillis());
        newTrip.setDriver(driver);
        newTrip.setVehicle(vehicle);
        newTrip.setSourceCity("Karachi Hub");
        newTrip.setDestinationCity(savedShipment.getDeliveryCity());
        newTrip.setStatus("ACTIVE");
        newTrip.setStartDate(LocalDateTime.now());
        Trip savedTrip = tripRepository.saveAndFlush(newTrip);

        TripShipment tripShipment = new TripShipment();
        tripShipment.setTrip(savedTrip);
        tripShipment.setShipment(savedShipment);
        tripShipment.setLoadedAt(LocalDateTime.now());
        tripShipment.setDeliveryStatus("ON_GOING");
        tripShipmentRepository.saveAndFlush(tripShipment);

        ShipmentTrackingLog textLog = new ShipmentTrackingLog();
        textLog.setShipment(savedShipment);
        textLog.setLocationCity("Karachi Central Hub");
        textLog.setStatusActivity("Parcel securely loaded onto Fleet Vehicle " + vehicle.getVehicleNumber());
        textLog.setTimestamp(LocalDateTime.now());
        shipmentTrackingLogRepository.saveAndFlush(textLog);

        return savedShipment;
    }

    // Decline Logic
    public Shipment declineShipment(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + shipmentId));

        shipment.setStatus("PENDING");
        shipment.setDriver(null);
        shipment.setDispatchedAt(null);

        return shipmentRepository.save(shipment);
    }

    // Driver's Active Trips
    public List<Shipment> getActiveTripsForDriver(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found"));

        return shipmentRepository.findByDriverIdAndStatus(driver.getId(), "ON_GOING");
    }

    // Driver's All Shipments
    public List<Shipment> getAllShipmentsForDriver(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found for user ID: " + userId));

        return shipmentRepository.findByDriverId(driver.getId());
    }
}
package com.example.Logistics.service;

import com.example.Logistics.model.Shipment;
import com.example.Logistics.model.Trip;
import com.example.Logistics.model.TripShipment;
import com.example.Logistics.model.Vehicle;
import com.example.Logistics.model.Driver;
import com.example.Logistics.repository.DriverRepository;
import com.example.Logistics.repository.ShipmentRepository;
import com.example.Logistics.repository.TripRepository;
import com.example.Logistics.repository.TripShipmentRepository;
import com.example.Logistics.repository.VehicleRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TripShipmentService {   //kaunsi Shipment (ID) kis Trip (ID) ke andar rakhi gayi hai.

    @Autowired
    private TripShipmentRepository tripShipmentRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    //create
    @Transactional
    public TripShipment createTripShipment(TripShipment tripShipment) {
        if (tripShipment.getTrip() == null || tripShipment.getTrip().getId() == null) {
            throw new RuntimeException("Trip ID is required");
        }
        if (tripShipment.getShipment() == null || tripShipment.getShipment().getId() == null) {
            throw new RuntimeException("Shipment ID is required");
        }

        Trip realTrip = tripRepository.findById(tripShipment.getTrip().getId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Shipment realShipment = shipmentRepository.findById(tripShipment.getShipment().getId())
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        tripShipment.setTrip(realTrip);
        tripShipment.setShipment(realShipment);
        
        if (tripShipment.getLoadedAt() == null) {
            tripShipment.setLoadedAt(java.time.LocalDateTime.now());
        }

        return tripShipmentRepository.save(tripShipment);
    }

    //read
    public List<TripShipment> getAllTripShipments(){
        return tripShipmentRepository.findAll();
    }

    public List<TripShipment> getShipmentsByTripId(long tripId){
        return tripShipmentRepository.findByTripId(tripId);
    }

    //delete
    public void removeShipmentFromTrip(Long id) {
        if (!tripShipmentRepository.existsById(id)) {
            throw new RuntimeException("TripShipment mapping not found with id: " + id);
        }
        tripShipmentRepository.deleteById(id);
    }

    //update
    @Transactional
    public Shipment updateShipmentStatus(long id, String newStatus){
        Shipment existingShipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        existingShipment.setStatus(newStatus);
        
        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            existingShipment.setDeliveredAt(LocalDateTime.now());

            // 1. Driver status ko AVAILABLE karein
            Driver driver = existingShipment.getDriver();
            if (driver != null) {
                driver.setStatus("AVAILABLE");
                driverRepository.save(driver);

                // 2. Trip status ko COMPLETED karein
                Optional<Trip> activeTrip = tripRepository.findByDriverIdAndStatus(driver.getId(), "ACTIVE");
                if (activeTrip.isPresent()) {
                    Trip trip = activeTrip.get();
                    trip.setStatus("COMPLETED");
                    trip.setEndDate(LocalDateTime.now());
                    
                    // Vehicle status release karein
                    if (trip.getVehicle() != null) {
                        Vehicle vehicle = trip.getVehicle();
                        vehicle.setStatus("AVAILABLE");
                        vehicleRepository.save(vehicle);
                    }
                    tripRepository.save(trip);
                }
            }

            // 🆕 3. BRIDGE TABLE (trip_shipment) BHI UPDATE KAREIN:
            Optional<TripShipment> tripShipmentOpt = tripShipmentRepository.findByShipmentId(id);
            if (tripShipmentOpt.isPresent()) {
                TripShipment ts = tripShipmentOpt.get();
                ts.setDeliveryStatus("DELIVERED");
                // Agar model mein deliveredAt field hai:
                // ts.setDeliveredAt(LocalDateTime.now());
                tripShipmentRepository.save(ts);
            }

        } else if ("ON_GOING".equalsIgnoreCase(newStatus)) {
            existingShipment.setDispatchedAt(LocalDateTime.now());
        }

        return shipmentRepository.save(existingShipment);
    }
}

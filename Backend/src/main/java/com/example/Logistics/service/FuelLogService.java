package com.example.Logistics.service;

import com.example.Logistics.model.FuelLog;
import com.example.Logistics.model.Trip;
import com.example.Logistics.model.TripShipment;
import com.example.Logistics.repository.FuelLogRepository;
import com.example.Logistics.repository.TripRepository;
import com.example.Logistics.repository.TripShipmentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FuelLogService {

    @Autowired
    private FuelLogRepository fuelLogRepository;

    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private TripShipmentRepository tripShipmentRepository;

    // Create
    public FuelLog addFuelLog(FuelLog fuelLog) {
        if (fuelLog.getLoggedAt() == null) {
            fuelLog.setLoggedAt(LocalDateTime.now());
        }
        return fuelLogRepository.save(fuelLog);
    }

    // Read
    public List<FuelLog> getAllFuelLogs() {
        return fuelLogRepository.findAll();
    }

    public Page<FuelLog> getAllFuelLogsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return fuelLogRepository.findAll(pageable);
    }

    public Optional<FuelLog> getFuelLogById(Long id) {
        return fuelLogRepository.findById(id);
    }

    public List<FuelLog> getFuelLogsByTripId(Long tripId) {
        return fuelLogRepository.findByTripId(tripId);
    }

    // Update (Admin)
    public FuelLog updateFuelLog(long id, FuelLog updatedDetails) {
        FuelLog existingLog = fuelLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fuel log not found with id: " + id));

        existingLog.setLitersFilled(updatedDetails.getLitersFilled());
        existingLog.setTotalAmount(updatedDetails.getTotalAmount());
        existingLog.setStationName(updatedDetails.getStationName());
        existingLog.setTrip(updatedDetails.getTrip());

        return fuelLogRepository.save(existingLog);
    }

    // Delete
    public void deleteFuelLog(long id) {
        if (!fuelLogRepository.existsById(id)) {
            throw new RuntimeException("Fuel log not found with id: " + id);
        }
        fuelLogRepository.deleteById(id);
    }

    // ⛽ Submit Driver Fuel Log (Main Method for Driver App)
    public FuelLog submitDriverFuelLog(Long tripId, double actualDistance, boolean refueled, Double litersFilled, String stationName, Double pricePerLiter) {
        
        // 🎯 Direct trip search. Agar na mile (shipment ID case), to TripShipment join table se trip nikalen.
        Trip trip = tripRepository.findById(tripId)
                .orElseGet(() -> tripShipmentRepository.findByShipmentId(tripId)
                        .map(ts -> ts.getTrip())
                        .orElseThrow(() -> new RuntimeException("Trip or Shipment relation not found with ID: " + tripId)));

        List<FuelLog> logs = fuelLogRepository.findByTripId(trip.getId());
        FuelLog fuelLog = logs.isEmpty() ? new FuelLog() : logs.get(0);

        fuelLog.setTrip(trip);
        fuelLog.setActualDistance(actualDistance);
        fuelLog.setLoggedAt(LocalDateTime.now());

        double rate = (pricePerLiter != null && pricePerLiter > 0) ? pricePerLiter : 270.0;
        double vehicleKmPerLiter = 10.0;

        double estimatedLitersConsumed = actualDistance / vehicleKmPerLiter;
        double tripBaseFuelCost = estimatedLitersConsumed * rate;

        if (refueled && litersFilled != null && litersFilled > 0) {
            fuelLog.setLitersFilled(litersFilled);
            fuelLog.setStationName(stationName != null && !stationName.trim().isEmpty() ? stationName : "Local Station");

            double midTripRefuelCost = litersFilled * rate;
            double totalTripCost = tripBaseFuelCost + midTripRefuelCost;

            fuelLog.setTotalAmount(totalTripCost);
        } else {
            fuelLog.setLitersFilled(0.0);
            fuelLog.setStationName("Existing Tank Fuel Used");
            fuelLog.setTotalAmount(tripBaseFuelCost);
        }

        return fuelLogRepository.save(fuelLog);
    }
}
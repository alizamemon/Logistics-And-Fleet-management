package com.example.Logistics.service;

import com.example.Logistics.model.MaintenanceLog;
import com.example.Logistics.model.Vehicle;
import com.example.Logistics.repository.MaintenanceLogRepository;
import com.example.Logistics.repository.VehicleRepository;
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
public class MaintenanceLogService {

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    @Autowired
    private VehicleRepository vehicleRepository; 

    // Create (Manual Entry by Admin)
    @Transactional
    public MaintenanceLog addMaintenanceLog(MaintenanceLog log) {
        log.setMaintenanceDate(LocalDateTime.now());

        // Vehicle Fetch & Status change to IN_MAINTENANCE
        if (log.getVehicle() != null && log.getVehicle().getId() != null) {
            Vehicle vehicle = vehicleRepository.findById(log.getVehicle().getId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + log.getVehicle().getId()));

            vehicle.setStatus("IN_MAINTENANCE");
            vehicleRepository.save(vehicle);
            log.setVehicle(vehicle);
        }

        return maintenanceLogRepository.save(log);
    }

    // Read
    public List<MaintenanceLog> getAllMaintenanceLogs() {
        return maintenanceLogRepository.findAll();
    }

    public Page<MaintenanceLog> getAllMaintenanceLogsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return maintenanceLogRepository.findAll(pageable);
    }

    public Optional<MaintenanceLog> getMaintenanceLogById(Long id) {
        return maintenanceLogRepository.findById(id);
    }

    public List<MaintenanceLog> getMaintenanceHistoryByVehicleId(Long vehicleId) {
        return maintenanceLogRepository.findByVehicleIdOrderByMaintenanceDateDesc(vehicleId);
    }

    // Update (General Details)
    public MaintenanceLog updateMaintenanceLog(Long id, MaintenanceLog updatedDetails) {
        MaintenanceLog existingLog = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance log not found with id: " + id));

        existingLog.setDescription(updatedDetails.getDescription());
        existingLog.setCost(updatedDetails.getCost());
        existingLog.setMaintenanceDate(LocalDateTime.now());
        if (updatedDetails.getVehicle() != null) {
            existingLog.setVehicle(updatedDetails.getVehicle());
        }

        return maintenanceLogRepository.save(existingLog);
    }

    // 🎯 NEW METHOD: Settle Bill & Release Vehicle back to AVAILABLE
    @Transactional
    public MaintenanceLog settleMaintenanceBill(Long id, double finalCost) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance log not found with id: " + id));

        log.setCost(finalCost);
        log.setMaintenanceDate(LocalDateTime.now());

        // Vehicle Release Logic
        Vehicle vehicle = log.getVehicle();
        if (vehicle != null) {
            vehicle.setStatus("AVAILABLE");
            vehicleRepository.save(vehicle);
        }

        return maintenanceLogRepository.save(log);
    }

    // Delete
    public void deleteMaintenanceLog(Long id) {
        if (!maintenanceLogRepository.existsById(id)) {
            throw new RuntimeException("Maintenance log not found with id: " + id);
        }
        maintenanceLogRepository.deleteById(id);
    }
}
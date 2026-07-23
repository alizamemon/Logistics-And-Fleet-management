package com.example.Logistics.service;

import com.example.Logistics.model.Shipment;
import com.example.Logistics.model.ShipmentTrackingLog;
import com.example.Logistics.repository.ShipmentRepository;
import com.example.Logistics.repository.ShipmentTrackingLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ShipmentTrackingLogService {

    @Autowired
    private ShipmentTrackingLogRepository shipmentTrackingLogRepository;

    @Autowired
    private ShipmentRepository shipmentRepository; // 👈 1. Added missing ShipmentRepository

    // Create
   public ShipmentTrackingLog addLog(ShipmentTrackingLog log) {
    if (log.getShipment() == null || log.getShipment().getId() == null) {
        throw new RuntimeException("Shipment ID is required for log");
    }

    Long shipmentId = log.getShipment().getId();
    Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + shipmentId));

    log.setShipment(shipment);

    if (log.getTimestamp() == null) {
        log.setTimestamp(java.time.LocalDateTime.now());
    }

    return shipmentTrackingLogRepository.save(log);
}

    // Read
    public List<ShipmentTrackingLog> getAllLogs() {
        return shipmentTrackingLogRepository.findAll();
    }

    public Page<ShipmentTrackingLog> getAllLogsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return shipmentTrackingLogRepository.findAll(pageable);
    }

    public Optional<ShipmentTrackingLog> getLogById(Long id) {
        return shipmentTrackingLogRepository.findById(id);
    }

    public List<ShipmentTrackingLog> getLogsByShipmentId(Long shipmentId) {
        return shipmentTrackingLogRepository.findByShipmentIdOrderByTimestampDesc(shipmentId);
    }

    // Delete
    public void deleteLog(Long id) {
        if (!shipmentTrackingLogRepository.existsById(id)) {
            throw new RuntimeException("Tracking log not found with id: " + id);
        }
        shipmentTrackingLogRepository.deleteById(id);
    }

    // Update & Auto Log Creation
    public Shipment updateShipmentStatus(Long shipmentId, String status) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));
        
        shipment.setStatus(status);
        Shipment savedShipment = shipmentRepository.save(shipment);

        // 🎯 AUTOMATIC TRACKING LOG ENTRY
        if ("DELIVERED".equalsIgnoreCase(status)) {
            ShipmentTrackingLog log = new ShipmentTrackingLog();
            log.setShipment(savedShipment);
            log.setLocationCity(savedShipment.getDeliveryCity());
            log.setStatusActivity("Parcel successfully delivered to " + savedShipment.getDeliveryCity());
            log.setTimestamp(java.time.LocalDateTime.now());

            // 👈 2. Fixed repository name matching @Autowired variable
            shipmentTrackingLogRepository.save(log); 
        }

        return savedShipment;
    }
}
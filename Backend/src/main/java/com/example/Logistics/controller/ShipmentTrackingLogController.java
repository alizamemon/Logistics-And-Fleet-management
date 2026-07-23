package com.example.Logistics.controller;

import com.example.Logistics.model.ShipmentTrackingLog;
import com.example.Logistics.service.ShipmentTrackingLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking-logs")
public class ShipmentTrackingLogController {

    @Autowired
    private ShipmentTrackingLogService trackingLogService;

    //create
    @PostMapping
        @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ShipmentTrackingLog> createTrackingLog(@RequestBody ShipmentTrackingLog log) {
        ShipmentTrackingLog savedLog = trackingLogService.addLog(log);
        return ResponseEntity.ok().body(savedLog);
    }

    //read
    @GetMapping
    public ResponseEntity<List<ShipmentTrackingLog>> getAllTrackingLogs(){
        List<ShipmentTrackingLog> logs=trackingLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<ShipmentTrackingLog>> getAllTrackingLogsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<ShipmentTrackingLog> logsPage = trackingLogService.getAllLogsPaged(page, size);
        return ResponseEntity.ok(logsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentTrackingLog> getTrackingLogById(@PathVariable long id) {
        return trackingLogService.getLogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<List<ShipmentTrackingLog>> getLogsByShipmentId(@PathVariable long shipmentId) {
        List<ShipmentTrackingLog> history = trackingLogService.getLogsByShipmentId(shipmentId);
        return ResponseEntity.ok(history);
    }

    //delete
    @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteTrackingLog(@PathVariable Long id) {
        trackingLogService.deleteLog(id);
        return ResponseEntity.ok().build();
    }

}

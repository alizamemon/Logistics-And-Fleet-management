package com.example.Logistics.controller;

import com.example.Logistics.model.MaintenanceLog;
import com.example.Logistics.service.MaintenanceLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-logs")
public class MaintenanceLogController {

    @Autowired
    private MaintenanceLogService maintenanceLogService;

    // create
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MaintenanceLog> createMaintenanceLog(@RequestBody MaintenanceLog log){
        MaintenanceLog savedLog = maintenanceLogService.addMaintenanceLog(log);
        return ResponseEntity.ok().body(savedLog);
    }

    // read
    @GetMapping
    public ResponseEntity<List<MaintenanceLog>> getAllMaintenanceLogs() {
        List<MaintenanceLog> logs = maintenanceLogService.getAllMaintenanceLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<MaintenanceLog>> getAllMaintenanceLogsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<MaintenanceLog> logsPage = maintenanceLogService.getAllMaintenanceLogsPaged(page, size);
        return ResponseEntity.ok(logsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceLog> getMaintenanceLogById(@PathVariable long id){
        return maintenanceLogService.getMaintenanceLogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceLog>> getMaintenanceHistoryByVehicleId(@PathVariable Long vehicleId) {
        List<MaintenanceLog> history = maintenanceLogService.getMaintenanceHistoryByVehicleId(vehicleId);
        return ResponseEntity.ok(history);
    }

    // update
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MaintenanceLog> updateMaintenanceLog(@PathVariable Long id, @RequestBody MaintenanceLog logDetails) {
        MaintenanceLog updatedLog = maintenanceLogService.updateMaintenanceLog(id, logDetails);
        return ResponseEntity.ok(updatedLog);
    }

    // 🎯 NEW ENDPOINT: Settle Bill & Release Vehicle
    @PutMapping("/{id}/settle")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MaintenanceLog> settleMaintenanceBill(
            @PathVariable Long id, 
            @RequestParam double cost
    ) {
        MaintenanceLog settledLog = maintenanceLogService.settleMaintenanceBill(id, cost);
        return ResponseEntity.ok(settledLog);
    }

    // Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteMaintenanceLog(@PathVariable Long id) {
        maintenanceLogService.deleteMaintenanceLog(id);
        return ResponseEntity.ok().build();
    }
}
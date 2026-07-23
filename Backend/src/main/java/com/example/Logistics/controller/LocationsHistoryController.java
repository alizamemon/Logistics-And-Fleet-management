package com.example.Logistics.controller;

import com.example.Logistics.model.LocationsHistory;
import com.example.Logistics.service.LocationsHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location-history")
@CrossOrigin(origins = "*") // CrossOrigin agar required ho
public class LocationsHistoryController {

    @Autowired
    private LocationsHistoryService locationsHistoryService;

    // Create Log
    @PostMapping
    public ResponseEntity<LocationsHistory> addLocationLog(@RequestBody LocationsHistory log) {
        LocationsHistory savedLog = locationsHistoryService.addLocationLog(log);
        return ResponseEntity.ok().body(savedLog);
    }

    // Read All (Unpaged List)
    @GetMapping("/all")
    public ResponseEntity<List<LocationsHistory>> getAllHistoryLogs() {
        List<LocationsHistory> logs = locationsHistoryService.getAllHistoryLogs();
        return ResponseEntity.ok(logs);
    }

    // 📍 Main Paged & Filtered Endpoint with ORDER BY id DESC
    @GetMapping
    public ResponseEntity<Page<LocationsHistory>> getLocationHistoryLogs(
            @RequestParam(required = false) Long tripId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<LocationsHistory> logsPage = locationsHistoryService.getFilteredLogsPaged(tripId, page, size);
        return ResponseEntity.ok(logsPage);
    }

    // Read by Trip ID (Unpaged)
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<LocationsHistory>> getHistoryByTripId(@PathVariable Long tripId) {
        List<LocationsHistory> tripHistory = locationsHistoryService.getHistoryByTripId(tripId);
        return ResponseEntity.ok(tripHistory);
    }
}
package com.example.Logistics.controller;


import com.example.Logistics.model.TripShipment;
import com.example.Logistics.service.TripShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trip-shipments")
public class TripShipmentController {

    @Autowired
    private TripShipmentService tripShipmentService;

    //create
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<TripShipment> createTripShipment(@RequestBody TripShipment tripShipment) {
        TripShipment savedMapping = tripShipmentService.createTripShipment(tripShipment);
        return ResponseEntity.ok(savedMapping);
    }

    //read
    @GetMapping
    public ResponseEntity<List<TripShipment>> getAllTripShipments() {
        List<TripShipment> mappings = tripShipmentService.getAllTripShipments();
        return ResponseEntity.ok(mappings);
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<TripShipment>> getShipmentsByTripId(@PathVariable long tripId) {
        List<TripShipment> shipments = tripShipmentService.getShipmentsByTripId(tripId);
        return ResponseEntity.ok(shipments);
    }

    //delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> removeShipmentFromTrip(@PathVariable Long id) {
        tripShipmentService.removeShipmentFromTrip(id);
        return ResponseEntity.ok().build();
    }

}

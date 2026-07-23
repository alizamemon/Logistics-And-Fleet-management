package com.example.Logistics.controller;

import com.example.Logistics.model.Incident;
import com.example.Logistics.model.Shipment;
import com.example.Logistics.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    //CREATE
    @PostMapping
       // @PreAuthorize("hasAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Shipment> createShipment(@RequestBody Shipment shipment) {
        Shipment savedShipment = shipmentService.createShipment(shipment);
        return ResponseEntity.ok().body(savedShipment);
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {
        List<Shipment> shipments = shipmentService.getAllShipments();
        return ResponseEntity.ok(shipments);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Shipment>> getAllShipmentsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<Shipment> shipmentsPage = shipmentService.getAllShipmentsPaged(page, size);
        return ResponseEntity.ok(shipmentsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shipment> getShipmentById(@PathVariable long id) {
        return shipmentService.getShipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<Shipment> getShipmentByTrackingNumber(@PathVariable String trackingNumber) {
        return shipmentService.getShipmentByTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //update
  @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'DRIVER')")
    public ResponseEntity<Shipment> updateShipmentStatus(@PathVariable long id, @RequestParam String newStatus) {
        Shipment updatedShipment = shipmentService.updateShipmentStatus(id, newStatus);
        return ResponseEntity.ok(updatedShipment);
    }

    //Delete
    @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Void> deleteShipment(@PathVariable long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.ok().build();
    }

    // 🆕 Auto dispatch (FIFO) to the first available driver
    @PutMapping("/{id}/assign-driver")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Shipment> assignToFirstAvailableDriver(@PathVariable long id) {
        Shipment assignedShipment = shipmentService.assignToFirstAvailableDriver(id);
        return ResponseEntity.ok(assignedShipment);
    }

    @GetMapping("/driver/requests/{userId}")
    @PreAuthorize("hasAuthority('DRIVER')")
    public ResponseEntity<List<Shipment>> getDriverRequests(@PathVariable Long userId) {
        List<Shipment> requests = shipmentService.getPendingRequestsForDriver(userId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/accept/{shipmentId}/{userId}")
    public ResponseEntity<?> acceptShipment(@PathVariable Long shipmentId, @PathVariable Long userId) {
        try {
            Shipment updatedShipment = shipmentService.acceptShipment(shipmentId, userId);
            return ResponseEntity.ok(updatedShipment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/decline/{shipmentId}")
    public ResponseEntity<?> declineShipment(@PathVariable Long shipmentId) {
        try {
            Shipment updatedShipment = shipmentService.declineShipment(shipmentId);
            return ResponseEntity.ok(updatedShipment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/driver/active/{userId}")
    @PreAuthorize("hasAuthority('DRIVER')")
    public ResponseEntity<List<Shipment>> getActiveTrips(@PathVariable Long userId) {
        List<Shipment> activeTrips = shipmentService.getActiveTripsForDriver(userId);
        return ResponseEntity.ok(activeTrips);
    }

    @GetMapping("/driver/all/{userId}")
    @PreAuthorize("hasAuthority('DRIVER')")
    public ResponseEntity<List<Shipment>> getAllDriverShipments(@PathVariable Long userId) {
        List<Shipment> allShipments = shipmentService.getAllShipmentsForDriver(userId);
        return ResponseEntity.ok(allShipments);
    }


}

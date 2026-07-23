package com.example.Logistics.controller;


import com.example.Logistics.model.Incident;
import com.example.Logistics.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incident")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    //create
    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident){
        Incident savedIncident= incidentService.reportIncident(incident);
        return ResponseEntity.ok(savedIncident);
    }

    //read
    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(){
        List<Incident> incidents= incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Incident>> getAllIncidentsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<Incident> incidentsPage = incidentService.getAllIncidentsPaged(page, size);
        return ResponseEntity.ok(incidentsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable long id){
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Incident>> getIncidentsByTripId(@PathVariable Long tripId) {
        List<Incident> tripIncidents = incidentService.getIncidentsByTripId(tripId);
        return ResponseEntity.ok(tripIncidents);
    }

    //update
    @PutMapping("/{id}")
      @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Incident> updateIncident(@PathVariable Long id, @RequestBody Incident incidentDetails) {
        Incident updatedIncident = incidentService.updateIncident(id, incidentDetails);
        return ResponseEntity.ok(updatedIncident);
    }

    //delete
    @DeleteMapping("/{id}")
      @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id) {
        Incident resolved = incidentService.resolveIncident(id);
        return ResponseEntity.ok(resolved);
    }

    // ➕ Shipment ID endpoint:
    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<List<Incident>> getIncidentsByShipmentId(@PathVariable Long shipmentId) {
        List<Incident> shipmentIncidents = incidentService.getIncidentsByShipmentId(shipmentId);
        return ResponseEntity.ok(shipmentIncidents);
    }
}

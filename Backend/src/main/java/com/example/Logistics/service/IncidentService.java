package com.example.Logistics.service;

import com.example.Logistics.model.Incident;
import com.example.Logistics.repository.IncidentRepository;
import com.example.Logistics.repository.TripShipmentRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private TripShipmentRepository tripShipmentRepository; // 👈 1. Added repository dependency

    // Create
    public Incident reportIncident(Incident incident) {
        // 👈 2. Automatic Trip resolution if shipment is provided but trip is null
        if (incident.getTrip() == null && incident.getShipment() != null && incident.getShipment().getId() != null) {
            tripShipmentRepository.findByShipmentId(incident.getShipment().getId())
                    .ifPresent(ts -> incident.setTrip(ts.getTrip()));
        }

        return incidentRepository.save(incident);
    }

    // Read
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Page<Incident> getAllIncidentsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return incidentRepository.findAll(pageable);
    }

    public Optional<Incident> getIncidentById(Long id) {
        return incidentRepository.findById(id);
    }

    public List<Incident> getUnresolvedIncidents() {
        return incidentRepository.findByResolvedFalse();
    }

    public List<Incident> getIncidentsByTripId(Long tripId) {
        return incidentRepository.findByTripId(tripId);
    }

    // Update
    public Incident updateIncident(Long id, Incident updatedDetails) {
        Incident existingIncident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + id));

        existingIncident.setIncidentType(updatedDetails.getIncidentType());
        existingIncident.setDescription(updatedDetails.getDescription());
        existingIncident.setResolved(updatedDetails.isResolved());
        existingIncident.setTrip(updatedDetails.getTrip());
        
        // Shipment update field
        existingIncident.setShipment(updatedDetails.getShipment());

        return incidentRepository.save(existingIncident);
    }

    // Shipment ID lookup method:
    public List<Incident> getIncidentsByShipmentId(Long shipmentId) {
        return incidentRepository.findByShipmentId(shipmentId);
    }

    // Delete
    public void deleteIncident(Long id) {
        if (!incidentRepository.existsById(id)) {
            throw new RuntimeException("Incident not found with id: " + id);
        }
        incidentRepository.deleteById(id);
    }

    // Resolve Incident Logic (Admin action)
    @Transactional
    public Incident resolveIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + id));

        incident.setResolved(true);
        return incidentRepository.save(incident);
    }
}
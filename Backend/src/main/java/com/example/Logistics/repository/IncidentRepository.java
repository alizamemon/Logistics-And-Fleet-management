package com.example.Logistics.repository;

import com.example.Logistics.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // Unresolved incidents
    List<Incident> findByResolvedFalse();

    // specific trip incidents
    List<Incident> findByTripId(Long tripId);

    List<Incident> findByShipmentId(Long shipmentId);
}

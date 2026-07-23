package com.example.Logistics.repository;

import com.example.Logistics.model.TripShipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripShipmentRepository extends JpaRepository<TripShipment, Long> {

    List<TripShipment> findByTripId(Long tripId);
    
   Optional<TripShipment> findByShipmentId(Long shipmentId);

    
}

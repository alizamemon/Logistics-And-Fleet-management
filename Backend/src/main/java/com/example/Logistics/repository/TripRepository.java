package com.example.Logistics.repository;

import com.example.Logistics.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByStatus(String status);
    long countByVehicleIdAndStatus(Long vehicleId, String status);
    Optional<Trip> findByDriverIdAndStatus(Long driverId, String status);
}
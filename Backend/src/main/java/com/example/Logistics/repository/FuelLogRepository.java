package com.example.Logistics.repository;

import com.example.Logistics.model.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {

    // total cost of fuel used by specific vehicle on specific trip
    List<FuelLog> findByTripId(Long tripId);
}
package com.example.Logistics.repository;

import com.example.Logistics.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    List<Vehicle> findByStatus(String status);

    @Query(value = "SELECT * FROM vehicle v WHERE v.status = 'AVAILABLE' AND v.capacity >= :weight ORDER BY v.capacity ASC LIMIT 1", nativeQuery = true)
    Optional<Vehicle> findSuitableAvailableVehicle(@Param("weight") Double weight);
}

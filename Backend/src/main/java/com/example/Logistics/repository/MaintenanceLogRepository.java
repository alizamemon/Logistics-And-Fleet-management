package com.example.Logistics.repository;

import com.example.Logistics.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {

    // maintenance history of specific vehicle id
    List<MaintenanceLog> findByVehicleIdOrderByMaintenanceDateDesc(Long vehicleId);
}
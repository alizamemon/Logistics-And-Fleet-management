package com.example.Logistics.repository;

import com.example.Logistics.model.ShipmentTrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipmentTrackingLogRepository extends JpaRepository<ShipmentTrackingLog, Long> {

    List<ShipmentTrackingLog> findByShipmentIdOrderByTimestampDesc(Long shipmentId);
}


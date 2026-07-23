package com.example.Logistics.repository;

import com.example.Logistics.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    List<Shipment> findByStatus(String status);

    List<Shipment> findByDriverIdAndStatus(Long driverId, String status);

    List<Shipment> findByDriverId(Long driverId);

    List<Shipment> findByDeliveryCityAndStatus(String deliveryCity, String status);
}
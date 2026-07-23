package com.example.Logistics.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_tracking_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTrackingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "status_activity", nullable = false)
    private String statusActivity; // e.g., "Picked up from Karachi Hub"

    @Column(name = "location_city", nullable = false)
    private String locationCity; // e.g., "Karachi", "Sukkur"

    @Column(name = "timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();

    // Many-to-One: Ek single shipment ke raste mein kai logs banenge
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "trackingLogs"}) // 👈 Added to prevent infinite loop
    private Shipment shipment;
}
package com.example.Logistics.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_shipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripShipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-One: bht sari shipments ki ek hi trip id ho skti
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // 👈 Added to prevent JSON recursion/proxy error
    private Trip trip;

    // Many-to-One: Kai saari rows alag alag bar mein ek hi Shipment se connect ho sakti hain
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // 👈 Added
    private Shipment shipment;

    @Column(name = "loaded_at")
    private LocalDateTime loadedAt = LocalDateTime.now();

    @Column(name = "delivery_status")
    private String deliveryStatus; // e.g., "LOADED", "OFFLOADED", "DELIVERED"
}
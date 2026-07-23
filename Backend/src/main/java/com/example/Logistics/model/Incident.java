package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_type", nullable = false)
    private String incidentType;

    @Column(nullable = false)
    private String description;

    @Column(name = "reported_at")
    private LocalDateTime reportedAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean resolved = false;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = true)
    private Trip trip;

    @ManyToOne
    @JoinColumn(name = "shipment_id", nullable = true)
    private Shipment shipment;
}
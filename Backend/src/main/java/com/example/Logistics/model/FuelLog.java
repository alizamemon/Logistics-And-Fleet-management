package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "liters_filled", nullable = false)
    private double litersFilled;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;

    @Column(name = "logged_at")
    private LocalDateTime loggedAt = LocalDateTime.now();

    @Column(name = "station_name")
    private String stationName; // e.g., "PSO Service Station, Sukkur" ya "Shell Pump, Hyderabad"

    @Column(name = "actual_distance", nullable = true)
    private Double actualDistance;

    // Many-to-One: Ek lambe trip par driver raste mein 2 ya 3 baar bhi fuel dalwa sakta hai
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
}
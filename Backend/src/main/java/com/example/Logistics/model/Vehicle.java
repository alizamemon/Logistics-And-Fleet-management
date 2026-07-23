package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_number", unique = true, nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Double capacity;

    @Column(nullable = false)
    private String status; //"AVAILABLE", "ON_TRIP", "MAINTENANCE"

}

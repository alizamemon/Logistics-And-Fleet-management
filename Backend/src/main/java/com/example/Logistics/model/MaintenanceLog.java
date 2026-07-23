package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description; 

    @Column(nullable = false)
    private double cost; // Total repair cost

    @Column(name = "maintenance_date")
    private LocalDateTime maintenanceDate;

    // Many-to-One: Ek gari (Vehicle) apni puri life mein kai baar repair workshop ja sakti hai
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;
}
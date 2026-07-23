package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_number", unique = true, nullable = false)
    private String tripNumber;

    @Column(name = "source_city", nullable = false)
    private String sourceCity;

    @Column(name = "destination_city", nullable = false)
    private String destinationCity;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(nullable = false)
    private String status; // e.g., "SCHEDULED", "ON_THE_WAY", "COMPLETED"


    // Many-to-One: Ek Vehicle (Truck) kai alag alag trips par ja sakta hai
    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = true)
    private Vehicle vehicle;

    // Many-to-One: Ek Driver kai alag alag trips laga sakta haia
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = true)
    private Driver driver;
}

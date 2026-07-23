package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "locations_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationsHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    private String location;

    @Column(name = "timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();

    // Many-to-One: Ek bade truck ke trip mein hazaron bar coordinates generate honge
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
}
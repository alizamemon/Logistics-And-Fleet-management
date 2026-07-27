package com.example.Logistics.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat; // 👈 Import this

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

  // Space wala pattern accept karega
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") 
@Column(name = "timestamp")
private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
}
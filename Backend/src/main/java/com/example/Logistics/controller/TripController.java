package com.example.Logistics.controller;

import com.example.Logistics.model.Trip;
import com.example.Logistics.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    //create
    @PostMapping
     @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip){
        Trip startedTrip = tripService.createTrip(trip);
        return ResponseEntity.ok(startedTrip);
    }

    //read
    @GetMapping
    public ResponseEntity<List<Trip>>   getAllTrips(){
        List<Trip> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Trip>> getAllTripsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<Trip> tripsPage = tripService.getAllTripsPaged(page, size);
        return ResponseEntity.ok(tripsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable long id){
        return tripService.getTripById(id)
                .map(trip-> ResponseEntity.ok(trip))
                .orElse(ResponseEntity.notFound().build());
    }

    //Admin assigns vehicle and driver to a trip
    @PutMapping("/{tripId}/assign-resources")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Trip> assignResources(
            @PathVariable Long tripId,   // part of url
            @RequestParam Long vehicleId, //filter or additional data
            @RequestParam Long driverId) {

        Trip updatedTrip = tripService.assignResourcesToTrip(tripId, vehicleId, driverId);
        return ResponseEntity.ok(updatedTrip);
    }

    //update status
    @PutMapping("/{id}/complete")
     @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Trip> completeTrip(@PathVariable long id){
        Trip completedTrip = tripService.completeTrip(id);
        return ResponseEntity.ok(completedTrip);
    }
}

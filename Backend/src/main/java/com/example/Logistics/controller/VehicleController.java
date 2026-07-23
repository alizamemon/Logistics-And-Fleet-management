package com.example.Logistics.controller;

import com.example.Logistics.model.Vehicle;
import com.example.Logistics.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    //create
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle){
        Vehicle savedVehicle = vehicleService.addVehicle(vehicle);
        return ResponseEntity.ok().body(savedVehicle);
    }

    //read
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<Vehicle>> getAllVehicles(){
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok().body(vehicles);
    }

    @GetMapping("/paged")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Page<Vehicle>> getAllVehiclesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<Vehicle> vehiclesPage = vehicleService.getAllVehiclesPaged(page, size);
        return ResponseEntity.ok(vehiclesPage);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable long id){
        return vehicleService.getVehicleById(id)
                .map(vehicle -> ResponseEntity.ok(vehicle))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<Vehicle>> getAllAvailableVehicles(){
        List<Vehicle> availableVehicles = vehicleService.getAvailableVehicles();
        return ResponseEntity.ok().body(availableVehicles);
    }

    //Update
    @PutMapping("/{id}")
   //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable long id, @RequestBody Vehicle vehicleDetails){
        Vehicle updateVehicle=  vehicleService.updateVehicle(id, vehicleDetails);
        return ResponseEntity.ok().body(updateVehicle);
    }

    //Delete
    @DeleteMapping("/{id}")
   @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable long id){
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok().build();
    }
}

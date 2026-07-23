package com.example.Logistics.controller;


import com.example.Logistics.model.Driver;
import com.example.Logistics.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    @Autowired
    private DriverService driverService;

    //create
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Driver> createDriver(@RequestBody Driver driver){
        Driver savedDriver = driverService.addDriver(driver);
        return ResponseEntity.ok(savedDriver);
    }

    //read
    @GetMapping
    public ResponseEntity<List<Driver>>  getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/paged")               //{{base_url}}/api/driver/paged?page=0&size=5
    public ResponseEntity<Page<Driver>> getAllDriversPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<Driver> driversPage = driverService.getAllDriversPaged(page, size);
        return ResponseEntity.ok(driversPage);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        List<Driver> availableDrivers= driverService.getAvailableDrivers();
        return ResponseEntity.ok(availableDrivers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DRIVER') or hasAuthority('ADMIN')")
    public ResponseEntity<Driver> getDriverById(@PathVariable long id){
        return driverService.getDriverById(id)
                .map(driver -> ResponseEntity.ok(driver)) //if driver found
                .orElse(ResponseEntity.notFound().build());

    }

    //update
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Driver> updateDriver(@PathVariable long id, @RequestBody Driver driverDetails){
        Driver updateDriver= driverService.updateDriver(id, driverDetails);
        return ResponseEntity.ok(updateDriver);
    }

    //delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteDriver(@PathVariable long id){
        driverService.deleteDriver(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/onboard/{userId}")
    public ResponseEntity<Driver> onboardDriver(
            @PathVariable long userId, 
            @RequestParam String licenseNumber, 
            @RequestParam String phone) {
        Driver completedDriver = driverService.completeDriverProfile(userId, licenseNumber, phone);
        return ResponseEntity.ok(completedDriver);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('DRIVER') or hasAuthority('ADMIN')")
    public ResponseEntity<Driver> getDriverByUserId(@PathVariable long userId) {
        // Note: driverService mein findByUserId ya getDriverByUserId ka method hona chahiye 
        // jo "driverRepository.findByUserId(userId)" call karta ho.
        return driverService.getDriverByUserId(userId) 
                .map(driver -> ResponseEntity.ok(driver))
                .orElse(ResponseEntity.notFound().build());
    }
}

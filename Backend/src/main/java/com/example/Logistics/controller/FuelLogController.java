package com.example.Logistics.controller;

import com.example.Logistics.model.FuelLog;
import com.example.Logistics.service.FuelLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel-logs")
public class FuelLogController {

    @Autowired
    private FuelLogService fuelLogService;

    //create/add
    @PostMapping
    public ResponseEntity<FuelLog> createFuelLog(@RequestBody FuelLog fuelLog){
        FuelLog savedLog = fuelLogService.addFuelLog(fuelLog);
        return ResponseEntity.ok(savedLog);
    }

    //read
    @GetMapping
    public ResponseEntity<List<FuelLog>> getAllFuelLogs(){
        List<FuelLog> fuelLogs = fuelLogService.getAllFuelLogs();
        return ResponseEntity.ok(fuelLogs);
    }

    @GetMapping("/paged")                            //{{base_url}}/api/fuel-logs/paged
    public ResponseEntity<Page<FuelLog>> getAllFuelLogsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<FuelLog> fuelLogsPage = fuelLogService.getAllFuelLogsPaged(page, size);
        return ResponseEntity.ok(fuelLogsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelLog> getFuelLogById(@PathVariable long id){
        return fuelLogService.getFuelLogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<FuelLog>> getFuelLogsByTripId(@PathVariable long tripId){
        List<FuelLog> fuelLogs = fuelLogService.getFuelLogsByTripId(tripId);
        return ResponseEntity.ok(fuelLogs);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<FuelLog> updateFuelLog(@PathVariable long id, @RequestBody FuelLog fuelLogDetails){
        FuelLog updatedLog = fuelLogService.updateFuelLog(id, fuelLogDetails);
        return ResponseEntity.ok(updatedLog);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteFuelLog(@PathVariable long id){
        fuelLogService.deleteFuelLog(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/submit-driver-log")
    public ResponseEntity<FuelLog> submitDriverLog(
            @RequestParam Long tripId,
            @RequestParam double actualDistance,
            @RequestParam boolean refueled,
            @RequestParam(required = false) Double litersFilled,
            @RequestParam(required = false) String stationName,
            @RequestParam(required = false, defaultValue = "270.0") Double pricePerLiter) {

        FuelLog savedLog = fuelLogService.submitDriverFuelLog(tripId, actualDistance, refueled, litersFilled, stationName, pricePerLiter);
        return ResponseEntity.ok(savedLog);
    }

}

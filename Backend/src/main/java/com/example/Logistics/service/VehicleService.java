package com.example.Logistics.service;

import com.example.Logistics.model.Vehicle;
import com.example.Logistics.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    //create
    public Vehicle addVehicle(Vehicle vehicle){
        if(vehicleRepository.findByVehicleNumber(vehicle.getVehicleNumber()).isPresent()){
            throw new RuntimeException("Vehicle already exists");
        }
        vehicle.setStatus("AVAILABLE");
        return vehicleRepository.save(vehicle);
    }

    //read
    public List<Vehicle> getAllVehicles(){
        return vehicleRepository.findAll();
    }

    public Page<Vehicle> getAllVehiclesPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return vehicleRepository.findAll(pageable);
    }

    public List<Vehicle> getAvailableVehicles(){
        return vehicleRepository.findByStatus("AVAILABLE");
    }

    public Optional<Vehicle> getVehicleById(Long id){
        return vehicleRepository.findById(id);
    }

   //update
    @Transactional 
    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle){
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));

        existingVehicle.setVehicleNumber(updatedVehicle.getVehicleNumber());
        existingVehicle.setModel(updatedVehicle.getModel());
        existingVehicle.setCapacity(updatedVehicle.getCapacity());
        existingVehicle.setStatus(updatedVehicle.getStatus());

        return vehicleRepository.save(existingVehicle);
    }

    //delete
    public void deleteVehicle(long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }
}

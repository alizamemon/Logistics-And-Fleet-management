package com.example.Logistics.service;

import com.example.Logistics.model.Driver;
import com.example.Logistics.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    //create
    public Driver addDriver(Driver driver){
        if(driverRepository.findByLicenseNumber( driver.getLicenseNumber()).isPresent()){
            throw new RuntimeException("Error: Driver already exists");
        }
        driver.setStatus("AVAILABLE");
        return driverRepository.save(driver);
    }

    //read
    public List<Driver> getAllDrivers(){
        return driverRepository.findAll();
    }

    public Page<Driver> getAllDriversPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return driverRepository.findAll(pageable);
    }

    public List<Driver> getAvailableDrivers(){
        return driverRepository.findByStatus("AVAILABLE");
    }

    public Optional<Driver> getDriverById(long id){
        return driverRepository.findById(id);
    }

    //update
    public Driver updateDriver(long id, Driver updatedDetails){
        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));

        existingDriver.setLicenseNumber(updatedDetails.getLicenseNumber());
        existingDriver.setStatus(updatedDetails.getStatus());
        return driverRepository.save(existingDriver);
    }

    public void deleteDriver(long id){
        if(!driverRepository.existsById(id)){
            throw new RuntimeException("Driver not found with id: " + id);
        }
        driverRepository.deleteById(id);
    }

    public Driver completeDriverProfile(long userId, String licenseNumber, String phone) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found for user ID: " + userId));

    
        driver.setLicenseNumber(licenseNumber);
        driver.setPhone(phone);
        
        driver.setStatus("AVAILABLE");

        return driverRepository.save(driver);
    }

    public Optional<Driver> getDriverByUserId(long userId) {
    return driverRepository.findByUserId(userId);
}


}

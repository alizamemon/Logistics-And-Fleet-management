package com.example.Logistics.repository;

import com.example.Logistics.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    Optional<Driver> findByPhone(String phone);

    List<Driver> findByStatus(String status);

    boolean existsByUserId(Long userId);

    Optional<Driver> findByUserId(Long userId);

    Optional<Driver> findFirstByStatus(String status);
}
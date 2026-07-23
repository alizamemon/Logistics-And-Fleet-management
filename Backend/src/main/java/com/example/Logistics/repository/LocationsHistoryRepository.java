package com.example.Logistics.repository;

import com.example.Logistics.model.LocationsHistory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationsHistoryRepository extends JpaRepository<LocationsHistory, Long> {

    List<LocationsHistory> findByTripIdOrderByTimestampAsc(Long tripId);

    Page<LocationsHistory> findByTripId(Long tripId, Pageable pageable);
}
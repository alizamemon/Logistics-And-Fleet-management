package com.example.Logistics.service;

import com.example.Logistics.model.LocationsHistory;
import com.example.Logistics.model.Trip;
import com.example.Logistics.model.Driver;
import com.example.Logistics.model.Vehicle;
import com.example.Logistics.model.Shipment;
import com.example.Logistics.repository.DriverRepository;
import com.example.Logistics.repository.LocationsHistoryRepository;
import com.example.Logistics.repository.ShipmentRepository;
import com.example.Logistics.repository.VehicleRepository;
import com.example.Logistics.repository.TripRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Sort;

@Service
public class LocationsHistoryService {

    @Autowired
    private LocationsHistoryRepository locationsHistoryRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private TripRepository tripRepository;

    // ⚡ Fast In-Memory City Coordinate Dictionary (No External Network Latency / API Rate Limits)
  private static final Map<String, double[]> CITY_COORDINATES_MAP = new HashMap<>();

static {
    // Major Metros & Capital
    CITY_COORDINATES_MAP.put("karachi", new double[]{24.8607, 67.0011});
    CITY_COORDINATES_MAP.put("lahore", new double[]{31.5204, 74.3587});
    CITY_COORDINATES_MAP.put("islamabad", new double[]{33.6844, 73.0479});
    CITY_COORDINATES_MAP.put("rawalpindi", new double[]{33.5651, 73.0169});
    CITY_COORDINATES_MAP.put("faisalabad", new double[]{31.4504, 73.1350});
    CITY_COORDINATES_MAP.put("multan", new double[]{30.1575, 71.5249});
    CITY_COORDINATES_MAP.put("peshawar", new double[]{34.0151, 71.5249});
    CITY_COORDINATES_MAP.put("quetta", new double[]{30.1798, 66.9750});

    // Sindh Hubs & Transit Points
    CITY_COORDINATES_MAP.put("hyderabad", new double[]{25.3960, 68.3578});
    CITY_COORDINATES_MAP.put("khairpur", new double[]{27.5295, 68.7592});
    CITY_COORDINATES_MAP.put("sukkur", new double[]{27.7052, 68.8574});
    CITY_COORDINATES_MAP.put("moro", new double[]{26.6667, 68.0000});
    CITY_COORDINATES_MAP.put("nawabshah", new double[]{26.2483, 68.4096});
    CITY_COORDINATES_MAP.put("larkana", new double[]{27.5589, 68.2120});
    CITY_COORDINATES_MAP.put("mirpurkhas", new double[]{25.5269, 69.0111});
    CITY_COORDINATES_MAP.put("badin", new double[]{24.6559, 68.8383});
    CITY_COORDINATES_MAP.put("ghotki", new double[]{28.0044, 69.3162});

    // Punjab Hubs & Corridor Points
    CITY_COORDINATES_MAP.put("sahiwal", new double[]{30.6682, 73.1014});
    CITY_COORDINATES_MAP.put("gujranwala", new double[]{32.1617, 74.1883});
    CITY_COORDINATES_MAP.put("sialkot", new double[]{32.4945, 74.5229});
    CITY_COORDINATES_MAP.put("sargodha", new double[]{32.0836, 72.6711});
    CITY_COORDINATES_MAP.put("bahawalpur", new double[]{29.3544, 71.6911});
    CITY_COORDINATES_MAP.put("rahim yar khan", new double[]{28.4212, 70.2989});
    CITY_COORDINATES_MAP.put("rahimyar khan", new double[]{28.4212, 70.2989});
    CITY_COORDINATES_MAP.put("okara", new double[]{30.8100, 73.4597});
    CITY_COORDINATES_MAP.put("jhelum", new double[]{32.9405, 73.7276});
    CITY_COORDINATES_MAP.put("gujrat", new double[]{32.5742, 74.0754});

    // KPK & Northern Points
    CITY_COORDINATES_MAP.put("mardan", new double[]{34.1986, 72.0404});
    CITY_COORDINATES_MAP.put("abbottabad", new double[]{34.1688, 73.2215});
    CITY_COORDINATES_MAP.put("swat", new double[]{35.2227, 72.4258});
    CITY_COORDINATES_MAP.put("mingora", new double[]{34.7717, 72.3600});
    CITY_COORDINATES_MAP.put("nowshera", new double[]{34.0153, 71.9747});

    // Balochistan Points
    CITY_COORDINATES_MAP.put("gwadar", new double[]{25.1264, 62.3225});
    CITY_COORDINATES_MAP.put("hub", new double[]{24.9018, 66.8833});
    CITY_COORDINATES_MAP.put("khuzdar", new double[]{27.8164, 66.6057});
}

// 1. Create with Dynamic Live Telemetry & Geofence Support
public LocationsHistory addLocationLog(LocationsHistory log) {
    if (log.getTimestamp() == null) {
        log.setTimestamp(LocalDateTime.now());
    }

    // 🎯 FIX: Fetch full Trip entity from DB first so destinationCity, driver, vehicle are fully loaded!
    if (log.getTrip() != null && log.getTrip().getId() != null) {
        Trip dbTrip = tripRepository.findById(log.getTrip().getId()).orElse(null);
        if (dbTrip != null) {
            log.setTrip(dbTrip);
        }
    }

    // Set human-readable location text if missing
    if (log.getLocation() == null || log.getLocation().trim().isEmpty()) {
        if (log.getTrip() != null && log.getTrip().getDestinationCity() != null) {
            log.setLocation("En Route to " + log.getTrip().getDestinationCity());
        } else {
            log.setLocation("In Transit");
        }
    }

    // Save incoming coordinate log entry
    LocationsHistory savedLog = locationsHistoryRepository.save(log);

    // 🏁 Geofencing Logic Check
    try {
        Trip currentTrip = savedLog.getTrip();

        if (currentTrip != null && currentTrip.getDestinationCity() != null) {
            String targetCity = currentTrip.getDestinationCity();
            double[] targetCoordinates = getCityCoordinates(targetCity);

            double destinationLat = targetCoordinates[0];
            double destinationLng = targetCoordinates[1];

            // Precision Threshold (~4-5 km radius window)
            double threshold = 0.05;

            boolean isNearDestination = Math.abs(savedLog.getLatitude() - destinationLat) < threshold &&
                                       Math.abs(savedLog.getLongitude() - destinationLng) < threshold;

            if (isNearDestination && !"COMPLETED".equalsIgnoreCase(currentTrip.getStatus())) {

                // 1. Mark Driver as AVAILABLE
                if (currentTrip.getDriver() != null) {
                    Driver driver = currentTrip.getDriver();
                    driver.setStatus("AVAILABLE");
                    driverRepository.save(driver);

                    List<Shipment> activeShipments = shipmentRepository.findByDriverIdAndStatus(driver.getId(), "ON_GOING");
                    if (activeShipments != null && !activeShipments.isEmpty()) {
                        for (Shipment shipment : activeShipments) {
                            shipment.setStatus("DELIVERED");
                            shipment.setDeliveredAt(LocalDateTime.now());
                            shipmentRepository.save(shipment);
                        }
                    }
                }

                // 2. Mark Vehicle as AVAILABLE
                if (currentTrip.getVehicle() != null) {
                    Vehicle vehicle = currentTrip.getVehicle();
                    vehicle.setStatus("AVAILABLE");
                    vehicleRepository.save(vehicle);
                }

                // 3. Mark Trip as COMPLETED
                currentTrip.setStatus("COMPLETED");
                currentTrip.setEndDate(LocalDateTime.now());
                tripRepository.save(currentTrip);

                System.out.println("🏁 Geofence Triggered: Trip #" + currentTrip.getId() + " reached " + targetCity + "!");
            }
        }
    } catch (Exception e) {
        System.err.println("Geofence processing warning: " + e.getMessage());
    }

    return savedLog;
}

    // 🗺️ Dynamic Helper: Fast In-Memory Lookup
    private double[] getCityCoordinates(String city) {
        if (city == null || city.trim().isEmpty()) {
            return new double[]{30.6682, 73.1014}; // Default Sahiwal
        }
        String cleanCity = city.trim().toLowerCase();
        return CITY_COORDINATES_MAP.getOrDefault(cleanCity, new double[]{30.6682, 73.1014});
    }

    // 2. Read
    public List<LocationsHistory> getHistoryByTripId(Long tripId) {
        return locationsHistoryRepository.findByTripIdOrderByTimestampAsc(tripId);
    }

    public Page<LocationsHistory> getAllHistoryLogsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return locationsHistoryRepository.findAll(pageable);
    }

    // 3. Read All
    public List<LocationsHistory> getAllHistoryLogs() {
        return locationsHistoryRepository.findAll();
    }

    public Page<LocationsHistory> getFilteredLogsPaged(Long tripId, int page, int size) {
    // 💡 Always sort by 'id' DESC so new logs appear at top
    Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

    if (tripId != null) {
        return locationsHistoryRepository.findByTripId(tripId, pageable);
    }
    return locationsHistoryRepository.findAll(pageable);
}
}
package com.barberbooking.service;

import com.barberbooking.dto.AvailabilityResponse;
import com.barberbooking.model.Appointment;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.Service;
import com.barberbooking.model.WorkingHour;
import com.barberbooking.repository.AppointmentRepository;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.ServiceRepository;
import com.barberbooking.repository.WorkingHourRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;

@org.springframework.stereotype.Service
public class AvailabilityService {

    private final BarberShopRepository barberShopRepository;
    private final ServiceRepository serviceRepository;
    private final WorkingHourRepository workingHourRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityService(
            BarberShopRepository barberShopRepository,
            ServiceRepository serviceRepository,
            WorkingHourRepository workingHourRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.barberShopRepository = barberShopRepository;
        this.serviceRepository = serviceRepository;
        this.workingHourRepository = workingHourRepository;
        this.appointmentRepository = appointmentRepository;
    }

// =========================================================
// GET AVAILABLE APPOINTMENT TIMES
// =========================================================

    public AvailabilityResponse getAvailability(
            Long shopId,
            LocalDate date,
            List<Long> adultServiceIds,
            List<Long> childServiceIds,
            Integer adultCount,
            Integer childCount
    ) {

        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }

        if (date == null) {
            throw new IllegalArgumentException(
                    "Appointment date is required");
        }

        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Shop ID " + shopId + " not found"));

        // -----------------------------------------------------
        // Validate customer counts
        // -----------------------------------------------------

        int adults = adultCount == null ? 0 : adultCount;
        int children = childCount == null ? 0 : childCount;

        if (adults < 0 || children < 0) {
            throw new IllegalArgumentException(
                    "Adult and child counts cannot be negative");
        }

        if (adults + children <= 0) {
            throw new IllegalArgumentException(
                    "At least one adult or child is required");
        }

        // -----------------------------------------------------
        // Normalize service selections
        // -----------------------------------------------------

        List<Long> adultIds = adultServiceIds == null
                ? List.of()
                : adultServiceIds;

        List<Long> childIds = childServiceIds == null
                ? List.of()
                : childServiceIds;

        if (adults > 0 && adultIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one service for adults");
        }

        if (children > 0 && childIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one service for children");
        }

        if (adults == 0 && !adultIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Adult services cannot be selected when adult count is zero");
        }

        if (children == 0 && !childIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Child services cannot be selected when child count is zero");
        }

        validateServiceIds(adultIds);
        validateServiceIds(childIds);

        if (new HashSet<>(adultIds).size() != adultIds.size()) {
            throw new IllegalArgumentException(
                    "An adult service cannot be selected more than once");
        }

        if (new HashSet<>(childIds).size() != childIds.size()) {
            throw new IllegalArgumentException(
                    "A child service cannot be selected more than once");
        }

        // -----------------------------------------------------
        // Load all unique services
        // -----------------------------------------------------

        Set<Long> allIds = new HashSet<>();
        allIds.addAll(adultIds);
        allIds.addAll(childIds);

        List<Long> uniqueIds = new ArrayList<>(allIds);

        List<Service> services =
                serviceRepository.findAllById(uniqueIds);

        if (services.size() != uniqueIds.size()) {
            throw new IllegalArgumentException(
                    "One or more selected services were not found");
        }

        Map<Long, Service> serviceMap = new HashMap<>();

        for (Service service : services) {

            serviceMap.put(service.getId(), service);

            // Security: service must belong to requested shop.
            if (service.getBarberShop() == null
                    || service.getBarberShop().getId() == null
                    || !shopId.equals(service.getBarberShop().getId())) {

                throw new IllegalArgumentException(
                        "A selected service does not belong to this shop");
            }
        }

        // -----------------------------------------------------
        // Calculate adult duration
        // Adults can select Haircut and Beard Trim.
        // -----------------------------------------------------

        int adultDurationPerPerson = 0;

        for (Long id : adultIds) {

            Service service = serviceMap.get(id);

            String name = normalizeName(service.getName());

            if (!"haircut".equals(name)
                    && !"beard trim".equals(name)) {

                throw new IllegalArgumentException(
                        "This service is not available for adults: "
                                + service.getName());
            }

            adultDurationPerPerson += validateDuration(service);
        }

        // -----------------------------------------------------
        // Calculate child duration
        // Children can select Haircut only.
        // -----------------------------------------------------

        int childDurationPerPerson = 0;

        for (Long id : childIds) {

            Service service = serviceMap.get(id);

            if (!"haircut".equals(normalizeName(service.getName()))) {
                throw new IllegalArgumentException(
                        "Children can only select Haircut");
            }

            childDurationPerPerson += validateDuration(service);
        }

        // -----------------------------------------------------
        // Calculate total appointment duration
        // -----------------------------------------------------

        long calculatedDuration =
                ((long) adultDurationPerPerson * adults)
                        + ((long) childDurationPerPerson * children);

        if (calculatedDuration <= 0
                || calculatedDuration > Integer.MAX_VALUE) {

            throw new IllegalArgumentException(
                    "Invalid appointment duration");
        }

        int totalDuration = (int) calculatedDuration;

        // -----------------------------------------------------
        // Get working hours
        // -----------------------------------------------------

        DayOfWeek dayOfWeek = date.getDayOfWeek();

        WorkingHour workingHour =
                workingHourRepository
                        .findByBarberShopIdAndDayOfWeek(
                                shopId,
                                dayOfWeek.name())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Working hours not found for "
                                                + dayOfWeek.name()));

        if (Boolean.TRUE.equals(workingHour.getClosed())) {
            return new AvailabilityResponse(
                    date,
                    null,
                    null,
                    totalDuration,
                    List.of()
            );
        }

        LocalTime openingTime = workingHour.getOpeningTime();
        LocalTime closingTime = workingHour.getClosingTime();

        if (openingTime == null || closingTime == null) {
            throw new IllegalArgumentException(
                    "Working hours are not properly configured");
        }

        if (!closingTime.isAfter(openingTime)) {
            throw new IllegalArgumentException(
                    "The shop's configured working hours are invalid");
        }

        // -----------------------------------------------------
        // Get existing appointments
        // -----------------------------------------------------

        List<Appointment> appointments =
                appointmentRepository
                        .findByBarberShopIdAndAppointmentDateAndStatusNot(
                                shopId,
                                date,
                                "CANCELLED"
                        );

        // -----------------------------------------------------
        // Generate available slots
        // -----------------------------------------------------

        List<String> availableSlots = new ArrayList<>();

        LocalTime currentSlot = openingTime;

        while (!currentSlot.plusMinutes(totalDuration)
                .isAfter(closingTime)) {

            LocalTime proposedEnd =
                    currentSlot.plusMinutes(totalDuration);

            boolean conflict = false;

            for (Appointment appointment : appointments) {

                LocalTime existingStart =
                        appointment.getStartTime();

                LocalTime existingEnd =
                        appointment.getEndTime();

                boolean overlaps =
                        currentSlot.isBefore(existingEnd)
                                && proposedEnd.isAfter(existingStart);

                if (overlaps) {
                    conflict = true;
                    break;
                }
            }

            // Do not offer slots that have already passed today.
            if (!conflict
                    && (!date.equals(LocalDate.now())
                    || currentSlot.isAfter(LocalTime.now()))) {

                availableSlots.add(currentSlot.toString());
            }

            currentSlot = currentSlot.plusMinutes(30);
        }

        return new AvailabilityResponse(
                date,
                openingTime.toString(),
                closingTime.toString(),
                totalDuration,
                availableSlots
        );
    }

// =========================================================
// VALIDATE SERVICE IDS
// =========================================================

    private void validateServiceIds(List<Long> serviceIds) {

        if (serviceIds.stream().anyMatch(
                id -> id == null || id <= 0)) {

            throw new IllegalArgumentException(
                    "Service IDs must be valid positive numbers");
        }
    }

// =========================================================
// NORMALIZE SERVICE NAME
// =========================================================

    private String normalizeName(String name) {

        return name == null
                ? ""
                : name.trim().toLowerCase();
    }

// =========================================================
// VALIDATE SERVICE DURATION
// =========================================================

    private int validateDuration(Service service) {

        Integer duration = service.getDurationMinutes();

        if (duration == null || duration <= 0) {
            throw new IllegalArgumentException(
                    "Invalid duration for service: "
                            + service.getName());
        }

        return duration;
    }

}

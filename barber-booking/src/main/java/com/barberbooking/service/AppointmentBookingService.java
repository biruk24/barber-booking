
        package com.barberbooking.service;

import com.barberbooking.dto.AppointmentRequest;
import com.barberbooking.dto.AppointmentResponse;
import com.barberbooking.model.Appointment;
import com.barberbooking.model.AppointmentService;
import com.barberbooking.model.AppointmentServiceId;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.Service;
import com.barberbooking.model.WorkingHour;
import com.barberbooking.repository.AppointmentRepository;
import com.barberbooking.repository.AppointmentServiceRepository;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.ServiceRepository;
import com.barberbooking.repository.WorkingHourRepository;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@org.springframework.stereotype.Service
public class AppointmentBookingService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentServiceRepository appointmentServiceRepository;
    private final BarberShopRepository barberShopRepository;
    private final ServiceRepository serviceRepository;
    private final WorkingHourRepository workingHourRepository;

    public AppointmentBookingService(
            AppointmentRepository appointmentRepository,
            AppointmentServiceRepository appointmentServiceRepository,
            BarberShopRepository barberShopRepository,
            ServiceRepository serviceRepository,
            WorkingHourRepository workingHourRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentServiceRepository = appointmentServiceRepository;
        this.barberShopRepository = barberShopRepository;
        this.serviceRepository = serviceRepository;
        this.workingHourRepository = workingHourRepository;
    }

    // =========================================================
    // 1. BOOK AN APPOINTMENT
    // =========================================================

    @Transactional
    public AppointmentResponse book(
            Long shopId,
            AppointmentRequest request
    ) {

        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Appointment request is required");
        }

        // Lock the shop row while checking and creating a booking.
        BarberShop shop = barberShopRepository.findByIdForUpdate(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found"));

        // Validate appointment date.
        LocalDate date = request.getAppointmentDate();

        if (date == null) {
            throw new IllegalArgumentException(
                    "Appointment date is required");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Appointment date cannot be in the past");
        }

        // Validate customer counts.
        Integer requestedAdults = request.getAdultCount();
        Integer requestedChildren = request.getChildCount();

        if (requestedAdults == null || requestedChildren == null) {
            throw new IllegalArgumentException(
                    "Adult and child counts are required");
        }

        int adults = requestedAdults;
        int children = requestedChildren;

        if (adults < 0 || children < 0) {
            throw new IllegalArgumentException(
                    "Adult and child counts cannot be negative");
        }

        if (adults + children <= 0) {
            throw new IllegalArgumentException(
                    "At least one adult or child is required");
        }

        // Validate customer details.
        if (request.getCustomerName() == null
                || request.getCustomerName().isBlank()) {
            throw new IllegalArgumentException(
                    "Customer name is required");
        }

        if (request.getCustomerPhone() == null
                || request.getCustomerPhone().isBlank()) {
            throw new IllegalArgumentException(
                    "Customer phone is required");
        }

        // Validate selected service IDs.
        List<Long> serviceIds = request.getServiceIds();

        if (serviceIds == null || serviceIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one service");
        }

        if (serviceIds.stream().anyMatch(
                id -> id == null || id <= 0)) {
            throw new IllegalArgumentException(
                    "Service IDs must be valid positive numbers");
        }

        Set<Long> uniqueServiceIds = new HashSet<>(serviceIds);

        if (uniqueServiceIds.size() != serviceIds.size()) {
            throw new IllegalArgumentException(
                    "Do not select the same service more than once");
        }

        // Load services and verify that every requested ID exists.
        List<Service> services =
                serviceRepository.findAllById(serviceIds);

        if (services.size() != serviceIds.size()) {
            throw new IllegalArgumentException(
                    "One or more selected services do not exist");
        }

        // =====================================================
        // CRITICAL SECURITY VALIDATION:
        // A customer booking Shop A cannot use Shop B's service.
        // This check runs before an appointment is saved.
        // =====================================================

        for (Service service : services) {

            if (service.getBarberShop() == null) {
                throw new IllegalArgumentException(
                        "A selected service has no associated shop");
            }

            Long serviceShopId = service.getBarberShop().getId();

            if (serviceShopId == null) {
                throw new IllegalArgumentException(
                        "A selected service has an invalid shop");
            }

            if (!shopId.equals(serviceShopId)) {
                throw new IllegalArgumentException(
                        "Service ID " + service.getId()
                                + " does not belong to shop ID "
                                + shopId);
            }
        }

        // Calculate appointment duration.
        int totalPeople = adults + children;

        int durationMinutes = services.stream()
                .mapToInt(Service::getDurationMinutes)
                .sum() * totalPeople;

        if (durationMinutes <= 0) {
            throw new IllegalArgumentException(
                    "The total appointment duration must be greater than zero");
        }

        // Calculate total price.
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (Service service : services) {

            BigDecimal adultPrice = service.getAdultPrice();

            if (adultPrice == null || adultPrice.signum() < 0) {
                throw new IllegalStateException(
                        "A selected service has an invalid adult price");
            }

            BigDecimal childPrice = service.getChildPrice() != null
                    ? service.getChildPrice()
                    : adultPrice;

            if (childPrice.signum() < 0) {
                throw new IllegalStateException(
                        "A selected service has an invalid child price");
            }

            BigDecimal adultCost = adultPrice.multiply(
                    BigDecimal.valueOf(adults));

            BigDecimal childCost = childPrice.multiply(
                    BigDecimal.valueOf(children));

            totalPrice = totalPrice
                    .add(adultCost)
                    .add(childCost);
        }

        // Validate and parse start time.
        String requestedStartTime = request.getStartTime();

        if (requestedStartTime == null
                || requestedStartTime.isBlank()) {
            throw new IllegalArgumentException(
                    "Appointment start time is required");
        }

        LocalTime startTime;

        try {
            startTime = LocalTime.parse(requestedStartTime);
        } catch (Exception exception) {
            throw new IllegalArgumentException(
                    "Invalid start time. Use HH:mm, for example 09:30");
        }

        if (startTime.getSecond() != 0
                || startTime.getNano() != 0) {
            throw new IllegalArgumentException(
                    "Start time must use whole minutes");
        }

        LocalTime endTime = startTime.plusMinutes(durationMinutes);

        // Reject appointment times that have already passed.
        if (date.equals(LocalDate.now())
                && !startTime.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException(
                    "Appointment start time must be in the future");
        }

        // Check shop working hours.
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        WorkingHour hours = workingHourRepository
                .findByBarberShopIdAndDayOfWeek(
                        shopId,
                        dayOfWeek.name())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Working hours not configured for "
                                        + dayOfWeek.name()));

        if (Boolean.TRUE.equals(hours.getClosed())) {
            throw new IllegalArgumentException(
                    "The shop is closed on " + dayOfWeek.name());
        }

        LocalTime openingTime = hours.getOpeningTime();
        LocalTime closingTime = hours.getClosingTime();

        if (openingTime == null || closingTime == null) {
            throw new IllegalArgumentException(
                    "The shop's working hours are incomplete");
        }

        if (!closingTime.isAfter(openingTime)) {
            throw new IllegalArgumentException(
                    "The shop's configured working hours are invalid");
        }

        if (startTime.isBefore(openingTime)
                || !endTime.isAfter(startTime)
                || endTime.isAfter(closingTime)) {
            throw new IllegalArgumentException(
                    "Appointment must fit within the shop's working hours");
        }

        // Slots are offered every 30 minutes from opening time.
        long minutesFromOpening =
                ChronoUnit.MINUTES.between(openingTime, startTime);

        if (minutesFromOpening % 30 != 0) {
            throw new IllegalArgumentException(
                    "Choose a start time offered by the availability endpoint");
        }

        // Prevent overlapping appointments.
        List<Appointment> existingAppointments =
                appointmentRepository
                        .findByBarberShopIdAndAppointmentDateAndStatusNot(
                                shopId,
                                date,
                                "CANCELLED");

        for (Appointment existing : existingAppointments) {

            boolean overlaps =
                    startTime.isBefore(existing.getEndTime())
                            && endTime.isAfter(existing.getStartTime());

            if (overlaps) {
                throw new IllegalStateException(
                        "This time is no longer available. "
                                + "Please choose another slot.");
            }
        }

        // Create appointment only after all validations pass.
        Appointment appointment = new Appointment();

        appointment.setBarberShop(shop);
        appointment.setCustomerName(
                request.getCustomerName().trim());
        appointment.setCustomerPhone(
                request.getCustomerPhone().trim());
        appointment.setAppointmentDate(date);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setAdultCount(adults);
        appointment.setChildCount(children);
        appointment.setStatus("PENDING");
        appointment.setTotalPrice(totalPrice);

        LocalDateTime now = LocalDateTime.now();

        appointment.setCreatedAt(now);
        appointment.setUpdatedAt(now);

        Appointment saved = appointmentRepository.save(appointment);

        // Save the appointment-service relationships.
        for (Service service : services) {

            AppointmentService link = new AppointmentService();

            link.setId(new AppointmentServiceId(
                    saved.getId(),
                    service.getId()));

            link.setAppointment(saved);
            link.setService(service);

            appointmentServiceRepository.save(link);
        }

        return toResponse(saved, serviceIds);
    }

    // =========================================================
    // 2. GET ALL APPOINTMENTS FOR A SHOP
    // =========================================================

    public List<AppointmentResponse> getAppointments(Long shopId) {

        barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found"));

        List<Appointment> appointments =
                appointmentRepository
                        .findByBarberShopIdOrderByAppointmentDateAscStartTimeAsc(
                                shopId);

        return appointments.stream()
                .map(appointment ->
                        toResponse(
                                appointment,
                                getServiceIds(appointment.getId())))
                .toList();
    }

    // =========================================================
    // 3. CANCEL AN APPOINTMENT
    // =========================================================

    @Transactional
    public AppointmentResponse cancel(
            Long shopId,
            Long appointmentId
    ) {

        Appointment appointment = getAppointmentEntity(
                shopId,
                appointmentId);

        if ("CANCELLED".equals(appointment.getStatus())) {
            throw new IllegalArgumentException(
                    "Appointment is already cancelled");
        }

        if ("COMPLETED".equals(appointment.getStatus())) {
            throw new IllegalArgumentException(
                    "A completed appointment cannot be cancelled");
        }

        appointment.setStatus("CANCELLED");
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        return toResponse(
                saved,
                getServiceIds(saved.getId()));
    }

    // =========================================================
    // 4. GET ONE APPOINTMENT
    // =========================================================

    public AppointmentResponse getAppointment(
            Long shopId,
            Long appointmentId
    ) {

        Appointment appointment = getAppointmentEntity(
                shopId,
                appointmentId);

        return toResponse(
                appointment,
                getServiceIds(appointment.getId()));
    }

    // =========================================================
    // 5. GET APPOINTMENTS BY CUSTOMER PHONE
    // =========================================================

    public List<AppointmentResponse> getCustomerAppointments(
            Long shopId,
            String phone
    ) {

        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException(
                    "Customer phone is required");
        }

        barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found"));

        return appointmentRepository
                .findByBarberShopIdAndCustomerPhoneOrderByAppointmentDateAscStartTimeAsc(
                        shopId,
                        phone.trim())
                .stream()
                .map(appointment ->
                        toResponse(
                                appointment,
                                getServiceIds(appointment.getId())))
                .toList();
    }

    // =========================================================
    // 6. CONFIRM AN APPOINTMENT
    // =========================================================

    @Transactional
    public AppointmentResponse confirm(
            Long shopId,
            Long appointmentId
    ) {

        Appointment appointment = getAppointmentEntity(
                shopId,
                appointmentId);

        if (!"PENDING".equals(appointment.getStatus())) {
            throw new IllegalStateException(
                    "Only pending appointments can be confirmed");
        }

        appointment.setStatus("CONFIRMED");
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        return toResponse(
                saved,
                getServiceIds(saved.getId()));
    }

    // =========================================================
    // 7. COMPLETE AN APPOINTMENT
    // =========================================================

    @Transactional
    public AppointmentResponse complete(
            Long shopId,
            Long appointmentId
    ) {

        Appointment appointment = getAppointmentEntity(
                shopId,
                appointmentId);

        if (!"CONFIRMED".equals(appointment.getStatus())) {
            throw new IllegalStateException(
                    "Only confirmed appointments can be completed");
        }

        appointment.setStatus("COMPLETED");
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        return toResponse(
                saved,
                getServiceIds(saved.getId()));
    }

    // =========================================================
    // 8. FIND AN APPOINTMENT BELONGING TO A SHOP
    // =========================================================

    private Appointment getAppointmentEntity(
            Long shopId,
            Long appointmentId
    ) {

        return appointmentRepository
                .findByIdAndBarberShopId(appointmentId, shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Appointment not found"));
    }

    // =========================================================
    // 9. GET SERVICE IDS FOR ONE APPOINTMENT
    // =========================================================

    private List<Long> getServiceIds(Long appointmentId) {

        return appointmentServiceRepository
                .findByAppointment_Id(appointmentId)
                .stream()
                .map(link -> link.getService().getId())
                .toList();
    }

    // =========================================================
    // 10. CONVERT APPOINTMENT ENTITY TO RESPONSE DTO
    // =========================================================

    private AppointmentResponse toResponse(
            Appointment appointment,
            List<Long> serviceIds
    ) {

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getBarberShop().getId(),
                appointment.getCustomerName(),
                appointment.getCustomerPhone(),
                appointment.getAppointmentDate(),
                appointment.getStartTime().toString(),
                appointment.getEndTime().toString(),
                appointment.getAdultCount(),
                appointment.getChildCount(),
                appointment.getStatus(),
                appointment.getTotalPrice(),
                serviceIds
        );
    }
}

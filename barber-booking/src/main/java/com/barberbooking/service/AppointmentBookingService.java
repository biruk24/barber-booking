
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@org.springframework.stereotype.Service
public class AppointmentBookingService {

    private static final BigDecimal ADULT_COMBO_PRICE =
            new BigDecimal("700.00");

    private static final String ADULT = "ADULT";
    private static final String CHILD = "CHILD";

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

        BarberShop shop = barberShopRepository.findByIdForUpdate(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found"));

        LocalDate date = request.getAppointmentDate();

        if (date == null) {
            throw new IllegalArgumentException(
                    "Appointment date is required");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Appointment date cannot be in the past");
        }

        int adults = request.getAdultCount();
        int children = request.getChildCount();

        if (adults < 0 || children < 0) {
            throw new IllegalArgumentException(
                    "Adult and child counts cannot be negative");
        }

        if (adults + children <= 0) {
            throw new IllegalArgumentException(
                    "At least one adult or child is required");
        }

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

        // Get separate adult and child service selections.

        List<Long> adultServiceIds =
                request.getAdultServiceIds() == null
                        ? new ArrayList<>()
                        : request.getAdultServiceIds();

        List<Long> childServiceIds =
                request.getChildServiceIds() == null
                        ? new ArrayList<>()
                        : request.getChildServiceIds();

        if (adults > 0 && adultServiceIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one service for adults");
        }

        if (children > 0 && childServiceIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one service for children");
        }

        if (adults == 0 && !adultServiceIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Adult services cannot be selected when adult count is zero");
        }

        if (children == 0 && !childServiceIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Child services cannot be selected when child count is zero");
        }

        validateServiceIds(adultServiceIds);
        validateServiceIds(childServiceIds);

        if (new HashSet<>(adultServiceIds).size()
                != adultServiceIds.size()) {
            throw new IllegalArgumentException(
                    "An adult service cannot be selected more than once");
        }

        if (new HashSet<>(childServiceIds).size()
                != childServiceIds.size()) {
            throw new IllegalArgumentException(
                    "A child service cannot be selected more than once");
        }

        // Load all unique services.

        Set<Long> allServiceIds = new HashSet<>();
        allServiceIds.addAll(adultServiceIds);
        allServiceIds.addAll(childServiceIds);

        List<Long> serviceIds = new ArrayList<>(allServiceIds);

        List<Service> services =
                serviceRepository.findAllById(serviceIds);

        if (services.size() != serviceIds.size()) {
            throw new IllegalArgumentException(
                    "One or more selected services do not exist");
        }

        // Build service lookup map.

        java.util.Map<Long, Service> serviceMap =
                new java.util.HashMap<>();

        for (Service service : services) {
            serviceMap.put(service.getId(), service);
        }

        // Verify every service belongs to the requested shop.

        for (Service service : services) {

            if (service.getBarberShop() == null
                    || service.getBarberShop().getId() == null) {
                throw new IllegalArgumentException(
                        "A selected service has an invalid shop");
            }

            if (!shopId.equals(service.getBarberShop().getId())) {
                throw new IllegalArgumentException(
                        "Service ID " + service.getId()
                                + " does not belong to shop ID "
                                + shopId);
            }
        }

        // Validate adult services.

        boolean adultHasHaircut = false;
        boolean adultHasBeardTrim = false;

        int adultDurationPerPerson = 0;

        for (Long id : adultServiceIds) {

            Service service = serviceMap.get(id);

            String serviceName = normalizeName(service.getName());

            if ("haircut".equals(serviceName)) {
                adultHasHaircut = true;
            } else if ("beard trim".equals(serviceName)) {
                adultHasBeardTrim = true;
            } else {
                throw new IllegalArgumentException(
                        "This service is not available for adults: "
                                + service.getName());
            }

            adultDurationPerPerson += validateDuration(service);
        }

        // Validate child services. Children can select Haircut only.

        int childDurationPerPerson = 0;

        for (Long id : childServiceIds) {

            Service service = serviceMap.get(id);

            String serviceName = normalizeName(service.getName());

            if (!"haircut".equals(serviceName)) {
                throw new IllegalArgumentException(
                        "Children can only select Haircut");
            }

            childDurationPerPerson += validateDuration(service);
        }

        // Calculate total appointment duration.

        long durationMinutes =
                ((long) adultDurationPerPerson * adults)
                        + ((long) childDurationPerPerson * children);

        if (durationMinutes <= 0
                || durationMinutes > Integer.MAX_VALUE) {
            throw new IllegalArgumentException(
                    "Invalid appointment duration");
        }

        // Calculate adult price.

        BigDecimal totalPrice = BigDecimal.ZERO;

        if (adults > 0) {

            BigDecimal adultPricePerPerson;

            if (adultHasHaircut && adultHasBeardTrim) {

                adultPricePerPerson = ADULT_COMBO_PRICE;

            } else {

                adultPricePerPerson = BigDecimal.ZERO;

                for (Long id : adultServiceIds) {

                    Service service = serviceMap.get(id);
                    BigDecimal price = service.getAdultPrice();

                    if (price == null || price.signum() < 0) {
                        throw new IllegalStateException(
                                "Invalid adult price for service: "
                                        + service.getName());
                    }

                    adultPricePerPerson =
                            adultPricePerPerson.add(price);
                }
            }

            totalPrice = totalPrice.add(
                    adultPricePerPerson.multiply(
                            BigDecimal.valueOf(adults)));
        }

        // Calculate child price.

        if (children > 0) {

            BigDecimal childPricePerPerson = BigDecimal.ZERO;

            for (Long id : childServiceIds) {

                Service service = serviceMap.get(id);
                BigDecimal price = service.getChildPrice();

                if (price == null || price.signum() < 0) {
                    throw new IllegalStateException(
                            "Invalid child price for service: "
                                    + service.getName());
                }

                childPricePerPerson =
                        childPricePerPerson.add(price);
            }

            totalPrice = totalPrice.add(
                    childPricePerPerson.multiply(
                            BigDecimal.valueOf(children)));
        }

        // Validate start time.

        LocalTime startTime = request.getStartTime();

        if (startTime == null) {
            throw new IllegalArgumentException(
                    "Appointment start time is required");
        }

        if (startTime.getSecond() != 0
                || startTime.getNano() != 0) {
            throw new IllegalArgumentException(
                    "Start time must use whole minutes");
        }

        LocalTime endTime = startTime.plusMinutes(durationMinutes);

        if (date.equals(LocalDate.now())
                && !startTime.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException(
                    "Appointment start time must be in the future");
        }

        // Validate shop working hours.

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

        // Create appointment.

        Appointment appointment = new Appointment();

        appointment.setBarberShop(shop);
        appointment.setCustomerName(request.getCustomerName().trim());
        appointment.setCustomerPhone(request.getCustomerPhone().trim());
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

        // Save adult service relationships.

        for (Long id : adultServiceIds) {
            saveAppointmentService(
                    saved,
                    serviceMap.get(id),
                    ADULT
            );
        }

        // Save child service relationships.

        for (Long id : childServiceIds) {
            saveAppointmentService(
                    saved,
                    serviceMap.get(id),
                    CHILD
            );
        }

        return toResponse(saved);
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

        if (name == null) {
            return "";
        }

        return name.trim().toLowerCase();
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

    // =========================================================
    // SAVE APPOINTMENT-SERVICE RELATIONSHIP
    // =========================================================

    private void saveAppointmentService(
            Appointment appointment,
            Service service,
            String customerType
    ) {

        AppointmentService link = new AppointmentService();

        link.setId(new AppointmentServiceId(
                appointment.getId(),
                service.getId(),
                customerType
        ));

        link.setAppointment(appointment);
        link.setService(service);

        appointmentServiceRepository.save(link);
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
                .map(this::toResponse)
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

        return toResponse(saved);
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

        return toResponse(appointment);
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
                .map(this::toResponse)
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

        return toResponse(saved);
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

        return toResponse(saved);
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
    // 9. CONVERT APPOINTMENT ENTITY TO RESPONSE DTO
    // =========================================================

    private AppointmentResponse toResponse(Appointment appointment) {

        List<AppointmentService> links =
                appointmentServiceRepository
                        .findByAppointment_Id(appointment.getId());

        List<Long> adultServiceIds = links.stream()
                .filter(link -> link.getId() != null
                        && ADULT.equals(link.getId().getCustomerType()))
                .map(link -> link.getService().getId())
                .distinct()
                .toList();

        List<Long> childServiceIds = links.stream()
                .filter(link -> link.getId() != null
                        && CHILD.equals(link.getId().getCustomerType()))
                .map(link -> link.getService().getId())
                .distinct()
                .toList();

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
                adultServiceIds,
                childServiceIds
        );
    }
}


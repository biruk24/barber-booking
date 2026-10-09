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
import java.util.List;

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
    ){
        this.barberShopRepository = barberShopRepository;
        this.serviceRepository = serviceRepository;
        this.workingHourRepository = workingHourRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public AvailabilityResponse getAvailability(
            Long shopId,
            LocalDate date,
            List<Long> serviceIds,
            Integer adultCount,
            Integer childCount
    ){
        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop id " + shopId + " not found.")
                );
        if (adultCount == null){
            adultCount = 0;
        }
        if (childCount == null){
            childCount = 0;
        }
        if (adultCount + childCount <= 0){
            throw new IllegalArgumentException(
                    "At least one adult or child is required. "
            );
        }
        if (serviceIds == null || serviceIds.isEmpty()){
            throw new IllegalArgumentException(
                    "At least one service  is required."
            );
        }
        List<Service> services = serviceRepository.findAllById(serviceIds);
        if(services.size() != serviceIds.size()){
            throw new IllegalArgumentException(
                    "One or more services were not found."
            );
        }
        for (Service service : services){
            if (!service.getBarberShop().getId().equals(shopId)){
                throw new IllegalArgumentException(
                        "A selected service does not belong to this shop."
                );
            }
        }
        int serviceDuration = services.stream()
                .mapToInt(Service:: getDurationMinutes)
                .sum();
        int totalPeople = adultCount +  childCount;
        int totalDuration = serviceDuration * totalPeople;

        DayOfWeek dayOfweek = date.getDayOfWeek();
        String day = dayOfweek.name();

        WorkingHour workingHour =
                workingHourRepository
                        .findByBarberShopIdAndDayOfWeek(shopId, day)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Working hours not found for" + day
                                ));
        if (Boolean.TRUE.equals(workingHour.getClosed())){
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

        if(openingTime == null || closingTime == null){
            throw new IllegalArgumentException(
                    "Working hours not properly configured."
            );
        }
        List<Appointment> appointments =
                appointmentRepository
                        .findByBarberShopIdAndAppointmentDateAndStatusNot(
                                shopId,
                                date,
                                 "CANCELLED"
                        );

        List<String> availableSlots = new ArrayList<>();
        LocalTime currentSlot = openingTime;
        while (!currentSlot.plusMinutes(totalDuration)
                .isAfter(closingTime)){
            LocalTime proposedEnd =
                    currentSlot.plusMinutes(totalDuration);
            boolean conflict = false;

            for(Appointment appointment : appointments){
                LocalTime existingStart =
                        appointment.getStartTime();
                LocalTime existingEnd =
                        appointment.getEndTime();
                boolean overlaps =
                        currentSlot.isBefore(existingEnd)
                        && proposedEnd.isAfter(existingStart);
                if(overlaps){
                    conflict = true;
                    break;
                }
            }
            if (!conflict){
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
}

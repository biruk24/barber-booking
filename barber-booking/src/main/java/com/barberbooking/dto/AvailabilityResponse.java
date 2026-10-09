package com.barberbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class AvailabilityResponse {
    private LocalDate date;
    private String openingTime;
    private String closingTime;
    private Integer durationMinutes;
    private List<String> availableSlots;



}

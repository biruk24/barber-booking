package com.barberbooking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record AdminAppointmentResponse(
        Long id,
        Long shopId,
        String shopName,
        String customerName,
        String customerPhone,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime,
        Integer adultCount,
        Integer childCount,
        String status,
        BigDecimal totalPrice
) {
}
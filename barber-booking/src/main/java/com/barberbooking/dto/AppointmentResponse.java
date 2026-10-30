package com.barberbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long shopId;
    private String customerName;
    private String customerPhone;
    private LocalDate appointmentDate;
    private String startTime;
    private String endTime;
    private Integer adultCount;
    private Integer childCount;
    private String status;
    private BigDecimal totalPrice;
    private List<Long> serviceIds;

}

package com.barberbooking.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentRequest {
    @NotBlank(message = "customer name is required")
    @Size(max = 100)
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Size(max = 20)
    private String customerPhone;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotEmpty(message = "Select at least one service")
    private List<Long> serviceIds;

    @NotNull
    @Min(value = 0, message = "Adult count cannot be negative")
    private Integer adultCount = 1;

    @NotNull
    @Min(value = 0, message = "Child count cannot be negative")
    private Integer childCount = 0;

}

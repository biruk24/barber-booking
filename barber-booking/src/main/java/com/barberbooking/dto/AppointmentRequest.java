package com.barberbooking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentRequest {


    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name cannot exceed 100 characters")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Pattern(
            regexp = "^(09\\d{8}|07\\d{8}|\\+251[79]\\d{8})$",
            message = "Enter a valid Ethiopian phone number, for example 0912345678 or +251912345678"
    )
    private String customerPhone;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotBlank(message = "Start time is required")
    @Pattern(
            regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
            message = "Start time must use HH:mm format, for example 09:30"
    )
    private String startTime;

    @NotEmpty(message = "Select at least one service")
    private List<
            @NotNull(message = "Service ID cannot be null")
            @Min(value = 1, message = "Service ID must be positive")
                    Long
            > serviceIds;

    @NotNull(message = "Adult count is required")
    @Min(value = 0, message = "Adult count cannot be negative")
    private Integer adultCount = 1;

    @NotNull(message = "Child count is required")
    @Min(value = 0, message = "Child count cannot be negative")
    private Integer childCount = 0;


}

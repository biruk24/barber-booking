package com.barberbooking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
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
            message = "Enter a valid Ethiopian phone number"
    )
    private String customerPhone;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date cannot be in the past")
    private LocalDate appointmentDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @Min(value = 0, message = "Adult count cannot be negative")
    private int adultCount = 1;

    @Min(value = 0, message = "Child count cannot be negative")
    private int childCount = 0;

    private List<@NotNull(message = "Adult service ID cannot be null") @Min(1) Long> adultServiceIds;

    private List<@NotNull(message = "Child service ID cannot be null") @Min(1) Long> childServiceIds;


}

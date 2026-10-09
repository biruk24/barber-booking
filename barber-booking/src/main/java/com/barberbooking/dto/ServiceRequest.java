package com.barberbooking.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ServiceRequest {
    @NotBlank(message = "Service name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Duration is requred")
    @Positive(message = "Duration must be greater than 0")
    private Integer durationMinutes;

    @NotNull(message = "Adult price is required")
    @DecimalMin(value = "0.0", message = "Adult price cannot be negative")
    private BigDecimal adultPrice;

    @DecimalMin(value = "0.0", message = "Child price cannot be negative")
    private BigDecimal childPrice;
}

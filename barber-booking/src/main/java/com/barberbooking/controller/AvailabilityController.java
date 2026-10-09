package com.barberbooking.controller;

import com.barberbooking.dto.AvailabilityResponse;
import com.barberbooking.service.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shops/{shopId}/availability")
public class AvailabilityController {
    private final AvailabilityService availabilityService;

    public  AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }
    @GetMapping
    public AvailabilityResponse getAvailability(
            @PathVariable Long shopId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,
            @RequestParam
            List<Long> serviceIds,
            @RequestParam(defaultValue = "1")
            Integer adultCount,
            @RequestParam(defaultValue = "0")
            Integer childCount
    ){
        return availabilityService.getAvailability(
                shopId,
                date,
                serviceIds,
                adultCount,
                childCount

        );
    }
}

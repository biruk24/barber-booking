package com.barberbooking.controller;

import com.barberbooking.dto.WorkingHourRequest;
import com.barberbooking.dto.WorkingHourResponse;
import com.barberbooking.service.ShopAuthorizationService;
import com.barberbooking.service.WorkingHourService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops/{shopId}/working-hours")
public class WorkingHourController {

    private final WorkingHourService workingHourService;
    private final ShopAuthorizationService shopAuthorizationService;

    public WorkingHourController(
            WorkingHourService workingHourService,
            ShopAuthorizationService shopAuthorizationService) {

        this.workingHourService = workingHourService;
        this.shopAuthorizationService = shopAuthorizationService;
    }

    @PostMapping
    public ResponseEntity<WorkingHourResponse> createOrUpdate(
            @PathVariable long shopId,
            @Valid @RequestBody WorkingHourRequest request,
            Authentication authentication) {

        // Only the shop owner can modify working hours.
        shopAuthorizationService.requireShopOwner(
                shopId,
                authentication.getName()
        );

        WorkingHourResponse response =
                workingHourService.createOrUpdate(shopId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkingHourResponse>> getWorkingHours(
            @PathVariable long shopId) {

        List<WorkingHourResponse> response =
                workingHourService.getWorkingHours(shopId);

        return ResponseEntity.ok(response);
    }
}
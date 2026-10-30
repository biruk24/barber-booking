
        package com.barberbooking.controller;

import com.barberbooking.dto.AppointmentRequest;
import com.barberbooking.dto.AppointmentResponse;
import com.barberbooking.service.AppointmentBookingService;
import com.barberbooking.service.ShopAuthorizationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops/{shopId}/appointments")
public class AppointmentController {

    private final AppointmentBookingService bookingService;
    private final ShopAuthorizationService authorizationService;

    public AppointmentController(
            AppointmentBookingService bookingService,
            ShopAuthorizationService authorizationService
    ) {
        this.bookingService = bookingService;
        this.authorizationService = authorizationService;
    }


    @PostMapping
    public ResponseEntity<AppointmentResponse> book(
            @PathVariable Long shopId,
            @Valid @RequestBody AppointmentRequest request
    ) {
        AppointmentResponse response =
                bookingService.book(shopId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @PathVariable Long shopId,
            Authentication authentication
    ) {
        authorizeShopOwner(shopId, authentication);

        List<AppointmentResponse> appointments =
                bookingService.getAppointments(shopId);

        return ResponseEntity.ok(appointments);
    }


    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> getAppointment(
            @PathVariable Long shopId,
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        authorizeShopOwner(shopId, authentication);

        AppointmentResponse appointment =
                bookingService.getAppointment(shopId, appointmentId);

        return ResponseEntity.ok(appointment);
    }


    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(
            @PathVariable Long shopId,
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        authorizeShopOwner(shopId, authentication);

        AppointmentResponse appointment =
                bookingService.cancel(shopId, appointmentId);

        return ResponseEntity.ok(appointment);
    }


    @PatchMapping("/{appointmentId}/confirm")
    public ResponseEntity<AppointmentResponse> confirm(
            @PathVariable Long shopId,
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        authorizeShopOwner(shopId, authentication);

        AppointmentResponse appointment =
                bookingService.confirm(shopId, appointmentId);

        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{appointmentId}/complete")
    public ResponseEntity<AppointmentResponse> complete(
            @PathVariable Long shopId,
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        authorizeShopOwner(shopId, authentication);

        AppointmentResponse appointment =
                bookingService.complete(shopId, appointmentId);

        return ResponseEntity.ok(appointment);
    }


    @GetMapping("/customer")
    public ResponseEntity<List<AppointmentResponse>> getCustomerAppointments(
            @PathVariable Long shopId,
            @RequestParam String phone,
            Authentication authentication
    ) {
        authorizeShopOwner(shopId, authentication);

        List<AppointmentResponse> appointments =
                bookingService.getCustomerAppointments(shopId, phone);

        return ResponseEntity.ok(appointments);
    }


    private void authorizeShopOwner(
            Long shopId,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "Authentication is required to manage appointments"
            );
        }

        authorizationService.requireShopOwner(
                shopId,
                authentication.getName()
        );
    }
}

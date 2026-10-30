
        package com.barberbooking.controller;

import com.barberbooking.dto.ServiceRequest;
import com.barberbooking.dto.ServiceResponse;
import com.barberbooking.model.BarberShop;
import com.barberbooking.service.ServiceService;
import com.barberbooking.service.ShopAuthorizationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops/{shopId}/services")
public class ServiceController {

    private final ServiceService serviceService;
    private final ShopAuthorizationService shopAuthorizationService;

    public ServiceController(
            ServiceService serviceService,
            ShopAuthorizationService shopAuthorizationService
    ) {
        this.serviceService = serviceService;
        this.shopAuthorizationService = shopAuthorizationService;
    }


    @PostMapping
    public ResponseEntity<ServiceResponse> createService(
            @PathVariable Long shopId,
            Authentication authentication,
            @Valid @RequestBody ServiceRequest request
    ) {

        BarberShop shop = shopAuthorizationService.requireShopOwner(
                shopId,
                authentication.getName()
        );

        ServiceResponse response =
                serviceService.createService(shop.getId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getServices(
            @PathVariable Long shopId
    ) {

        List<ServiceResponse> services =
                serviceService.getServices(shopId);

        return ResponseEntity.ok(services);
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable Long shopId,
            @PathVariable Long serviceId,
            Authentication authentication,
            @Valid @RequestBody ServiceRequest request
    ) {

        BarberShop shop = shopAuthorizationService.requireShopOwner(
                shopId,
                authentication.getName()
        );

        ServiceResponse response = serviceService.updateService(
                shop.getId(),
                serviceId,
                request
        );

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long shopId,
            @PathVariable Long serviceId,
            Authentication authentication
    ) {

        BarberShop shop = shopAuthorizationService.requireShopOwner(
                shopId,
                authentication.getName()
        );

        serviceService.deleteService(shop.getId(), serviceId);

        return ResponseEntity.noContent().build();
    }
}


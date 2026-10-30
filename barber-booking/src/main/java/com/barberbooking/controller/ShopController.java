
        package com.barberbooking.controller;

import com.barberbooking.dto.ShopRequest;
import com.barberbooking.dto.ShopResponse;
import com.barberbooking.service.ShopService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    @PostMapping
    public ResponseEntity<ShopResponse> createShop(
            Authentication authentication,
            @Valid @RequestBody ShopRequest request
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();

        ShopResponse shopResponse = shopService.createShop(email, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(shopResponse);
    }

    @GetMapping
    public ResponseEntity<List<ShopResponse>> getAllShops() {
        List<ShopResponse> shops = shopService.getAllShops();
        return ResponseEntity.ok(shops);
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<ShopResponse> getShop(
            @PathVariable Long shopId
    ) {
        ShopResponse response = shopService.getShop(shopId);
        return ResponseEntity.ok(response);
    }
}


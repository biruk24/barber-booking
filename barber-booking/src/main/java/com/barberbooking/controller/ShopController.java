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

        ShopResponse response = shopService.createShop(
                authentication.getName(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ShopResponse>> getAllShops() {
        return ResponseEntity.ok(shopService.getAllShops());
    }

    @GetMapping("/{shopId}")
    public ResponseEntity<ShopResponse> getShop(
            @PathVariable Long shopId
    ) {
        return ResponseEntity.ok(shopService.getShop(shopId));
    }

    // Public endpoint: find a barber shop using its unique URL slug.
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ShopResponse> getShopBySlug(
            @PathVariable String slug
    ) {
        return ResponseEntity.ok(shopService.getShopBySlug(slug));
    }

    @PutMapping("/{shopId}")
    public ResponseEntity<ShopResponse> updateShop(
            @PathVariable Long shopId,
            Authentication authentication,
            @Valid @RequestBody ShopRequest request
    ) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ShopResponse response = shopService.updateShop(
                shopId,
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(response);
    }
}


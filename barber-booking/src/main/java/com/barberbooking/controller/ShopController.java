package com.barberbooking.controller;

import com.barberbooking.dto.ShopRequest;
import com.barberbooking.dto.ShopResponse;
import com.barberbooking.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shops")
public class ShopController {
    private final ShopService shopService;

    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }
    @PostMapping
    public ResponseEntity<ShopResponse> createShop(
            @RequestParam Long userId,
            @Valid @RequestBody ShopRequest request
    ) {
        ShopResponse shopResponse = shopService.createShop(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(shopResponse);
    }
    @GetMapping("/{shopId}")
    public ResponseEntity<ShopResponse> getShop(
            @PathVariable Long shopId
    ){
        ShopResponse response = shopService.getShop(shopId);
        return ResponseEntity.ok(response);
    }
}

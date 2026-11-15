package com.barberbooking.dto;

public record AdminBarberResponse(
        Long id,
        String name,
        String email,
        String phone,
        String shopName,
        String shopSlug
) {
}
package com.barberbooking.dto;

public record AdminShopResponse(
        Long id,
        String name,
        String slug,
        String description,
        String phone,
        String address,
        Long barberId,
        String barberName,
        String barberEmail
) {
}
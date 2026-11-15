package com.barberbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShopResponse {

    private Long id;
    private String name;
    private String description;
    private String phone;
    private String address;
    private String slug;
}



        package com.barberbooking.service;

import com.barberbooking.model.BarberShop;
import com.barberbooking.model.User;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class ShopAuthorizationService {

    private final BarberShopRepository barberShopRepository;
    private final UserRepository userRepository;

    public ShopAuthorizationService(
            BarberShopRepository barberShopRepository,
            UserRepository userRepository
    ) {
        this.barberShopRepository = barberShopRepository;
        this.userRepository = userRepository;
    }

    public BarberShop requireShopOwner(
            Long shopId,
            String authenticatedEmail
    ) {

        //  Find the authenticated user.
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Authenticated user was not found"
                        )
                );

        //  Only barbers can manage shops.
        if (!"BARBER".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException(
                    "Only barbers can manage shops"
            );
        }

        //  Find the requested shop.
        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Shop not found"
                        )
                );

        //  Verify that the shop has an owner.
        if (shop.getUser() == null || shop.getUser().getId() == null) {
            throw new IllegalStateException(
                    "This shop does not have a valid owner"
            );
        }

        //  Compare the authenticated user's ID with the owner's ID.
        if (!shop.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to manage this shop"
            );
        }

        //  Return the authorized shop.
        return shop;
    }
}


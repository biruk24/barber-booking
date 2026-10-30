
        package com.barberbooking.service;

import com.barberbooking.dto.ShopRequest;
import com.barberbooking.dto.ShopResponse;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.User;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShopService {

    private final BarberShopRepository barberShopRepository;
    private final UserRepository userRepository;

    public ShopService(
            BarberShopRepository barberShopRepository,
            UserRepository userRepository
    ) {
        this.barberShopRepository = barberShopRepository;
        this.userRepository = userRepository;
    }

    // Create a shop for the authenticated barber.
    @Transactional
    public ShopResponse createShop(
            String email,
            ShopRequest request
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Authenticated user not found"
                        )
                );

        if (!"BARBER".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException(
                    "Only barbers can create shops"
            );
        }

        if (barberShopRepository.findByUserId(user.getId())
                .isPresent()) {
            throw new IllegalArgumentException(
                    "This barber already has a shop"
            );
        }

        BarberShop shop = new BarberShop();

        shop.setUser(user);
        shop.setName(request.getName());
        shop.setDescription(request.getDescription());
        shop.setPhone(request.getPhone());
        shop.setAddress(request.getAddress());

        LocalDateTime now = LocalDateTime.now();

        shop.setCreatedAt(now);
        shop.setUpdatedAt(now);

        BarberShop savedShop = barberShopRepository.save(shop);

        return toResponse(savedShop);
    }

    // Retrieve all shops for public browsing.
    @Transactional(readOnly = true)
    public List<ShopResponse> getAllShops() {
        return barberShopRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Retrieve a shop by its ID.
    @Transactional(readOnly = true)
    public ShopResponse getShop(Long shopId) {
        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        return toResponse(shop);
    }

    // Convert the entity to the response DTO.
    private ShopResponse toResponse(BarberShop shop) {
        return new ShopResponse(
                shop.getId(),
                shop.getName(),
                shop.getDescription(),
                shop.getPhone(),
                shop.getAddress()
        );
    }
}


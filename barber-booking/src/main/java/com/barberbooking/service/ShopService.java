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
    private final ShopAuthorizationService shopAuthorizationService;

    public ShopService(
            BarberShopRepository barberShopRepository,
            UserRepository userRepository,
            ShopAuthorizationService shopAuthorizationService
    ) {
        this.barberShopRepository = barberShopRepository;
        this.userRepository = userRepository;
        this.shopAuthorizationService = shopAuthorizationService;
    }

    @Transactional
    public ShopResponse createShop(String email, ShopRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Authenticated user not found")
                );

        if (!"BARBER".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Only barbers can create shops");
        }

        if (barberShopRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("This barber already has a shop");
        }

        BarberShop shop = new BarberShop();

        shop.setUser(user);
        shop.setName(request.getName().trim());
        shop.setSlug(generateUniqueSlug(request.getName()));
        shop.setDescription(request.getDescription());
        shop.setPhone(request.getPhone());
        shop.setAddress(request.getAddress());

        LocalDateTime now = LocalDateTime.now();

        shop.setCreatedAt(now);
        shop.setUpdatedAt(now);

        return toResponse(barberShopRepository.save(shop));
    }

    @Transactional(readOnly = true)
    public List<ShopResponse> getAllShops() {

        return barberShopRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShopResponse getShop(Long shopId) {

        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        return toResponse(shop);
    }

    // Retrieve a public shop using its unique slug.
    @Transactional(readOnly = true)
    public ShopResponse getShopBySlug(String slug) {

        BarberShop shop = barberShopRepository.findBySlug(slug)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        return toResponse(shop);
    }

    private String generateUniqueSlug(String shopName) {

        String baseSlug = shopName.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isEmpty()) {
            baseSlug = "barber-shop";
        }

        String slug = baseSlug;
        int counter = 2;

        while (barberShopRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    @Transactional
    public ShopResponse updateShop(
            Long shopId,
            String authenticatedEmail,
            ShopRequest request
    ) {

        BarberShop shop = shopAuthorizationService.requireShopOwner(
                shopId,
                authenticatedEmail
        );

        shop.setName(request.getName().trim());
        shop.setDescription(request.getDescription());
        shop.setPhone(request.getPhone());
        shop.setAddress(request.getAddress());
        shop.setUpdatedAt(LocalDateTime.now());

        BarberShop updatedShop = barberShopRepository.save(shop);

        return toResponse(updatedShop);
    }

    private ShopResponse toResponse(BarberShop shop) {


            return new ShopResponse(
                    shop.getId(),
                    shop.getName(),
                    shop.getDescription(),
                    shop.getPhone(),
                    shop.getAddress(),
                    shop.getSlug()
            );
        }
    }

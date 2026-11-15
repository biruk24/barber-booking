package com.barberbooking.service;

import com.barberbooking.dto.LoginRequest;
import com.barberbooking.dto.LoginResponse;
import com.barberbooking.dto.RegisterRequest;
import com.barberbooking.dto.RegisterResponse;
import com.barberbooking.model.User;
import com.barberbooking.model.BarberShop;
import com.barberbooking.repository.UserRepository;
import com.barberbooking.repository.BarberShopRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BarberShopRepository barberShopRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            BarberShopRepository barberShopRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.barberShopRepository = barberShopRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone already exists");
        }

        LocalDateTime now = LocalDateTime.now();

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(phone);
        user.setRole("BARBER");
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User savedUser = userRepository.save(user);

        BarberShop shop = new BarberShop();

        String shopName = request.getShopName().trim();

        shop.setUser(savedUser);
        shop.setName(shopName);
        shop.setSlug(generateUniqueSlug(shopName));
        shop.setPhone(phone);
        shop.setCreatedAt(now);
        shop.setUpdatedAt(now);

        barberShopRepository.save(shop);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole()
        );
    }

    private String generateUniqueSlug(String shopName) {

        String baseSlug = shopName
                .toLowerCase(Locale.ROOT)
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

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {


        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        Long shopId = null;

// Only BARBER accounts must have an associated shop.
        if ("BARBER".equals(user.getRole())) {

            BarberShop shop = barberShopRepository.findByUserId(user.getId())
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "No barber shop is associated with this account"
                            )
                    );

            shopId = shop.getId();

        } else if (!"ADMIN".equals(user.getRole())) {

            throw new IllegalStateException(
                    "This account does not have permission to log in"
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                shopId,
                token
        );

    }
}

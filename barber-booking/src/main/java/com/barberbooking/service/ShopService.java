package com.barberbooking.service;

import com.barberbooking.dto.ShopRequest;
import com.barberbooking.dto.ShopResponse;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.User;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShopService {

    private final BarberShopRepository barberShopRepository;
    private final UserRepository userRepository;


    public ShopService(BarberShopRepository barberShopRepository, UserRepository userRepository) {
        this.barberShopRepository = barberShopRepository;
        this.userRepository = userRepository;
    }

    public ShopResponse createShop (Long userId, ShopRequest request){
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
        new IllegalArgumentException("User not found"));

        if (barberShopRepository.findByUserId(userId).isPresent()){
            throw new IllegalArgumentException("This barber already has a shop");
        }
        BarberShop shop = new  BarberShop();

        shop.setUser(user);
        shop.setName(request.getName());
        shop.setDescription(request.getDescription());
        shop.setPhone(request.getPhone());
        shop.setAddress(request.getAddress());

        LocalDateTime now = LocalDateTime.now();
        shop.setCreatedAt(now);
        shop.setUpdatedAt(now);

        BarberShop savedShop = barberShopRepository.save(shop);

        return new ShopResponse(
                savedShop.getId(),
                savedShop.getName(),
                savedShop.getDescription(),
                savedShop.getPhone(),
                savedShop.getAddress()

        );
    }
    public ShopResponse getShop(Long shopId){
        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
            new IllegalArgumentException("Shop not found"));

        return new ShopResponse(
                shop.getId(),
                shop.getName(),
                shop.getDescription(),
                shop.getPhone(),
                shop.getAddress()


        );
    }
}

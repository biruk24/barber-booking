package com.barberbooking.service;
import com.barberbooking.dto.ServiceRequest;
import com.barberbooking.dto.ServiceResponse;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.Service;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.ServiceRepository;

import java.time.LocalDateTime;
import java.util.List;
@org.springframework.stereotype.Service


public class ServiceService {
    private final ServiceRepository serviceRepository;
    private final BarberShopRepository barberShopRepository;

    public ServiceService(
            ServiceRepository serviceRepository,
            BarberShopRepository barberShopRepository
    ) {
        this.serviceRepository = serviceRepository;
        this.barberShopRepository = barberShopRepository;
    }

    public ServiceResponse createService(
            Long shopId,
            ServiceRequest request
    ) {

        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        Service service = new Service();

        service.setBarberShop(shop);
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setAdultPrice(request.getAdultPrice());
        service.setChildPrice(request.getChildPrice());

        LocalDateTime now = LocalDateTime.now();
        service.setCreatedAt(now);
        service.setUpdatedAt(now);

        Service savedService = serviceRepository.save(service);

        return new ServiceResponse(
                savedService.getId(),
                savedService.getName(),
                savedService.getDescription(),
                savedService.getDurationMinutes(),
                savedService.getAdultPrice(),
                savedService.getChildPrice()
        );
    }

    public List<ServiceResponse> getServices(Long shopId) {

        // Make sure the shop exists
        barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        return serviceRepository.findByBarberShopId(shopId)
                .stream()
                .map(service -> new ServiceResponse(
                        service.getId(),
                        service.getName(),
                        service.getDescription(),
                        service.getDurationMinutes(),
                        service.getAdultPrice(),
                        service.getChildPrice()
                ))
                .toList();
    }
}
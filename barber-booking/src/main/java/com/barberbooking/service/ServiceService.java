
        package com.barberbooking.service;

import com.barberbooking.dto.ServiceRequest;
import com.barberbooking.dto.ServiceResponse;
import com.barberbooking.model.BarberShop;
import com.barberbooking.model.Service;
import com.barberbooking.repository.BarberShopRepository;
import com.barberbooking.repository.ServiceRepository;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Service
@Transactional
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

    /**
     * Create a new service for an existing shop.
     */
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

        return mapToResponse(savedService);
    }

    /**
     * Retrieve all services belonging to a shop.
     */
    @Transactional(readOnly = true)
    public List<ServiceResponse> getServices(Long shopId) {

        barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        return serviceRepository.findByBarberShopId(shopId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Update a service belonging to the specified shop.
     */
    public ServiceResponse updateService(
            Long shopId,
            Long serviceId,
            ServiceRequest request
    ) {

        Service service = serviceRepository
                .findByIdAndBarberShopId(serviceId, shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Service not found in this shop"
                        )
                );

        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setAdultPrice(request.getAdultPrice());
        service.setChildPrice(request.getChildPrice());
        service.setUpdatedAt(LocalDateTime.now());

        Service updatedService = serviceRepository.save(service);

        return mapToResponse(updatedService);
    }

    /**
     * Delete a service belonging to the specified shop.
     */
    public void deleteService(
            Long shopId,
            Long serviceId
    ) {

        Service service = serviceRepository
                .findByIdAndBarberShopId(serviceId, shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Service not found in this shop"
                        )
                );

        serviceRepository.delete(service);
    }

    /**
     * Convert a Service entity into a ServiceResponse DTO.
     */
    private ServiceResponse mapToResponse(Service service) {

        return new ServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getAdultPrice(),
                service.getChildPrice()
        );
    }
}


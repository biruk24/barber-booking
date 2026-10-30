package com.barberbooking.repository;

import com.barberbooking.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByBarberShopId(Long barberShopId);

    Optional<Service> findByIdAndBarberShopId(
            Long serviceId,
            Long barberShopId
    );
}


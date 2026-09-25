package com.barberbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service,Long> {
    List<Service> findByBarberShopId(Long barberShopId);

}

package com.barberbooking.repository;

import com.barberbooking.controller.model.BarberShop;
import com.barberbooking.controller.model.WorkingHour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BarberShopRepository extends JpaRepository<BarberShop, Long> {
    List<WorkingHour> findByBarberShopId(long barberShopId);

    Optional<WorkingHour> findByBarberShopIdAndDayOfWeek(
            long barberShopId,
            String dayOfWeek);
}

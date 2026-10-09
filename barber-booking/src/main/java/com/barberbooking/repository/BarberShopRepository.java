package com.barberbooking.repository;
import com.barberbooking.model.BarberShop;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
public interface BarberShopRepository extends JpaRepository<BarberShop, Long> {
    Optional<BarberShop> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM BarberShop s WHERE s.id = :shopId")
    Optional<BarberShop> findByIdForUpdate(@Param("shopId") Long shopId);
}
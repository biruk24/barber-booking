package com.barberbooking.repository;
import com.barberbooking.model.BarberShop; import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface BarberShopRepository extends JpaRepository<BarberShop, Long> {
    Optional<BarberShop> findByUserId(Long userId);
}
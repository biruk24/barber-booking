package com.barberbooking.repository;
import com.barberbooking.model.Service; import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByBarberShopId(Long barberShopId);
}
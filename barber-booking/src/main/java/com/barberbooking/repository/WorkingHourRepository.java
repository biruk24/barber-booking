package com.barberbooking.repository;
import com.barberbooking.model.WorkingHour; import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; import java.util.Optional;
public interface WorkingHourRepository extends JpaRepository<WorkingHour, Long> {
    List<WorkingHour> findByBarberShopId(Long barberShopId);

    Optional<WorkingHour> findByBarberShopIdAndDayOfWeek(
            Long barberShopId,
            String dayOfWeek
    );
}
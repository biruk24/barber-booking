package com.barberbooking.repository;

import com.barberbooking.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByBarberShopIdAndAppointmentDateAndStatusNot(
            Long barberShopId,
            LocalDate appointmentDate,
            String status
    );

    List<Appointment> findByBarberShopIdOrderByAppointmentDateAscStartTimeAsc(
            Long barberShopId
    );

    Optional<Appointment> findByIdAndBarberShopId(
            Long appointmentId,
            Long barberShopId
    );

    List<Appointment> findByBarberShopIdAndCustomerPhoneOrderByAppointmentDateAscStartTimeAsc(
            Long barberShopId,
            String customerPhone
    );

    // Filter appointments by shop, date, and status.

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.barberShop.id = :shopId
            AND (:status IS NULL OR a.status = :status)
            AND (:date IS NULL OR a.appointmentDate = :date)
            ORDER BY a.appointmentDate ASC, a.startTime ASC
            """)
    List<Appointment> findFilteredAppointments(
            @Param("shopId") Long shopId,
            @Param("status") String status,
            @Param("date") LocalDate date
    );
}
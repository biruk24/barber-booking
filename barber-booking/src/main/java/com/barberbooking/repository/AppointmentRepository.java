package com.barberbooking.repository;

import com.barberbooking.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByBarberShopIdAndAppointmentDate(
            long barberShopId,
            LocalDate appointmentDate
    );
    List<Appointment> findByBarberShopIdAndAppointmentDateAndStatus(
            long barberShopId,
            LocalDate appointmentDate,
            String status
    );
}

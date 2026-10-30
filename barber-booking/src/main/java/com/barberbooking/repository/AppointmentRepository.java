
        package com.barberbooking.repository;

import com.barberbooking.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

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
}

package com.barberbooking.repository;

import com.barberbooking.model.AppointmentService;
import com.barberbooking.model.AppointmentServiceId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentServiceRepository extends JpaRepository<AppointmentService, AppointmentServiceId> {

    List<AppointmentService> findByAppointment_Id(Long appointmentId);
}

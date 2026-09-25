package com.barberbooking.controller.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appointment_services")
@Getter
@Setter
@NoArgsConstructor
public class AppointmentService {
    @EmbeddedId
    private AppointmentServiceId id;
    @ManyToOne
    @MapsId("appointmentId")
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne
    @MapsId("serviceId")
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

}

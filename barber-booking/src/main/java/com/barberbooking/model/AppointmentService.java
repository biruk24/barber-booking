package com.barberbooking.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "appointment_services")
public class AppointmentService {


    @EmbeddedId
    private AppointmentServiceId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("appointmentId")
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceId")
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    public AppointmentService(
            Appointment appointment,
            Service service,
            String customerType
    ) {
        this.appointment = appointment;
        this.service = service;
        this.id = new AppointmentServiceId(
                appointment.getId(),
                service.getId(),
                customerType
        );
    }


}

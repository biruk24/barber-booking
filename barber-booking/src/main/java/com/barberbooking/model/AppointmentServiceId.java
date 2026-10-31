package com.barberbooking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class AppointmentServiceId implements Serializable {


    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "customer_type", length = 10)
    private String customerType;


}

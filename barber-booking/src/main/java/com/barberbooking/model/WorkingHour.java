package com.barberbooking.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;
@Entity
@Table( name = "working_hours", uniqueConstraints =
        { @UniqueConstraint
                ( name = "uq_working_hours_day",
                        columnNames = {"barber_shop_id", "day_of_week"} ) } )
@Getter
@Setter
@NoArgsConstructor
public class WorkingHour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "barber_shop_id", nullable = false)
    private BarberShop barberShop;

    @Column(name = "day_of_week", nullable = false, length = 15)
    private String dayOfWeek;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    @Column(name = "is_closed", nullable = false)
    private Boolean isClosed = false;
}
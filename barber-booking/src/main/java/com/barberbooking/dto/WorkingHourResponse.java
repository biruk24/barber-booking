package com.barberbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter@AllArgsConstructor
public class WorkingHourResponse {

    private Long id;
    private String dayOfWeek;
    private String openingTime;
    private String closingTime;
    private boolean isClosed;



}

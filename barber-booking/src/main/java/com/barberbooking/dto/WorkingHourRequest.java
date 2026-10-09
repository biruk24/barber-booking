package com.barberbooking.dto;
import jakarta.validation.constraints.NotBlank;
public class WorkingHourRequest {
    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;

    private String openingTime;

    private String closingTime;

    private Boolean closed = false;

    public WorkingHourRequest() {
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(String openingTime) {
        this.openingTime = openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(String closingTime) {
        this.closingTime = closingTime;
    }

    public Boolean getClosed() {
        return closed;
    }

    public void setClosed(Boolean closed) {
        this.closed = closed;
    }
}
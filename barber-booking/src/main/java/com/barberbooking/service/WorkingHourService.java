package com.barberbooking.service;
import com.barberbooking.dto.WorkingHourRequest; import com.barberbooking.dto.WorkingHourResponse; import com.barberbooking.model.BarberShop; import com.barberbooking.model.WorkingHour; import com.barberbooking.repository.BarberShopRepository; import com.barberbooking.repository.WorkingHourRepository;
import java.time.LocalTime; import java.util.List;
@org.springframework.stereotype.Service public class WorkingHourService {
    private final WorkingHourRepository workingHourRepository;
    private final BarberShopRepository barberShopRepository;

    public WorkingHourService(
            WorkingHourRepository workingHourRepository,
            BarberShopRepository barberShopRepository
    ) {
        this.workingHourRepository = workingHourRepository;
        this.barberShopRepository = barberShopRepository;
    }

    public WorkingHourResponse createOrUpdate(
            Long shopId,
            WorkingHourRequest request
    ) {

        BarberShop shop = barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        String day = request.getDayOfWeek().toUpperCase();

        WorkingHour workingHour =
                workingHourRepository
                        .findByBarberShopIdAndDayOfWeek(shopId, day)
                        .orElseGet(WorkingHour::new);

        workingHour.setBarberShop(shop);
        workingHour.setDayOfWeek(day);

        Boolean closed = request.getClosed() != null
                ? request.getClosed()
                : false;

        workingHour.setClosed(closed);

        if (closed) {

            workingHour.setOpeningTime(null);
            workingHour.setClosingTime(null);

        } else {

            if (request.getOpeningTime() == null ||
                    request.getClosingTime() == null) {

                throw new IllegalArgumentException(
                        "Opening and closing time are required"
                );
            }

            LocalTime opening =
                    LocalTime.parse(request.getOpeningTime());

            LocalTime closing =
                    LocalTime.parse(request.getClosingTime());

            if (!closing.isAfter(opening)) {
                throw new IllegalArgumentException(
                        "Closing time must be after opening time"
                );
            }

            workingHour.setOpeningTime(opening);
            workingHour.setClosingTime(closing);
        }

        WorkingHour saved =
                workingHourRepository.save(workingHour);

        return toResponse(saved);
    }

    public List<WorkingHourResponse> getWorkingHours(Long shopId) {

        barberShopRepository.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Shop not found")
                );

        return workingHourRepository
                .findByBarberShopId(shopId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    private WorkingHourResponse toResponse(
            WorkingHour workingHour
    ) {

        return new WorkingHourResponse(
                workingHour.getId(),
                workingHour.getDayOfWeek(),
                workingHour.getOpeningTime() != null
                        ? workingHour.getOpeningTime().toString()
                        : null,
                workingHour.getClosingTime() != null
                        ? workingHour.getClosingTime().toString()
                        : null,
                workingHour.getClosed()
        );
    }
}
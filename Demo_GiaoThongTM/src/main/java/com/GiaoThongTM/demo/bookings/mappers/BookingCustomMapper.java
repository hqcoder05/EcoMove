package com.GiaoThongTM.demo.bookings.mappers;

import com.GiaoThongTM.demo.bookings.dtos.request.BookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.bookings.entities.Booking;
import com.GiaoThongTM.demo.users.mappers.UserCustomMapper;
import com.GiaoThongTM.demo.vehicles.mappers.VehicleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingCustomMapper {
    private final UserCustomMapper userCustomMapper;
    private final VehicleMapper vehicleMapper;

    public Booking toBooking(BookingRequest request){
        return Booking.builder()
                .pickupTime(request.getPickupTime())
                .returnTime(request.getReturnTime())
                .pickupArea(request.getPickupArea())
                .returnArea(request.getReturnArea())
                .build();
    }

    public BookingResponse toBookingResponse(Booking booking){
        if(booking == null){
            return null;
        }

        BookingResponse bookingResponse =  new BookingResponse();
        bookingResponse.setBookingId(booking.getId());
        bookingResponse.setPickupTime(booking.getPickupTime());
        bookingResponse.setReturnTime(booking.getReturnTime());
        bookingResponse.setPickupArea(booking.getPickupArea());
        bookingResponse.setReturnArea(booking.getReturnArea());
        bookingResponse.setUser(userCustomMapper.toUserResponse(booking.getUser()));
        bookingResponse.setVehicle(vehicleMapper.toResponse(booking.getVehicle()));
        bookingResponse.setStatus(booking.getStatus());
        bookingResponse.setDurationDays(booking.getDurationDays());
        bookingResponse.setTotalPrice(booking.getTotalPrice());

        return bookingResponse;
    }
}

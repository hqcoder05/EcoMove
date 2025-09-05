package com.GiaoThongTM.demo.bookings.mappers;

import com.GiaoThongTM.demo.bookings.dtos.request.BookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.stations.dtos.response.StationResponse;
import com.GiaoThongTM.demo.bookings.entities.Booking;
import com.GiaoThongTM.demo.stations.entities.Station;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    @Mapping(target = "user", ignore = true)
    Booking toBooking(BookingRequest bookingRequest);

    @Mapping(source = "id", target = "bookingId")
    BookingResponse toBookingResponse(Booking booking);

    StationResponse toStationResponse(Station station);
}

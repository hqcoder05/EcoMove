package com.GiaoThongTM.demo.bookings.services;

import com.GiaoThongTM.demo.bookings.dtos.request.BookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.BookingUpdateRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.CancelBookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.bookings.entities.Booking;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.bookings.enums.BookingStatus;
import com.GiaoThongTM.demo.commons.enums.ErrorCode;
import com.GiaoThongTM.demo.commons.exceptions.AppException;
import com.GiaoThongTM.demo.bookings.mappers.BookingMapper;
import com.GiaoThongTM.demo.bookings.repositories.BookingRepository;
import com.GiaoThongTM.demo.users.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final UserRepository userRepository;

    public BookingResponse createBooking(BookingRequest bookingRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        boolean exists = bookingRepository.existsByUserAndStatusIn(
                user,
                List.of(BookingStatus.Pending, BookingStatus.Confirmed)
        );

        if (exists) {
            throw new AppException(ErrorCode.BOOKING_DUPLICATE);
        }

        if(bookingRequest.getPickupTime() == null ||
        bookingRequest.getReturnTime() == null ||
        bookingRequest.getPickupStationId() == null ||
        bookingRequest.getReturnStationId() == null ||
        bookingRequest.getVehicleTypeId() == null) {
            throw new AppException(ErrorCode.FIELD_ERROR);
        }

//        Station pickupStation = stationRepository.findById(bookingRequest.getPickupStationId())
//                .orElseThrow(() -> new AppException(ErrorCode.STATION_ERROR));
//        Station returnStation = stationRepository.findById(bookingRequest.getReturnStationId())
//                .orElseThrow(() -> new AppException(ErrorCode.STATION_ERROR));

//        VehicleType vehicleType = vehicleTypeRepository.findById(bookingRequest.getVehicleTypeId())
//                .orElseThrow(() -> new AppException(ErrorCode.VEHICLETYPE_ERROR));

        LocalDate now = LocalDate.now();
        if (bookingRequest.getPickupTime().isBefore(now)) {
            throw new AppException(ErrorCode.INVALID_PICKUPTIME);
        }
        if (bookingRequest.getReturnTime().isBefore(bookingRequest.getPickupTime())) {
            throw new AppException(ErrorCode.INVALID_RETURNTIME);
        }

//        int availableVehicles = vehicleRepository.countAvailableVehicleAtStation(
//                bookingRequest.getPickupStationId(), bookingRequest.getVehicleTypeId(), bookingRequest.getPickupTime());
//        if (availableVehicles < 1) {
//            throw new AppException(ErrorCode.VEHICLE_INVALID);
//        }

        Booking booking = bookingMapper.toBooking(bookingRequest);
        booking.setUser(user);
        booking.setStatus(BookingStatus.Pending);
        bookingRepository.save(booking);
        return bookingMapper.toBookingResponse(booking);
    }

    public BookingResponse updateBooking(UUID bookingId, BookingUpdateRequest bookingUpdateRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID));
        if (!booking.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.USERBOOKING_INVALID);
        }
        if(booking.getStatus() != BookingStatus.Pending) {
            throw new AppException(ErrorCode.PENDING_INVALID);
        }
        if (bookingUpdateRequest.getPickupTime() != null) {
            if (bookingUpdateRequest.getPickupTime().isBefore(LocalDate.now())) {
                throw new AppException(ErrorCode.INVALID_PICKUPTIME);
            }
            booking.setPickupTime(bookingUpdateRequest.getPickupTime());
        }
        if (bookingUpdateRequest.getReturnTime() != null) {
            if (bookingUpdateRequest.getReturnTime().isBefore(booking.getPickupTime())) {
                throw new AppException(ErrorCode.INVALID_RETURNTIME);
            }
            booking.setReturnTime(bookingUpdateRequest.getReturnTime());
        }
//        if (bookingUpdateRequest.getPickupStationId() != null) {
//            // Kiểm tra station tồn tại (tuỳ chọn)
//            booking.setPickupStation(...); // gán entity station
//        }
//        if (bookingUpdateRequest.getReturnStationId() != null) {
//            booking.setReturnStation(...); // gán entity station
//        }
//        if (bookingUpdateRequest.getVehicleTypeId() != null) {
//            // Tìm vehicle phù hợp (còn trống, đúng loại, đúng trạm...)
//            Vehicle vehicle = vehicleRepository.findAvailableVehicle(
//                    bookingUpdateRequest.getPickupStationId(),
//                    bookingUpdateRequest.getVehicleTypeId(),
//                    bookingUpdateRequest.getPickupTime()
//            ).orElseThrow(() -> new AppException(ErrorCode.NO_VEHICLE_AVAILABLE));
//
//            booking.setVehicle(vehicle);
//        }
        booking.setStatus(BookingStatus.Pending);
        bookingRepository.save(booking);
        return bookingMapper.toBookingResponse(booking);
    }

    public BookingResponse getBooking(UUID bookingId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID));
        if (!booking.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.USERBOOKING_INVALID);
        }
        return bookingMapper.toBookingResponse(booking);
    }

    public void cancelBooking(UUID bookingId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID) );
        if(!booking.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.USERBOOKING_INVALID);
        }
        if(booking.getStatus() != BookingStatus.Pending) {
            throw new AppException(ErrorCode.PENDING_INVALID);
        }
        booking.setStatus(BookingStatus.Canceled);
        bookingRepository.save(booking);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void deleteBooking(UUID bookingId) {
        bookingRepository.deleteById(bookingId);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(bookingMapper::toBookingResponse).toList();
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void confirmedBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_INVALID));

        if(booking.getStatus() != BookingStatus.Pending) {
            throw new AppException(ErrorCode.PENDING_INVALID);
        }
        booking.setStatus(BookingStatus.Confirmed);
        bookingRepository.save(booking);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void updateBookingStatus(UUID bookingId, CancelBookingRequest cancel) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID));
        if(booking.getStatus() == cancel.getStatus()) {
            throw new AppException(ErrorCode.STATUS_UNCHANGED);
        }
        if(booking.getStatus() == BookingStatus.Pending
                && (cancel.getStatus() == BookingStatus.Confirmed || cancel.getStatus() == BookingStatus.Canceled)) {
            booking.setStatus(cancel.getStatus());
            bookingRepository.save(booking);
        }else{
            throw new AppException(ErrorCode.STATUS_INVALID_TRANSITION);
        }
    }

}

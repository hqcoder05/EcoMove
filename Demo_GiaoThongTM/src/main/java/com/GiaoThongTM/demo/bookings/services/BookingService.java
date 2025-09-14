package com.GiaoThongTM.demo.bookings.services;

import com.GiaoThongTM.demo.bookings.dtos.request.BookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.BookingUpdateRequest;
import com.GiaoThongTM.demo.bookings.dtos.request.CancelBookingRequest;
import com.GiaoThongTM.demo.bookings.dtos.response.BookingResponse;
import com.GiaoThongTM.demo.bookings.entities.Booking;
import com.GiaoThongTM.demo.bookings.mappers.BookingCustomMapper;
import com.GiaoThongTM.demo.commons.utils.AuthUtil;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.bookings.enums.BookingStatus;
import com.GiaoThongTM.demo.commons.enums.ErrorCode;
import com.GiaoThongTM.demo.commons.exceptions.AppException;
import com.GiaoThongTM.demo.bookings.mappers.BookingMapper;
import com.GiaoThongTM.demo.bookings.repositories.BookingRepository;
import com.GiaoThongTM.demo.users.repositories.UserRepository;
import com.GiaoThongTM.demo.vehicles.entities.Vehicle;
import com.GiaoThongTM.demo.vehicles.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
//    private final BookingMapper bookingMapper;
    private final UserRepository userRepository;
    private final BookingCustomMapper bookingCustomMapper;
    private final VehicleRepository vehicleRepository;

    public BookingResponse createBooking(BookingRequest bookingRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Vehicle vehicle = vehicleRepository.findById(bookingRequest.getVehicleTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));

        boolean exists = bookingRepository.existsByUserAndStatusIn(
                user,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );

        if (exists) {
            throw new AppException(ErrorCode.BOOKING_DUPLICATE);
        }

        if(bookingRequest.getPickupTime() == null
                || bookingRequest.getReturnTime() == null
                || bookingRequest.getVehicleTypeId() == null) {
            throw new AppException(ErrorCode.FIELD_ERROR);
        }

        LocalDate now = LocalDate.now();
        if (bookingRequest.getPickupTime().isBefore(now)) {
            throw new AppException(ErrorCode.INVALID_PICKUPTIME);
        }
        if (bookingRequest.getReturnTime().isBefore(bookingRequest.getPickupTime())) {
            throw new AppException(ErrorCode.INVALID_RETURNTIME);
        }

        long days = ChronoUnit.DAYS.between(bookingRequest.getPickupTime(), bookingRequest.getReturnTime());
        if (days <= 0) {
            days = 1; // Tối thiểu 1 ngày
        }
        Long vehiclePrice = vehicle.getPricePerDay(); // Hoặc tên field price trong Vehicle entity
        Long totalPrice = vehiclePrice * days;

        Booking booking = bookingCustomMapper.toBooking(bookingRequest);
        booking.setUser(user);
        booking.setDurationDays(days);
        booking.setTotalPrice(totalPrice);
        booking.setVehicle(vehicle);
        booking.setStatus(BookingStatus.PENDING);

        Booking result = bookingRepository.save(booking);
        return bookingCustomMapper.toBookingResponse(result);
    }

    public List<BookingResponse> getUserBookingById(UUID userId){
//        UUID userId = AuthUtil.getUserIdFromContext();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Booking> booking = bookingRepository
                .findAllByUserAndStatusIn(user, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));

        return booking.stream()
                .map(bookingCustomMapper::toBookingResponse)
                .toList();
    }

    public void cancelUserBooking(){
        UUID userId = AuthUtil.getUserIdFromContext();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Booking booking = bookingRepository
                .findByUserAndStatusIn(user, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED))
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_INVALID));

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.STATUS_INVALID_TRANSITION);
        }
        booking.setStatus(BookingStatus.CANCLED);
        bookingRepository.delete(booking);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public BookingResponse updateBooking(UUID bookingId, BookingUpdateRequest bookingUpdateRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID));
        if (!booking.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.USERBOOKING_INVALID);
        }
        if(booking.getStatus() != BookingStatus.PENDING) {
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
        booking.setStatus(BookingStatus.PENDING);
        bookingRepository.save(booking);
        return bookingCustomMapper.toBookingResponse(booking);
    }

//    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public BookingResponse getBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID));
        return bookingCustomMapper.toBookingResponse(booking);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void cancelBooking(UUID bookingId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID) );
        if(!booking.getUser().getUsername().equals(username)) {
            throw new AppException(ErrorCode.USERBOOKING_INVALID);
        }
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.STATUS_INVALID_TRANSITION);
        }
        booking.setStatus(BookingStatus.CANCLED);
        bookingRepository.save(booking);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void deleteBooking(UUID bookingId) {
        bookingRepository.deleteById(bookingId);
    }

//    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(bookingCustomMapper::toBookingResponse).toList();
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void confirmedBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_INVALID));

        if(booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.PENDING_INVALID);
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void updateBookingStatus(UUID bookingId, CancelBookingRequest cancel) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException(ErrorCode.BOOKING_INVALID));
        if(booking.getStatus() == cancel.getStatus()) {
            throw new AppException(ErrorCode.STATUS_UNCHANGED);
        }
        if(booking.getStatus() == BookingStatus.PENDING
                && (cancel.getStatus() == BookingStatus.CONFIRMED || cancel.getStatus() == BookingStatus.CANCLED)) {
            booking.setStatus(cancel.getStatus());
            bookingRepository.save(booking);
        }else{
            throw new AppException(ErrorCode.STATUS_INVALID_TRANSITION);
        }
    }
}

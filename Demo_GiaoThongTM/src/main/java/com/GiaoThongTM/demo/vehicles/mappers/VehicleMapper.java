package com.GiaoThongTM.demo.vehicles.mappers;

import com.GiaoThongTM.demo.vehicles.dtos.request.VehicleRequest;
import com.GiaoThongTM.demo.vehicles.dtos.response.VehicleResponse;
import com.GiaoThongTM.demo.vehicles.entities.Vehicle;
import com.GiaoThongTM.demo.vehicles.enums.VehicleStatus;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Component
public class VehicleMapper {

    // ====== Entity -> Response (format cho UI) ======
    public VehicleResponse toResponse(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getVehicleId())
                .name(nz(v.getName()))
                .image(nz(v.getImageUrl()))
                .price(formatVnd(v.getPricePerDay()))      // "1.200.000"
                .type(nz(v.getType()))
                .range(formatRange(v.getRangeKm()))        // "450km"
                .seats(formatSeats(v.getSeats()))          // "5 chỗ"
                .trunk(formatTrunk(v.getTrunkLiters()))    // "450L"
                .status(v.getStatus() != null ? v.getStatus().toUiString() : "available")
                .build();
    }

    public List<VehicleResponse> toResponseList(List<Vehicle> vehicles) {
        return vehicles.stream().map(this::toResponse).toList();
    }

    // ====== Request -> Entity (parse từ UI) ======
    public Vehicle toEntity(VehicleRequest req) {
        return Vehicle.builder()
                .name(req.getName())
                .imageUrl(req.getImage())
                .pricePerDay(parseVnd(req.getPrice()))
                .type(req.getType())
                .rangeKm(parseInt(req.getRange()))
                .seats(parseInt(req.getSeats()))
                .trunkLiters(parseInt(req.getTrunk()))
                .status(VehicleStatus.fromString(req.getStatus()))
                .build();
    }

    public void updateEntity(VehicleRequest req, Vehicle v) {
        if (req.getName() != null) v.setName(req.getName());
        if (req.getImage() != null) v.setImageUrl(req.getImage());
        if (req.getPrice() != null) v.setPricePerDay(parseVnd(req.getPrice()));
        if (req.getType() != null) v.setType(req.getType());
        if (req.getRange() != null) v.setRangeKm(parseInt(req.getRange()));
        if (req.getSeats() != null) v.setSeats(parseInt(req.getSeats()));
        if (req.getTrunk() != null) v.setTrunkLiters(parseInt(req.getTrunk()));
        if (req.getStatus() != null) v.setStatus(VehicleStatus.fromString(req.getStatus()));
    }

    // ====== Helpers ======
    private String nz(String s) { return s == null ? "" : s; }

    private String formatVnd(Long vnd) {
        if (vnd == null) return "";
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(vnd);
    }

    private Long parseVnd(String price) {
        if (price == null || price.isBlank()) return null;
        // bỏ mọi ký tự không phải digit: "1.200.000" -> "1200000"
        String digits = price.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? null : Long.parseLong(digits);
    }

    private String formatRange(Integer km) {
        return km == null ? "" : km + "km";
    }

    private String formatSeats(Integer seats) {
        return seats == null ? "" : seats + " chỗ";
    }

    private String formatTrunk(Integer liters) {
        return liters == null ? "" : liters + "L";
    }

    // chấp nhận "450km"/"450KM"/"450" => 450
    private Integer parseInt(String s) {
        if (s == null || s.isBlank()) return null;
        String digits = s.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? null : Integer.parseInt(digits);
    }
}

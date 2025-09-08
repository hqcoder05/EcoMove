package com.GiaoThongTM.demo.stations.mappers;

import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.dtos.request.StationRequest;
import com.GiaoThongTM.demo.stations.dtos.response.StationResponse;
import org.mapstruct.*;
import java.util.List;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    injectionStrategy = InjectionStrategy.CONSTRUCTOR
)
public interface StationMapper {

    // Entity -> Response (trả về cho React)
    @Mappings({
        @Mapping(target = "id",         source = "stationId"),
        @Mapping(target = "name",       source = "stationName"),
        @Mapping(target = "address",    source = "district"),     // tạm dùng district làm address
        @Mapping(target = "capacity",   source = "totalSlots"),
        @Mapping(target = "status",     expression = "java(computeStatus(entity.getAvailableSlots()))"),
        @Mapping(target = "latitude",   source = "lat"),
        @Mapping(target = "longitude",  source = "lon")
    })
    StationResponse toResponse(Station entity);

    List<StationResponse> toResponseList(List<Station> entities);

    // Request -> Entity (tạo mới)
    @Mappings({
        @Mapping(target = "stationId", ignore = true), // DB tự sinh UUID
        @Mapping(target = "stationName", source = "name"),
        @Mapping(target = "district",    source = "address"), // nếu StationRequest có 'address'
        @Mapping(target = "lat",         source = "latitude"),
        @Mapping(target = "lon",         source = "longitude"),
        @Mapping(target = "totalSlots",  source = "capacity"),
        // nếu không truyền availableSlots, mặc định = capacity
        @Mapping(target = "availableSlots",
                 expression = "java(req.getAvailableSlots() != null ? req.getAvailableSlots() : req.getCapacity())")
    })
    Station toEntity(StationRequest req);

    // Update từng phần (PATCH/PUT)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
        @Mapping(target = "stationId", ignore = true) // không cho sửa ID
    })
    void updateEntityFromRequest(StationRequest req, @MappingTarget Station entity);

    // Helper tính status tạm thời
    default String computeStatus(Integer availableSlots) {
        return (availableSlots != null && availableSlots > 0) ? "Hoạt động" : "Đầy chỗ";
    }
}

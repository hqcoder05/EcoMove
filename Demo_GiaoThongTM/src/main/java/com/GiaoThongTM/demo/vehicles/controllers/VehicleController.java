package com.GiaoThongTM.demo.vehicles.controllers;

import com.GiaoThongTM.demo.vehicles.dtos.request.VehicleRequest;
import com.GiaoThongTM.demo.vehicles.dtos.response.VehicleResponse;
import com.GiaoThongTM.demo.vehicles.entities.Vehicle;
import com.GiaoThongTM.demo.vehicles.mappers.VehicleMapper;
import com.GiaoThongTM.demo.vehicles.repositories.VehicleRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleRepository vehicleRepo;
    private final VehicleMapper mapper;

    @GetMapping
    public List<VehicleResponse> getAll() {
        return mapper.toResponseList(vehicleRepo.findAll());
    }

    @GetMapping("/{id}")
    public VehicleResponse getById(@PathVariable UUID id) {
        Vehicle vehicle = vehicleRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vehicle not found: " + id));
        return mapper.toResponse(vehicle);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleResponse create(@Valid @RequestBody VehicleRequest req) {
        Vehicle entity = mapper.toEntity(req);
        Vehicle saved = vehicleRepo.save(entity);
        return mapper.toResponse(saved);
    }

    @PutMapping("/{id}")
    public VehicleResponse update(@PathVariable UUID id, @Valid @RequestBody VehicleRequest req) {
        Vehicle v = vehicleRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vehicle not found: " + id));
        mapper.updateEntity(req, v);
        Vehicle saved = vehicleRepo.save(v);
        return mapper.toResponse(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        if (!vehicleRepo.existsById(id)) throw new NoSuchElementException("Vehicle not found: " + id);
        vehicleRepo.deleteById(id);
    }
}

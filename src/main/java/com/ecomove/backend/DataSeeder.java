package com.ecomove.backend;

import com.ecomove.backend.model.Station;
import com.ecomove.backend.repository.StationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class DataSeeder {

    private final StationRepository stationRepository;
    private final Random random = new Random();

    public DataSeeder(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @PostConstruct
    public void seedData() {
        stationRepository.deleteAll();

        String[] stationNames = {
                "Trạm Nguyễn Văn Linh",
                "Trạm Lê Lợi",
                "Trạm Hai Bà Trưng",
                "Trạm Cách Mạng Tháng 8",
                "Trạm Tô Hiến Thành"
        };

        for (int i = 0; i < stationNames.length; i++) {
            int capacity = 10 + random.nextInt(10); // 10 đến 19
            int available = random.nextInt(capacity + 1); // 0 đến capacity

            String status;
            if (available == 0) {
                status = "Hết xe";
            } else if (available == capacity) {
                status = "Đầy";
            } else {
                status = "Còn chỗ";
            }

            Station station = new Station(
                    stationNames[i],
                    10.75 + random.nextDouble() * 0.05,
                    106.65 + random.nextDouble() * 0.05,
                    available,
                    capacity,
                    status
            );

            stationRepository.save(station);
        }
    }
}

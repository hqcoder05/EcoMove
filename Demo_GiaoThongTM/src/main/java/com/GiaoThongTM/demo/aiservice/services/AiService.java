package com.GiaoThongTM.demo.aiservice.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.Locale;
import java.util.UUID;

import com.GiaoThongTM.demo.aiservice.dtos.StationData;
import com.GiaoThongTM.demo.aiservice.dtos.request.PredictPayload;
import com.GiaoThongTM.demo.aiservice.dtos.response.PredictItem;
import com.GiaoThongTM.demo.aiservice.repositories.AiServiceRepository;
import com.GiaoThongTM.demo.stations.entities.Station;
import com.GiaoThongTM.demo.stations.repositories.StationRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final AiServiceRepository aiRepo;
    private final StationRepository stationRepo;

    // ============ External Config ============
    private static final String OSRM_BASE_URL =
            System.getenv().getOrDefault("OSRM_BASE_URL", "https://router.project-osrm.org");

    private static final String OPENWEATHER_BASE_URL =
            System.getenv().getOrDefault("OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5/weather");

    private static final String OPENWEATHER_API_KEY =
            System.getenv().getOrDefault("OPENWEATHER_API_KEY", "3600bc84d1584bcd1d3b0583a8908e44"); // demo key

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ============ Python allowed locations ============
    private static final Set<String> PY_ALLOWED_LOCS = Set.of(
            "Binh Thanh", "Go Vap", "Phu Nhuan",
            "Quan 1", "Quan 10", "Quan 3", "Quan 5", "Quan 7",
            "Tan Binh"
    );

    // alias (ASCII+UPPER, remove spaces) -> canonical
    private static final Map<String, String> DISTRICT_ALIAS;
    static {
        Map<String, String> m = new HashMap<>();
        // Quan 1
        m.put("Q1", "Quan 1"); m.put("QUAN1", "Quan 1"); m.put("DIST1", "Quan 1"); m.put("DISTRICT1", "Quan 1");
        m.put("QUANMOT", "Quan 1");
        // Quan 3
        m.put("Q3", "Quan 3"); m.put("QUAN3", "Quan 3"); m.put("QUANBA", "Quan 3");
        // Quan 5
        m.put("Q5", "Quan 5"); m.put("QUAN5", "Quan 5"); m.put("QUANNAM", "Quan 5");
        // Quan 7
        m.put("Q7", "Quan 7"); m.put("QUAN7", "Quan 7"); m.put("QUANBAY", "Quan 7");
        // Quan 10
        m.put("Q10", "Quan 10"); m.put("QUAN10", "Quan 10"); m.put("QUANMUOI", "Quan 10");
        // Tan Binh
        m.put("TANBINH", "Tan Binh");
        // Phu Nhuan
        m.put("PHUNHUAN", "Phu Nhuan"); m.put("PN", "Phu Nhuan");
        // Go Vap
        m.put("GOVAP", "Go Vap"); m.put("GV", "Go Vap");
        // Binh Thanh
        m.put("BINHTHANH", "Binh Thanh"); m.put("BT", "Binh Thanh");
        // Thu Duc (không nằm trong domain Python) -> map sang Binh Thanh (tuỳ chỉnh được)
        m.put("THUDUC", "Binh Thanh");
        m.put("THUDUCCITY", "Binh Thanh");
        m.put("TPTHUDUC", "Binh Thanh");
        m.put("THUDUCQUAN", "Binh Thanh");
        DISTRICT_ALIAS = Collections.unmodifiableMap(m);
    }

    /** Use stations from request (quick test) */
    public JsonNode suggestForUser(double userLat, double userLon, List<StationData> stations) {
        log.info("[SUGGEST] Using {} stations from request body", (stations == null ? 0 : stations.size()));
        return aiRepo.callSuggest(stations, userLat, userLon, 30.0, null, 0.8);
    }

    /** Load stations from DB and (optionally) filter by OSRM distance */
    public JsonNode suggestForUserFromDb(double userLat, double userLon,
                                         Double maxDistanceKm, Double speedKmph, Double slotOccupancyThreshold) {
        Double speed = (speedKmph != null) ? speedKmph : 30.0;
        Double threshold = (slotOccupancyThreshold != null) ? slotOccupancyThreshold : 0.8;

        List<Station> entities = stationRepo.findAll();
        log.info("[SUGGEST] Stations in DB: {}", entities.size());

        List<StationData> dtos = new ArrayList<>(entities.size());
        for (Station s : entities) {
            StationData dto = mapStationToStationDataFlexible(s);
            if (dto.getLat() == null || dto.getLon() == null) {
                log.warn("[SUGGEST] Skip station missing lat/lon: {}", s);
                continue;
            }
            if (maxDistanceKm != null) {
                RouteStat stat = osrmRoute(userLat, userLon, dto.getLat(), dto.getLon());
                if (!stat.ok) {
                    log.warn("[SUGGEST] OSRM failed for station {}: {}", dto.getStationId(), stat.errMsg);
                    continue;
                }
                if (stat.distanceKm > maxDistanceKm) continue;
            }
            dtos.add(dto);
        }

        log.info("[SUGGEST] Stations sent to Python: {}", dtos.size());
        return aiRepo.callSuggest(dtos, userLat, userLon, speed, maxDistanceKm, threshold);
    }

    /**
     * Predict (full DTO):
     * - If 'location' is station id/code/uuid -> resolve to district;
     * - District normalized into 9-value domain that Python accepts;
     * - Weather auto-inferred if empty (OpenWeather, fallback 'cloudy').
     */
    public PredictItem predictDemand(String location, Integer hour, String dayOfWeek, String weather) {
        LocalDateTime now = LocalDateTime.now();

        // 1) station -> district (or keep if already district)
        String rawDistrict = canonicalizeLocationToDistrict(location);
        // 2) normalize to Python domain
        String district = normalizeToAllowedDistrict(rawDistrict);

        // 3) weather
        String autoWeather = (weather == null || weather.isBlank())
                ? inferWeatherForDistrict(district)
                : weather;

        // 4) normalize time / DOW / weather
        int normHour = normalizeHour(hour != null ? hour : now.getHour());
        String normDow = toCanonicalDow(
                (dayOfWeek == null || dayOfWeek.isBlank())
                        ? now.getDayOfWeek().name()
                        : dayOfWeek
        );
        String normWeather = toCanonicalWeather(autoWeather);

        PredictPayload req = new PredictPayload();
        req.setLocation(district);
        req.setHour(normHour);
        req.setDayOfWeek(normDow);
        req.setWeather(normWeather);

        log.info("[PREDICT] calling Python with location(district)={}, hour={}, dayOfWeek={}, weather={}",
                district, normHour, normDow, normWeather);

        return aiRepo.callPredict(req);
    }

    /** Predict-min: return only { "predicted_demand": number|null } rounded to 2 decimals */
    public JsonNode predictDemandMinimal(String location, Integer hour, String dayOfWeek, String weather) {
        PredictItem item = predictDemand(location, hour, dayOfWeek, weather);
        ObjectNode out = MAPPER.createObjectNode();
        if (item != null && item.getPredictedDemand() != null) {
            BigDecimal rounded = BigDecimal.valueOf(item.getPredictedDemand()).setScale(2, RoundingMode.HALF_UP);
            out.put("predicted_demand", rounded.doubleValue());
        } else {
            out.putNull("predicted_demand");
        }
        return out;
    }

    /** Bulk predict for all stations for next hour; sorted desc by predicted_demand. */
    public List<ObjectNode> predictNextHourAll(Integer limit) {
        LocalDateTime next = LocalDateTime.now().plusHours(1);
        int hour = next.getHour();
        String dow = next.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH); // Sunday..Saturday

        List<Station> stations = stationRepo.findAll();
        List<ObjectNode> out = new ArrayList<>(stations.size());

        for (Station s : stations) {
            BeanWrapper bw = new BeanWrapperImpl(s);
            Object idOrCode = firstNonNull(bw, "stationId", "code", "id", "uuid");
            String locationKey = (idOrCode != null) ? String.valueOf(idOrCode) : getDistrictFlexible(s);
            if (locationKey == null || locationKey.isBlank()) continue;

            try {
                PredictItem item = predictDemand(locationKey, hour, dow, null);
                Double pd = (item != null) ? item.getPredictedDemand() : null;
                if (pd == null) continue;

                ObjectNode node = MAPPER.createObjectNode();
                node.put("stationId", (idOrCode != null) ? String.valueOf(idOrCode) : null);
                node.put("name", getStringFlexible(bw, "name", "stationName", "title", "code"));
                node.put("district", getDistrictFlexible(s));
                node.put("predicted_demand", BigDecimal.valueOf(pd).setScale(2, RoundingMode.HALF_UP).doubleValue());
                out.add(node);
            } catch (Exception e) {
                log.warn("[BULK] station {} failed: {}", locationKey, e.getMessage());
            }
        }

        out.sort(Comparator.comparing((JsonNode n) ->
                n.path("predicted_demand").asDouble(Double.NEGATIVE_INFINITY)).reversed());

        if (limit != null && limit > 0 && out.size() > limit) {
            return out.subList(0, limit);
        }
        return out;
    }

    /** Bulk predict next hour but only one item per district (unique). */
    public List<ObjectNode> predictNextHourUniqueDistricts(Integer limit) {
        LocalDateTime next = LocalDateTime.now().plusHours(1);
        int hour = next.getHour();
        String dow = next.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        // choose 1 representative station per normalized district
        Map<String, Station> representative = new LinkedHashMap<>();
        for (Station s : stationRepo.findAll()) {
            String raw = getDistrictFlexible(s);
            if (raw == null || raw.isBlank()) continue;
            String norm = normalizeToAllowedDistrict(raw);
            representative.putIfAbsent(norm, s);
        }

        List<ObjectNode> out = new ArrayList<>();
        for (Map.Entry<String, Station> e : representative.entrySet()) {
            String district = e.getKey();
            Station rep = e.getValue();
            try {
                PredictItem item = predictDemand(district, hour, dow, null);
                Double pd = (item != null) ? item.getPredictedDemand() : null;
                if (pd == null) continue;

                BeanWrapper bw = new BeanWrapperImpl(rep);
                ObjectNode node = MAPPER.createObjectNode();
                node.put("district", district);
                node.put("repStationId", String.valueOf(firstNonNull(bw, "stationId", "code", "id", "uuid")));
                node.put("repStationName", getStringFlexible(bw, "name", "stationName", "title", "code"));
                node.put("predicted_demand",
                        BigDecimal.valueOf(pd).setScale(2, RoundingMode.HALF_UP).doubleValue());
                out.add(node);
            } catch (Exception ex) {
                log.warn("[BULK-UNIQ] district {} failed: {}", district, ex.getMessage());
            }
        }

        out.sort(Comparator.comparing((JsonNode n) ->
                n.path("predicted_demand").asDouble(Double.NEGATIVE_INFINITY)).reversed());
        if (limit != null && limit > 0 && out.size() > limit) return out.subList(0, limit);
        return out;
    }

    /** Post-filtering approach: compute all, then keep the top-one per district (already sorted desc). */
    public List<ObjectNode> predictNextHourAllDedup(Integer limit) {
        List<ObjectNode> raw = predictNextHourAll(null);
        Map<String, ObjectNode> unique = new LinkedHashMap<>();
        for (ObjectNode n : raw) {
            String district = n.path("district").asText(null);
            if (district == null) continue;
            unique.putIfAbsent(district, n); // keep the highest (raw was desc-sorted)
        }
        List<ObjectNode> out = new ArrayList<>(unique.values());
        if (limit != null && limit > 0 && out.size() > limit) return out.subList(0, limit);
        return out;
    }

    // ============ District & Weather helpers ============
    /** If input is station id/code/uuid -> return its district; if already district -> keep. */
    private String canonicalizeLocationToDistrict(String location) {
        if (location == null || location.isBlank()) return location;
        String key = asciiUpper(location);

        // match known district from any station
        for (Station s : stationRepo.findAll()) {
            String d = getDistrictFlexible(s);
            if (d != null && asciiUpper(d).equals(key)) {
                return d;
            }
        }

        // resolve by id/uuid/code/stationId
        Station st = resolveStation(location);
        if (st != null) {
            String d = getDistrictFlexible(st);
            if (d != null && !d.isBlank()) return d;
        }

        // fallback
        return location;
    }

    /** Normalize district into 9-value domain; fallback to "Quan 1". */
    private String normalizeToAllowedDistrict(String district) {
        if (district == null || district.isBlank()) {
            log.warn("[DISTRICT] Missing district -> fallback 'Quan 1'");
            return "Quan 1";
        }
        String key = asciiUpper(district);

        // alias table
        String mapped = DISTRICT_ALIAS.get(key);
        if (mapped != null) return mapped;

        // direct match to allowed set
        for (String allowed : PY_ALLOWED_LOCS) {
            if (asciiUpper(allowed).equals(key)) return allowed;
        }

        // safe fallback
        log.warn("[DISTRICT] '{}' not allowed by Python. Fallback -> 'Quan 1'", district);
        return "Quan 1";
    }

    /** Infer weather (sunny|rainy|cloudy) from OpenWeather by district centroid. */
    private String inferWeatherForDistrict(String districtName) {
        try {
            if (districtName == null || districtName.isBlank()) {
                log.warn("[WEATHER] Missing district -> fallback 'cloudy'");
                return "cloudy";
            }
            if (OPENWEATHER_API_KEY == null || OPENWEATHER_API_KEY.isBlank()) {
                log.warn("[WEATHER] Missing OPENWEATHER_API_KEY -> fallback 'cloudy'");
                return "cloudy";
            }

            String target = asciiUpper(districtName);
            double sumLat = 0, sumLon = 0; int cnt = 0;
            for (Station s : stationRepo.findAll()) {
                String d = getDistrictFlexible(s);
                if (d != null && asciiUpper(d).equals(target)) {
                    Double lat = getDoubleFlexible(s, "lat", "latitude", "geoLat", "latDeg", "latitudeDeg", "y");
                    Double lon = getDoubleFlexible(s, "lon", "lng", "longitude", "long", "geoLon", "lonDeg", "longitudeDeg", "x");
                    if (lat != null && lon != null) { sumLat += lat; sumLon += lon; cnt++; }
                }
            }
            if (cnt == 0) {
                log.warn("[WEATHER] No stations in district '{}' -> fallback 'cloudy'", districtName);
                return "cloudy";
            }
            double lat = sumLat / cnt;
            double lon = sumLon / cnt;

            String url = String.format(Locale.US, "%s?lat=%f&lon=%f&appid=%s",
                    OPENWEATHER_BASE_URL, lat, lon, OPENWEATHER_API_KEY);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", "EcoMove-AIService/1.0")
                    .build();

            HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() / 100 != 2) {
                log.warn("[WEATHER] HTTP {} from OpenWeather -> fallback 'cloudy'", resp.statusCode());
                return "cloudy";
            }
            JsonNode root = MAPPER.readTree(resp.body());
            String main = null;
            JsonNode w = root.path("weather");
            if (w.isArray() && w.size() > 0) main = w.get(0).path("main").asText(null);

            return mapOpenWeatherMainTo3Class(main);
        } catch (Exception e) {
            log.warn("[WEATHER] infer failed: {}", e.getMessage());
            return "cloudy";
        }
    }

    /** Map OpenWeather "main" -> sunny|rainy|cloudy. */
    private String mapOpenWeatherMainTo3Class(String main) {
        if (main == null || main.isBlank()) return "cloudy";
        String k = main.trim().toUpperCase(Locale.ENGLISH);
        if (k.equals("CLEAR")) return "sunny";
        if (k.equals("RAIN") || k.equals("DRIZZLE") || k.equals("THUNDERSTORM")) return "rainy";
        return "cloudy";
    }

    /** Resolve station by UUID (CrudRepository<Station, UUID>), fallback scan by stationId/code/id. */
    private Station resolveStation(String idOrCode) {
        if (idOrCode == null || idOrCode.isBlank()) return null;

        // 1) UUID path
        try {
            UUID uuid = UUID.fromString(idOrCode.trim());
            return stationRepo.findById(uuid).orElse(null);
        } catch (IllegalArgumentException ignore) { }

        // 2) Scan for common identifiers
        for (Station s : stationRepo.findAll()) {
            BeanWrapper bw = new BeanWrapperImpl(s);
            Object any = firstNonNull(bw, "stationId", "code", "id");
            if (any != null && String.valueOf(any).equalsIgnoreCase(idOrCode)) {
                return s;
            }
        }
        return null;
    }

    private String getDistrictFlexible(Station s) {
        BeanWrapper bw = new BeanWrapperImpl(s);
        Object v = firstNonNull(bw, "district", "districtName", "quan", "quanHuyen", "area");
        return (v == null) ? null : String.valueOf(v);
    }

    private Double getDoubleFlexible(Station s, String... names) {
        BeanWrapper bw = new BeanWrapperImpl(s);
        for (String n : names) {
            if (bw.isReadableProperty(n)) {
                Object v = bw.getPropertyValue(n);
                if (v instanceof Number num) return num.doubleValue();
                try { return Double.parseDouble(String.valueOf(v)); } catch (Exception ignore) {}
            }
        }
        return null;
    }

    private String getStringFlexible(BeanWrapper bw, String... props) {
        Object v = firstNonNull(bw, props);
        return v == null ? null : String.valueOf(v);
    }

    // ============ DOW & Weather normalization ============
    private static final Map<String, String> DOW_ALIASES;
    static {
        Map<String, String> m = new HashMap<>();
        m.put("SUN", "Sunday");      m.put("SUNDAY", "Sunday");
        m.put("MON", "Monday");      m.put("MONDAY", "Monday");
        m.put("TUE", "Tuesday");     m.put("TUESDAY", "Tuesday");
        m.put("WED", "Wednesday");   m.put("WEDNESDAY", "Wednesday");
        m.put("THU", "Thursday");    m.put("THUR", "Thursday"); m.put("THURSDAY", "Thursday");
        m.put("FRI", "Friday");      m.put("FRIDAY", "Friday");
        m.put("SAT", "Saturday");    m.put("SATURDAY", "Saturday");
        // Vietnamese short/no-accent
        m.put("CN", "Sunday");       m.put("CHUNHAT", "Sunday");
        m.put("T2", "Monday");       m.put("THU2", "Monday");     m.put("THUHAI", "Monday");
        m.put("T3", "Tuesday");      m.put("THU3", "Tuesday");    m.put("THUBA", "Tuesday");
        m.put("T4", "Wednesday");    m.put("THU4", "Wednesday");  m.put("THUTU", "Wednesday");
        m.put("T5", "Thursday");     m.put("THU5", "Thursday");   m.put("THUNAM", "Thursday");
        m.put("T6", "Friday");       m.put("THU6", "Friday");     m.put("THUSAU", "Friday");
        m.put("T7", "Saturday");     m.put("THU7", "Saturday");   m.put("THUBAY", "Saturday");
        DOW_ALIASES = Collections.unmodifiableMap(m);
    }

    private int normalizeHour(Integer h) {
        if (h == null) return 0;
        if (h < 0) return 0;
        if (h > 23) return 23;
        return h;
    }

    private String toCanonicalDow(String input) {
        if (input == null) return null;
        String key = asciiUpper(input);
        String fromAlias = DOW_ALIASES.get(key);
        if (fromAlias != null) return fromAlias;
        try {
            DayOfWeek dow = DayOfWeek.valueOf(key);
            return dow.getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        } catch (Exception ignore) { }
        String t = input.trim().toLowerCase(Locale.ENGLISH);
        if (t.isEmpty()) return null;
        return Character.toUpperCase(t.charAt(0)) + t.substring(1);
    }

    private String toCanonicalWeather(String w) {
        if (w == null || w.isBlank()) return "cloudy";
        String t = asciiUpper(w);
        if (Set.of("SUN", "SUNNY", "CLEAR", "CLEARSKY", "FAIR").contains(t)) return "sunny";
        if (Set.of("RAIN", "RAINY", "LIGHTRAIN", "DRIZZLE", "STORM", "THUNDER",
                "THUNDERSTORM", "SHOWER", "SHOWERS").contains(t)) return "rainy";
        if (Set.of("CLOUD", "CLOUDS", "CLOUDY", "OVERCAST", "PARTLYCLOUDY", "BROKENCLOUDS",
                "SCATTEREDCLOUDS", "FEWCLOUDS", "MIST", "FOG", "HAZE", "SMOKE",
                "DUST", "SAND").contains(t)) return "cloudy";
        String low = w.trim().toLowerCase(Locale.ENGLISH);
        if (Set.of("sunny", "rainy", "cloudy").contains(low)) return low;
        return "cloudy";
    }

    private String asciiUpper(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD);
        n = n.replaceAll("\\p{M}", "");
        n = n.replaceAll("[^A-Za-z0-9 ]", "");
        n = n.replaceAll("\\s+", "");
        return n.toUpperCase(Locale.ENGLISH);
    }

    // ============ OSRM helpers ============
    private record RouteStat(boolean ok, double distanceKm, double durationMin, String errMsg) {}

    private RouteStat osrmRoute(double lat1, double lon1, double lat2, double lon2) {
        try {
            String path = String.format("%s/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false&alternatives=false&steps=false",
                    OSRM_BASE_URL, lon1, lat1, lon2, lat2);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(path))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", "EcoMove-AIService/1.0")
                    .build();

            HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) return new RouteStat(false, 0, 0, "HTTP " + resp.statusCode());
            JsonNode root = MAPPER.readTree(resp.body());
            if (!"Ok".equalsIgnoreCase(root.path("code").asText()))
                return new RouteStat(false, 0, 0, "OSRM code: " + root.path("code").asText());
            JsonNode routes = root.path("routes");
            if (!routes.isArray() || routes.isEmpty()) return new RouteStat(false, 0, 0, "No routes");
            JsonNode r0 = routes.get(0);
            double km = r0.path("distance").asDouble(0.0) / 1000.0;
            double min = r0.path("duration").asDouble(0.0) / 60.0;
            return new RouteStat(true, km, min, null);
        } catch (Exception e) {
            return new RouteStat(false, 0, 0, e.getMessage());
        }
    }

    // ============ Mapping helpers ============
    private StationData mapStationToStationDataFlexible(Station s) {
        BeanWrapper bw = new BeanWrapperImpl(s);
        StationData dto = new StationData();

        Object id = firstNonNull(bw, "stationId", "id", "code");
        if (id != null) dto.setStationId(String.valueOf(id));

        Double lat = asDouble(firstNonNull(bw, "lat", "latitude", "y", "geoLat", "latDeg", "latitudeDeg"));
        Double lon = asDouble(firstNonNull(bw, "lon", "lng", "longitude", "long", "longtitude", "x", "geoLon", "lonDeg", "longitudeDeg"));
        dto.setLat(lat);
        dto.setLon(lon);

        Integer total = asInt(firstNonNull(bw, "totalSlots", "capacity", "numSlots", "totalSlot"));
        Integer avail = asInt(firstNonNull(bw, "availableSlots", "available", "freeSlots", "free"));
        dto.setTotalSlots(total != null ? total : 0);
        dto.setAvailableSlots(avail != null ? avail : 0);

        return dto;
    }

    private Object firstNonNull(BeanWrapper bw, String... props) {
        for (String p : props) {
            if (bw.isReadableProperty(p)) {
                Object v = bw.getPropertyValue(p);
                if (v != null) return v;
            }
        }
        return null;
    }

    private Double asDouble(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return null; }
    }

    private Integer asInt(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(v)); } catch (Exception e) { return null; }
    }
}

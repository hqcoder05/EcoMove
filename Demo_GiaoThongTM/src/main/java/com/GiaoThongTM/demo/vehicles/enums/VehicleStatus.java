package com.GiaoThongTM.demo.vehicles.enums;

public enum VehicleStatus {
    AVAILABLE, RENTED, MAINTENANCE;

    public static VehicleStatus fromString(String s) {
        if (s == null) return AVAILABLE;
        return switch (s.toLowerCase()) {
            case "rented" -> RENTED;
            case "maintenance" -> MAINTENANCE;
            default -> AVAILABLE;
        };
    }

    public String toUiString() {
        return switch (this) {
            case RENTED -> "rented";
            case MAINTENANCE -> "maintenance";
            default -> "available";
        };
    }
}

package com.GiaoThongTM.demo.stations.projections;

public interface StationQuickView {
    String getId();
    Double getLat();
    Double getLon();
    Integer getTotalSlots();
    Integer getAvailableSlots();
    Double getDistKm();
}

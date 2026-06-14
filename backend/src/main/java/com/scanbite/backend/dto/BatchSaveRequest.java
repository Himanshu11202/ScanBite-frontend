package com.scanbite.backend.dto;

import java.util.List;

public class BatchSaveRequest {
    private Long cafeId;
    private List<ScannedMenuItem> items;

    public Long getCafeId() { return cafeId; }
    public void setCafeId(Long cafeId) { this.cafeId = cafeId; }
    public List<ScannedMenuItem> getItems() { return items; }
    public void setItems(List<ScannedMenuItem> items) { this.items = items; }
}

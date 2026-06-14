package com.scanbite.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CafeDto {
    private Long id;

    @NotBlank
    private String name;

    private String address;
    private String phone;
    private Long ownerId;
    private String imageUrl;
    private String openingTime;
    private String closingTime;
    private Integer totalTables;
    private String description;
    private String coverPhotos;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getOpeningTime() { return openingTime; }
    public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }
    public String getClosingTime() { return closingTime; }
    public void setClosingTime(String closingTime) { this.closingTime = closingTime; }
    public Integer getTotalTables() { return totalTables; }
    public void setTotalTables(Integer totalTables) { this.totalTables = totalTables; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCoverPhotos() { return coverPhotos; }
    public void setCoverPhotos(String coverPhotos) { this.coverPhotos = coverPhotos; }
}

package com.scanbite.backend.dto;

public class ScannedMenuItem {
    private String name;
    private double price;
    private String categoryName;
    private boolean veg;
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public boolean isVeg() { return veg; }
    public void setVeg(boolean veg) { this.veg = veg; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

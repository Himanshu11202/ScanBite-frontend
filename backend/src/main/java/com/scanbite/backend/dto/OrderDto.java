package com.scanbite.backend.dto;

import java.util.List;

public class OrderDto {
    public Long id;
    public List<OrderItemDto> items;
    public double subtotal;
    public boolean paid;
    public String status;
    public String customerName;
    public String customerPhone;
    public String tableNumber;
    public String instructions;
}

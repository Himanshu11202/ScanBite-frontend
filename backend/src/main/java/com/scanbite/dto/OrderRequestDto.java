package com.scanbite.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDto {

    @NotNull
    private Long tableId;

    @NotNull
    private Long customerId;

    @NotEmpty
    private List<OrderItemDto> items;
}

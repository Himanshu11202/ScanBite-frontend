package com.scanbite.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemDto {

    @NotNull
    private Long menuItemId;

    @NotNull
    private Integer quantity;
}

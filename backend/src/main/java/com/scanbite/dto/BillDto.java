package com.scanbite.dto;

import lombok.Data;

@Data
public class BillDto {
    private Long id;
    private Long orderId;
    private Double amountDue;
    private Boolean paid;
}

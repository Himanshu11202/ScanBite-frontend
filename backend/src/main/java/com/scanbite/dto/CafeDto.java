package com.scanbite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CafeDto {

    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String location;

    @NotBlank
    private String timezone;
}

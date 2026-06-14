package com.scanbite.backend.controller;

import com.scanbite.backend.dto.CafeDto;
import com.scanbite.backend.model.Cafe;
import com.scanbite.backend.service.CafeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cafes")
public class CafeController {

    private final CafeService cafeService;

    public CafeController(CafeService cafeService) {
        this.cafeService = cafeService;
    }

    @PostMapping
    public ResponseEntity<CafeDto> createCafe(@Valid @RequestBody CafeDto dto) {
        Cafe saved = cafeService.createCafe(dto);
        return new ResponseEntity<>(toDto(saved), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CafeDto> updateCafe(@PathVariable Long id, @RequestBody CafeDto dto) {
        Cafe updated = cafeService.updateCafe(id, dto);
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCafe(@PathVariable Long id) {
        cafeService.deleteCafe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CafeDto>> listCafes() {
        List<Cafe> cafes = cafeService.listCafes();
        List<CafeDto> dtos = cafes.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CafeDto> getCafe(@PathVariable Long id) {
        Cafe cafe = cafeService.getCafe(id);
        return ResponseEntity.ok(toDto(cafe));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CafeDto> uploadImage(@PathVariable Long id, @RequestPart("file") MultipartFile file) throws IOException {
        Cafe cafe = cafeService.uploadImage(id, file);
        return ResponseEntity.ok(toDto(cafe));
    }

    @PostMapping(value = "/{id}/covers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CafeDto> uploadCovers(@PathVariable Long id, @RequestPart("files") java.util.List<MultipartFile> files) throws IOException {
        Cafe cafe = cafeService.uploadCovers(id, files);
        return ResponseEntity.ok(toDto(cafe));
    }

    private CafeDto toDto(Cafe cafe) {
        CafeDto dto = new CafeDto();
        dto.setId(cafe.getId());
        dto.setName(cafe.getName());
        dto.setAddress(cafe.getAddress());
        dto.setPhone(cafe.getPhone());
        if (cafe.getOwner() != null) dto.setOwnerId(cafe.getOwner().getId());
        dto.setImageUrl(cafe.getImageUrl());
        dto.setOpeningTime(cafe.getOpeningTime());
        dto.setClosingTime(cafe.getClosingTime());
        dto.setTotalTables(cafe.getTotalTables());
        dto.setDescription(cafe.getDescription());
        dto.setCoverPhotos(cafe.getCoverPhotos());
        return dto;
    }
}

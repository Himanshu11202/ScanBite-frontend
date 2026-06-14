package com.scanbite.backend.controller;

import com.scanbite.backend.model.MenuCategory;
import com.scanbite.backend.service.MenuCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/categories")
public class MenuCategoryController {

    private final MenuCategoryService service;

    public MenuCategoryController(MenuCategoryService service) { this.service = service; }

    @GetMapping("/cafe/{cafeId}")
    public ResponseEntity<List<MenuCategory>> listByCafe(@PathVariable Long cafeId) {
        return ResponseEntity.ok(service.listByCafe(cafeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuCategory> get(@PathVariable Long id) { return ResponseEntity.ok(service.get(id)); }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<MenuCategory> create(@Valid @RequestBody MenuCategory dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<MenuCategory> update(@PathVariable Long id, @RequestBody MenuCategory dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}

package com.scanbite.backend.controller;

import com.scanbite.backend.model.MenuItem;
import com.scanbite.backend.model.Cafe;
import com.scanbite.backend.model.MenuCategory;
import com.scanbite.backend.dto.BatchSaveRequest;
import com.scanbite.backend.dto.ScannedMenuItem;
import com.scanbite.backend.repository.CafeRepository;
import com.scanbite.backend.repository.MenuCategoryRepository;
import com.scanbite.backend.service.MenuService;
import com.scanbite.backend.service.MenuScannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
    private final MenuService menuService;
    private final MenuScannerService menuScannerService;
    private final CafeRepository cafeRepository;
    private final MenuCategoryRepository menuCategoryRepository;

    public MenuController(MenuService menuService,
                          MenuScannerService menuScannerService,
                          CafeRepository cafeRepository,
                          MenuCategoryRepository menuCategoryRepository) {
        this.menuService = menuService;
        this.menuScannerService = menuScannerService;
        this.cafeRepository = cafeRepository;
        this.menuCategoryRepository = menuCategoryRepository;
    }

    @GetMapping
    public List<MenuItem> list() { return menuService.listAll(); }

    @GetMapping("/category/{cat}")
    public List<MenuItem> byCategory(@PathVariable String cat) { return menuService.listByCategory(cat); }

    @GetMapping("/{id}")
    public MenuItem get(@PathVariable Long id) { return menuService.getById(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody MenuItem item) { return ResponseEntity.ok(menuService.create(item)); }

    @PostMapping(value = "/{id}/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestPart("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(menuService.uploadImage(id, file));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MenuItem patch) { return ResponseEntity.ok(menuService.update(id, patch)); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) { menuService.delete(id); return ResponseEntity.noContent().build(); }

    @PostMapping(value = "/scan", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<?> scanMenu(@RequestParam("file") MultipartFile file) {
        try {
            List<ScannedMenuItem> result = menuScannerService.scanMenu(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','CAFE_ADMIN')")
    public ResponseEntity<?> batchSave(@RequestBody BatchSaveRequest request) {
        Cafe cafe = cafeRepository.findById(request.getCafeId()).orElse(null);
        if (cafe == null) {
            return ResponseEntity.badRequest().body("Cafe not found");
        }
        java.util.List<MenuItem> savedItems = new java.util.ArrayList<>();
        for (ScannedMenuItem itemDto : request.getItems()) {
            String catName = itemDto.getCategoryName();
            if (catName == null || catName.trim().isEmpty()) {
                catName = "Uncategorized";
            }
            final String finalCatName = catName.trim();
            MenuCategory category = menuCategoryRepository.findByCafe_IdOrderBySortOrder(cafe.getId())
                .stream()
                .filter(c -> c.getName().equalsIgnoreCase(finalCatName))
                .findFirst()
                .orElseGet(() -> {
                    MenuCategory newCat = new MenuCategory();
                    newCat.setName(finalCatName);
                    newCat.setCafe(cafe);
                    newCat.setSortOrder(0);
                    return menuCategoryRepository.save(newCat);
                });

            MenuItem item = new MenuItem();
            item.setName(itemDto.getName());
            item.setPrice(itemDto.getPrice());
            item.setVeg(itemDto.isVeg());
            item.setDescription(itemDto.getDescription());
            item.setCafe(cafe);
            item.setCategory(category);
            item.setAvailable(true);
            savedItems.add(menuService.create(item));
        }
        return ResponseEntity.ok(savedItems);
    }
}

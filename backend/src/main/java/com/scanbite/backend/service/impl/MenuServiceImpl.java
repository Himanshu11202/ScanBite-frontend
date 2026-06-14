package com.scanbite.backend.service.impl;

import com.scanbite.backend.exception.ResourceNotFoundException;
import com.scanbite.backend.model.MenuItem;
import com.scanbite.backend.repository.MenuItemRepository;
import com.scanbite.backend.service.MenuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@Transactional
public class MenuServiceImpl implements MenuService {
    private final MenuItemRepository repo;

    public MenuServiceImpl(MenuItemRepository repo) { this.repo = repo; }

    @Override
    public List<MenuItem> listAll() { return repo.findAll(); }

    @Override
    public List<MenuItem> listByCategory(String category) { return repo.findByCategory_Name(category); }

    @Override
    public MenuItem getById(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id)); }

    @Override
    public MenuItem create(MenuItem item) { return repo.save(item); }

    @Override
    public MenuItem update(Long id, MenuItem patch) {
        MenuItem existing = getById(id);
        if (patch.getName() != null) existing.setName(patch.getName());
        existing.setPrice(patch.getPrice());
        existing.setDescription(patch.getDescription());
        existing.setCategory(patch.getCategory());
        existing.setImageUrl(patch.getImageUrl());
        existing.setVeg(patch.isVeg());
        existing.setSpicy(patch.getSpicy());
        existing.setAvailable(patch.isAvailable());
        return repo.save(existing);
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public MenuItem uploadImage(Long id, MultipartFile file) throws IOException {
        MenuItem existing = getById(id);
        if (file == null || file.isEmpty()) return existing;
        String uploads = "uploads/menu/" + id;
        Path dir = Paths.get(uploads);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String original = file.getOriginalFilename();
        String filename = System.currentTimeMillis() + "_" + (original != null ? original.replaceAll("\\s+", "_") : "image");
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);
        existing.setImageUrl("/uploads/menu/" + id + "/" + filename);
        return repo.save(existing);
    }
}

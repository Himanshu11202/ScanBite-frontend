package com.scanbite.backend.service.impl;

import com.scanbite.backend.dto.CafeDto;
import com.scanbite.backend.exception.ResourceNotFoundException;
import com.scanbite.backend.model.Cafe;
import com.scanbite.backend.model.User;
import com.scanbite.backend.repository.CafeRepository;
import com.scanbite.backend.repository.UserRepository;
import com.scanbite.backend.service.CafeService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
public class CafeServiceImpl implements CafeService {

    private final CafeRepository cafeRepository;
    private final UserRepository userRepository;

    public CafeServiceImpl(CafeRepository cafeRepository, UserRepository userRepository) {
        this.cafeRepository = cafeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Cafe createCafe(CafeDto dto) {
        Cafe cafe = new Cafe();
        cafe.setName(dto.getName());
        cafe.setAddress(dto.getAddress());
        cafe.setPhone(dto.getPhone());
        if (dto.getOwnerId() != null) {
            Optional<User> owner = userRepository.findById(dto.getOwnerId());
            owner.ifPresent(cafe::setOwner);
        }
        cafe.setImageUrl(dto.getImageUrl());
        cafe.setOpeningTime(dto.getOpeningTime());
        cafe.setClosingTime(dto.getClosingTime());
        cafe.setTotalTables(dto.getTotalTables());
        cafe.setDescription(dto.getDescription());
        cafe.setCoverPhotos(dto.getCoverPhotos());
        return cafeRepository.save(cafe);
    }

    @Override
    public Cafe updateCafe(Long id, CafeDto dto) {
        Cafe cafe = cafeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cafe", "id", id));
        if (dto.getName() != null) cafe.setName(dto.getName());
        if (dto.getAddress() != null) cafe.setAddress(dto.getAddress());
        if (dto.getPhone() != null) cafe.setPhone(dto.getPhone());
        if (dto.getOpeningTime() != null) cafe.setOpeningTime(dto.getOpeningTime());
        if (dto.getClosingTime() != null) cafe.setClosingTime(dto.getClosingTime());
        if (dto.getTotalTables() != null) cafe.setTotalTables(dto.getTotalTables());
        if (dto.getDescription() != null) cafe.setDescription(dto.getDescription());
        if (dto.getCoverPhotos() != null) cafe.setCoverPhotos(dto.getCoverPhotos());
        if (dto.getOwnerId() != null) {
            userRepository.findById(dto.getOwnerId()).ifPresent(cafe::setOwner);
        }
        return cafeRepository.save(cafe);
    }

    @Override
    public void deleteCafe(Long id) {
        if (!cafeRepository.existsById(id)) throw new ResourceNotFoundException("Cafe", "id", id);
        cafeRepository.deleteById(id);
    }

    @Override
    public List<Cafe> listCafes() {
        return cafeRepository.findAll();
    }

    @Override
    public Cafe getCafe(Long id) {
        return cafeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cafe", "id", id));
    }

    @Override
    public Cafe uploadImage(Long id, MultipartFile file) throws IOException {
        Cafe cafe = cafeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cafe", "id", id));
        if (file == null || file.isEmpty()) {
            return cafe;
        }
        String uploadsBase = "uploads/cafes/" + id;
        Path dir = Path.of(uploadsBase);
        Files.createDirectories(dir);
        String filename = System.currentTimeMillis() + "-" + file.getOriginalFilename();
        Path target = dir.resolve(filename).toAbsolutePath();
        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        // store path relative to server root
        String imageUrl = "/" + uploadsBase + "/" + filename;
        cafe.setImageUrl(imageUrl);
        return cafeRepository.save(cafe);
    }

    @Override
    public Cafe uploadCovers(Long id, List<MultipartFile> files) throws IOException {
        Cafe cafe = cafeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cafe", "id", id));
        if (files == null || files.isEmpty()) {
            return cafe;
        }
        String uploadsBase = "uploads/cafes/" + id + "/covers";
        Path dir = Path.of(uploadsBase);
        Files.createDirectories(dir);
        java.util.List<String> urls = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            String filename = System.currentTimeMillis() + "-" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path target = dir.resolve(filename).toAbsolutePath();
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            urls.add("/" + uploadsBase + "/" + filename);
        }
        if (!urls.isEmpty()) {
            String combined = String.join(",", urls);
            cafe.setCoverPhotos(combined);
            cafeRepository.save(cafe);
        }
        return cafe;
    }
}

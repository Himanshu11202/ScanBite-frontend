package com.scanbite.backend.controller;

import com.scanbite.backend.service.CafeTableService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import com.scanbite.backend.model.CafeTable;
import com.scanbite.backend.repository.CafeTableRepository;
import com.scanbite.backend.repository.CafeRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final CafeTableService cafeTableService;
    private final CafeTableRepository cafeTableRepository;
    private final CafeRepository cafeRepository;

    public TableController(CafeTableService cafeTableService,
                           CafeTableRepository cafeTableRepository,
                           CafeRepository cafeRepository) {
        this.cafeTableService = cafeTableService;
        this.cafeTableRepository = cafeTableRepository;
        this.cafeRepository = cafeRepository;
    }

    @GetMapping("/cafe/{cafeId}")
    public ResponseEntity<?> listByCafe(@PathVariable Long cafeId) {
        return ResponseEntity.ok(cafeTableRepository.findByCafe_Id(cafeId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CafeTable table) {
        if (table.getCafe() == null || table.getCafe().getId() == null) {
            return ResponseEntity.badRequest().body("Cafe ID is required");
        }
        com.scanbite.backend.model.Cafe cafe = cafeRepository.findById(table.getCafe().getId()).orElse(null);
        if (cafe == null) {
            return ResponseEntity.badRequest().body("Cafe not found");
        }
        table.setCafe(cafe);
        table.setStatus(com.scanbite.backend.model.TableStatus.AVAILABLE);
        CafeTable saved = cafeTableRepository.save(table);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!cafeTableRepository.existsById(id)) return ResponseEntity.notFound().build();
        cafeTableRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") String statusStr) {
        com.scanbite.backend.model.CafeTable table = cafeTableRepository.findById(id).orElse(null);
        if (table == null) return ResponseEntity.notFound().build();
        try {
            table.setStatus(com.scanbite.backend.model.TableStatus.valueOf(statusStr.toUpperCase()));
            com.scanbite.backend.model.CafeTable saved = cafeTableRepository.save(table);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }

    @PostMapping("/{id}/qr")
    public ResponseEntity<?> generateQr(@PathVariable("id") Long id) {
        try {
            String publicUrl = cafeTableService.generateQrForTable(id);
            Map<String, String> body = new HashMap<>();
            body.put("qrImageUrl", publicUrl);
            body.put("download", "/api/tables/" + id + "/qr/download");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/qr/download")
    public ResponseEntity<byte[]> downloadQr(@PathVariable("id") Long id) {
        try {
            byte[] image = cafeTableService.getQrImageForTable(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(image.length);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=table-" + id + "-qr.png");
            return new ResponseEntity<>(image, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}

package com.scanbite.backend.service;

import com.scanbite.backend.model.MenuItem;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface MenuService {
    List<MenuItem> listAll();
    List<MenuItem> listByCategory(String category);
    MenuItem getById(Long id);
    MenuItem create(MenuItem item);
    MenuItem update(Long id, MenuItem patch);
    void delete(Long id);
    MenuItem uploadImage(Long id, MultipartFile file) throws IOException;
}

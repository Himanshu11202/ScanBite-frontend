package com.scanbite.backend.service;

import com.scanbite.backend.dto.CafeDto;
import com.scanbite.backend.model.Cafe;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CafeService {
    Cafe createCafe(CafeDto dto);
    Cafe updateCafe(Long id, CafeDto dto);
    void deleteCafe(Long id);
    List<Cafe> listCafes();
    Cafe getCafe(Long id);
    Cafe uploadImage(Long id, MultipartFile file) throws IOException;
    Cafe uploadCovers(Long id, java.util.List<MultipartFile> files) throws IOException;
}

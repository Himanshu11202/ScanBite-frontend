package com.scanbite.backend.service;

import com.scanbite.backend.dto.ScannedMenuItem;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface MenuScannerService {
    List<ScannedMenuItem> scanMenu(MultipartFile file) throws IOException;
}

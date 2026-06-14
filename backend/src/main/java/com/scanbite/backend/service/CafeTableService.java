package com.scanbite.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface CafeTableService {
    // generate QR for table and return public URL to image
    String generateQrForTable(Long tableId) throws Exception;

    // return raw PNG bytes for download
    byte[] getQrImageForTable(Long tableId) throws Exception;
}

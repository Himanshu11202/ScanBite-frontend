package com.scanbite.backend.service.impl;

import com.scanbite.backend.exception.ResourceNotFoundException;
import com.scanbite.backend.model.CafeTable;
import com.scanbite.backend.repository.CafeTableRepository;
import com.scanbite.backend.service.CafeTableService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CafeTableServiceImpl implements CafeTableService {

    private final CafeTableRepository cafeTableRepository;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public CafeTableServiceImpl(CafeTableRepository cafeTableRepository) {
        this.cafeTableRepository = cafeTableRepository;
    }

    @Override
    public String generateQrForTable(Long tableId) throws Exception {
        CafeTable table = cafeTableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("CafeTable", "id", tableId));

        String code = UUID.randomUUID().toString();
        String targetUrl = frontendBaseUrl + "/?cafeId=" + table.getCafe().getId() + "&tableNumber=" + table.getTableNumber();

        // Generate QR matrix
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = new MultiFormatWriter().encode(targetUrl, BarcodeFormat.QR_CODE, 320, 320, hints);
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Create a custom printed QR card image
        BufferedImage finalImage = new BufferedImage(400, 480, BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g = finalImage.createGraphics();
        
        // Fill background with white
        g.setColor(java.awt.Color.WHITE);
        g.fillRect(0, 0, 400, 480);
        
        // Enable anti-aliasing for clean text rendering
        g.setRenderingHint(java.awt.RenderingHints.KEY_TEXT_ANTIALIASING, java.awt.RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);

        // Draw Cafe Name centered at the top
        g.setColor(java.awt.Color.BLACK);
        g.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 22));
        String cafeName = table.getCafe().getName().toUpperCase();
        java.awt.FontMetrics fm = g.getFontMetrics();
        int cafeNameWidth = fm.stringWidth(cafeName);
        g.drawString(cafeName, (400 - cafeNameWidth) / 2, 45);

        // Draw QR Code centered in the middle
        g.drawImage(qrImage, 40, 70, null);

        // Draw Table Number centered at the bottom
        g.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 20));
        fm = g.getFontMetrics();
        String tableLabel = "TABLE " + table.getTableNumber();
        int tableWidth = fm.stringWidth(tableLabel);
        g.drawString(tableLabel, (400 - tableWidth) / 2, 420);

        // Draw Subtext centered at the bottom
        g.setColor(java.awt.Color.GRAY);
        g.setFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 13));
        fm = g.getFontMetrics();
        String subtext = "Scan to View Menu & Order";
        int subtextWidth = fm.stringWidth(subtext);
        g.drawString(subtext, (400 - subtextWidth) / 2, 450);

        g.dispose();

        // Ensure uploads directory exists
        Path uploadsDir = Path.of("uploads", "qr");
        Files.createDirectories(uploadsDir);

        Path outFile = uploadsDir.resolve(code + ".png");
        ImageIO.write(finalImage, "PNG", outFile.toFile());

        table.setQrCode(code);
        table.setQrCodeUrl("/uploads/qr/" + code + ".png");
        cafeTableRepository.save(table);

        return table.getQrCodeUrl();
    }

    @Override
    public byte[] getQrImageForTable(Long tableId) throws Exception {
        CafeTable table = cafeTableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("CafeTable", "id", tableId));

        if (table.getQrCode() == null) throw new ResourceNotFoundException("QR code for table not found", "tableId", tableId);
        Path img = Path.of("uploads", "qr", table.getQrCode() + ".png");
        if (!Files.exists(img)) throw new ResourceNotFoundException("QR image file not found", "path", img.toString());
        return Files.readAllBytes(img);
    }
}

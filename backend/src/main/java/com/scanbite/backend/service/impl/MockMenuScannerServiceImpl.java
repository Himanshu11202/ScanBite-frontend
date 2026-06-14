package com.scanbite.backend.service.impl;

import com.scanbite.backend.dto.ScannedMenuItem;
import com.scanbite.backend.service.MenuScannerService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class MockMenuScannerServiceImpl implements MenuScannerService {

    @Override
    public List<ScannedMenuItem> scanMenu(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty file uploaded");
        }
        
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase().contains("fail")) {
            throw new IOException("AI Extraction Failed: Unable to read characters from the menu image due to low contrast.");
        }

        List<ScannedMenuItem> items = new ArrayList<>();

        ScannedMenuItem item1 = new ScannedMenuItem();
        item1.setName("Margherita Pizza");
        item1.setPrice(299.00);
        item1.setCategoryName("Pizza");
        item1.setVeg(true);
        item1.setDescription("Fresh mozzarella, tomatoes, and basil on classic hand-tossed crust");
        items.add(item1);

        ScannedMenuItem item2 = new ScannedMenuItem();
        item2.setName("Crispy Chicken Strips");
        item2.setPrice(180.00);
        item2.setCategoryName("Appetizers");
        item2.setVeg(false);
        item2.setDescription("Crumb fried chicken tenderloins served with house honey mustard");
        items.add(item2);

        ScannedMenuItem item3 = new ScannedMenuItem();
        item3.setName("Iced Latte");
        item3.setPrice(150.00);
        item3.setCategoryName("Beverages");
        item3.setVeg(true);
        item3.setDescription("Double shot of premium espresso with cold milk and ice");
        items.add(item3);

        ScannedMenuItem item4 = new ScannedMenuItem();
        item4.setName("Chocolate Fudge Cake");
        item4.setPrice(160.00);
        item4.setCategoryName("Desserts");
        item4.setVeg(true);
        item4.setDescription("Rich chocolate fudge sponge layered with hot chocolate fudge");
        items.add(item4);

        return items;
    }
}

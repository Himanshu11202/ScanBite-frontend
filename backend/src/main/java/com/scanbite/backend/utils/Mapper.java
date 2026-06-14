package com.scanbite.backend.utils;

import com.scanbite.backend.dto.MenuItemDto;
import com.scanbite.backend.model.MenuItem;

public class Mapper {
    public static MenuItemDto toDto(MenuItem e) {
        if (e == null) return null;
        MenuItemDto d = new MenuItemDto();
        d.id = e.getId(); d.name = e.getName(); d.description = e.getDescription(); d.price = e.getPrice();
        d.veg = e.isVeg(); d.spicy = e.getSpicy(); d.imageUrl = e.getImageUrl(); d.category = e.getCategory() == null ? null : e.getCategory().getName();
        return d;
    }

    public static MenuItem toEntity(MenuItemDto d) {
        if (d == null) return null;
        MenuItem e = new MenuItem(); e.setName(d.name); e.setDescription(d.description); e.setPrice(d.price);
        e.setVeg(d.veg); e.setSpicy(d.spicy); e.setImageUrl(d.imageUrl);
        e.setCategory(null); // category mapping should be handled by service layer (attach MenuCategory entity)
        return e;
    }
}

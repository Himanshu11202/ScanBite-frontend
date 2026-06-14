package com.scanbite.backend.service;

import com.scanbite.backend.model.MenuCategory;

import java.util.List;

public interface MenuCategoryService {
    MenuCategory create(MenuCategory category);
    MenuCategory update(Long id, MenuCategory patch);
    void delete(Long id);
    MenuCategory get(Long id);
    List<MenuCategory> listByCafe(Long cafeId);
}

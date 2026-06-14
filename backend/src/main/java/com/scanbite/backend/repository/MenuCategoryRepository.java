package com.scanbite.backend.repository;

import com.scanbite.backend.model.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    List<MenuCategory> findByCafe_IdOrderBySortOrder(Long cafeId);
}

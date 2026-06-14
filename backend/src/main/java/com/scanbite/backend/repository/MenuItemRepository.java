package com.scanbite.backend.repository;

import com.scanbite.backend.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategory_Name(String categoryName);
    List<MenuItem> findByCafe_Id(Long cafeId);
}

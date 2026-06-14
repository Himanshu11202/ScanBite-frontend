package com.scanbite.backend.service.impl;

import com.scanbite.backend.exception.ResourceNotFoundException;
import com.scanbite.backend.model.MenuCategory;
import com.scanbite.backend.repository.CafeRepository;
import com.scanbite.backend.repository.MenuCategoryRepository;
import com.scanbite.backend.service.MenuCategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MenuCategoryServiceImpl implements MenuCategoryService {
    private final MenuCategoryRepository repo;
    private final CafeRepository cafeRepo;

    public MenuCategoryServiceImpl(MenuCategoryRepository repo, CafeRepository cafeRepo) {
        this.repo = repo;
        this.cafeRepo = cafeRepo;
    }

    @Override
    public MenuCategory create(MenuCategory category) {
        if (category.getCafe() != null && category.getCafe().getId() != null) {
            category.setCafe(cafeRepo.findById(category.getCafe().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cafe","id", category.getCafe().getId())));
        }
        return repo.save(category);
    }

    @Override
    public MenuCategory update(Long id, MenuCategory patch) {
        MenuCategory existing = get(id);
        if (patch.getName() != null) existing.setName(patch.getName());
        existing.setDescription(patch.getDescription());
        if (patch.getSortOrder() != null) existing.setSortOrder(patch.getSortOrder());
        return repo.save(existing);
    }

    @Override
    public void delete(Long id) { repo.deleteById(id); }

    @Override
    public MenuCategory get(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("MenuCategory","id", id)); }

    @Override
    public List<MenuCategory> listByCafe(Long cafeId) { return repo.findByCafe_IdOrderBySortOrder(cafeId); }
}

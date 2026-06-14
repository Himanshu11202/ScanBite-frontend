package com.scanbite.backend.repository;

import com.scanbite.backend.model.Cafe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CafeRepository extends JpaRepository<Cafe, Long> {
}

package com.scanbite.backend.repository;

import com.scanbite.backend.model.CafeTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CafeTableRepository extends JpaRepository<CafeTable, Long> {
    List<CafeTable> findByCafe_Id(Long cafeId);
    Optional<CafeTable> findByQrCode(String qrCode);
}

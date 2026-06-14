package com.scanbite.backend.repository;

import com.scanbite.backend.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {
}

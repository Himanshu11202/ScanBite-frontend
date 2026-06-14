package com.scanbite.backend.repository;

import com.scanbite.backend.model.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByCafe_Id(Long cafeId);
    List<OrderEntity> findByCustomerName(String customerName);
    List<OrderEntity> findByCustomerPhone(String phone);
}


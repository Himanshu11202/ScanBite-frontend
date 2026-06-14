package com.scanbite.backend.service;

import com.scanbite.backend.model.OrderEntity;

import java.util.List;

public interface OrderService {
    List<OrderEntity> listAll();
    OrderEntity getById(Long id);
    OrderEntity create(OrderEntity order);
    OrderEntity updateStatus(Long id, String status);
    OrderEntity markPaid(Long id, boolean paid);
}

package com.scanbite.backend.service.impl;

import com.scanbite.backend.exception.ResourceNotFoundException;
import com.scanbite.backend.model.OrderEntity;
import com.scanbite.backend.model.OrderStatus;
import com.scanbite.backend.repository.OrderRepository;
import com.scanbite.backend.service.OrderService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    private final OrderRepository repo;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderServiceImpl(OrderRepository repo, SimpMessagingTemplate messagingTemplate) { this.repo = repo; this.messagingTemplate = messagingTemplate; }

    @Override
    public List<OrderEntity> listAll() { return repo.findAll(); }

    @Override
    public OrderEntity getById(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", "id", id)); }

    @Override
    public OrderEntity create(OrderEntity order) {
        order.setStatus(OrderStatus.PENDING);
        OrderEntity saved = repo.save(order);
        try { messagingTemplate.convertAndSend("/topic/orders", saved); } catch (Exception e) {}
        return saved;
    }

    @Override
    public OrderEntity updateStatus(Long id, String status) {
        OrderEntity o = getById(id);
        o.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        OrderEntity updated = repo.save(o);
        try { messagingTemplate.convertAndSend("/topic/orders", updated); } catch (Exception e) {}
        return updated;
    }

    @Override
    public OrderEntity markPaid(Long id, boolean paid) {
        OrderEntity o = getById(id);
        o.setPaid(paid);
        OrderEntity updated = repo.save(o);
        try { messagingTemplate.convertAndSend("/topic/orders", updated); } catch (Exception e) {}
        return updated;
    }
}

package com.scanbite.backend.controller;

import com.scanbite.backend.model.CafeTable;
import com.scanbite.backend.model.OrderEntity;
import com.scanbite.backend.model.OrderItem;
import com.scanbite.backend.model.OrderStatus;
import com.scanbite.backend.model.User;
import com.scanbite.backend.repository.CafeTableRepository;
import com.scanbite.backend.repository.MenuItemRepository;
import com.scanbite.backend.repository.OrderRepository;
import com.scanbite.backend.repository.UserRepository;
import com.scanbite.backend.service.OrderService;
import com.scanbite.dto.OrderItemDto;
import com.scanbite.dto.OrderRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final CafeTableRepository tableRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderController(OrderService orderService,
                           OrderRepository orderRepository,
                           MenuItemRepository menuItemRepository,
                           CafeTableRepository tableRepository,
                           UserRepository userRepository,
                           SimpMessagingTemplate messagingTemplate) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public List<OrderEntity> list(@RequestParam(required = false) Long cafeId,
                                  @RequestParam(required = false) String status) {
        List<OrderEntity> list = (cafeId != null) ? orderRepository.findByCafe_Id(cafeId) : orderService.listAll();
        if (status != null && !status.isBlank()) {
            List<OrderEntity> filtered = new ArrayList<>();
            for (OrderEntity o : list) if (o.getStatus() != null && status.equalsIgnoreCase(o.getStatus().name())) filtered.add(o);
            return filtered;
        }
        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderEntity> getOrder(@PathVariable Long id) {
        try {
            OrderEntity order = orderService.getById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/live")
    public List<OrderEntity> live(@RequestParam Long cafeId) {
        return orderRepository.findByCafe_Id(cafeId);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody OrderRequestDto request) {
        OrderEntity order = new OrderEntity();
        // attach table + cafe
        CafeTable table = tableRepository.findById(request.getTableId()).orElse(null);
        if (table != null) {
            order.setTable(table);
            if (table.getCafe() != null) order.setCafe(table.getCafe());
        }
        // attach customer name (if provided)
        if (request.getCustomerId() != null) {
            User u = userRepository.findById(request.getCustomerId()).orElse(null);
            if (u != null) {
                order.setCustomerName(u.getFullName());
                order.setCustomerPhone(u.getUsername());
            }
        }

        // map items
        List<OrderItem> items = new ArrayList<>();
        double subtotal = 0.0;
        if (request.getItems() != null) {
            for (OrderItemDto it : request.getItems()) {
                menuItemRepository.findById(it.getMenuItemId()).ifPresent(mi -> {
                    OrderItem oi = new OrderItem();
                    oi.setName(mi.getName()); oi.setQty(it.getQuantity()); oi.setPrice(mi.getPrice());
                    oi.setOrder(order);
                    items.add(oi);
                });
            }
            for (OrderItem oi : items) subtotal += oi.getPrice() * oi.getQty();
        }
        order.setItems(items);
        order.setSubtotal(subtotal);
        order.setTotal(subtotal);
        order.setPaid(false);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(OffsetDateTime.now());

        OrderEntity saved = orderService.create(order);
        try { messagingTemplate.convertAndSend("/topic/orders", saved); } catch (Exception e) {}
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        OrderEntity updated = orderService.updateStatus(id, req.status);
        try { messagingTemplate.convertAndSend("/topic/orders", updated); } catch (Exception e) {}
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/paid")
    public ResponseEntity<?> updatePaid(@PathVariable Long id, @RequestParam("paid") boolean paid) {
        OrderEntity updated = orderService.markPaid(id, paid);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/history")
    public List<OrderEntity> history(@RequestParam(required = false) Long customerId,
                                     @RequestParam(required = false) String phone) {
        if (customerId != null) {
            User u = userRepository.findById(customerId).orElse(null);
            if (u != null) return orderRepository.findByCustomerName(u.getFullName());
        }
        if (phone != null) return orderRepository.findByCustomerPhone(phone);
        return Collections.emptyList();
    }

    public static class StatusRequest { public String status; }
}

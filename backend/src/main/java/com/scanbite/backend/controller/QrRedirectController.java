package com.scanbite.backend.controller;

import com.scanbite.backend.model.CafeTable;
import com.scanbite.backend.repository.CafeTableRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Optional;

@Controller
@RequestMapping("/qr")
public class QrRedirectController {

    private final CafeTableRepository cafeTableRepository;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public QrRedirectController(CafeTableRepository cafeTableRepository) {
        this.cafeTableRepository = cafeTableRepository;
    }

    @GetMapping("/{code}")
    public RedirectView redirect(@PathVariable("code") String code) {
        Optional<CafeTable> tableOpt = cafeTableRepository.findByQrCode(code);
        if (tableOpt.isEmpty()) {
            RedirectView rv = new RedirectView(frontendBaseUrl);
            rv.setStatusCode(HttpStatus.FOUND);
            return rv;
        }
        CafeTable table = tableOpt.get();
        String url = frontendBaseUrl + "/?cafeId=" + table.getCafe().getId() + "&tableNumber=" + table.getTableNumber();
        RedirectView rv = new RedirectView(url);
        rv.setStatusCode(HttpStatus.FOUND);
        return rv;
    }
}

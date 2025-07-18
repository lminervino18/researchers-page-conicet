package com.researchers_conicet.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")  // Base URL for all endpoints in this controller
public class TestController {

    @GetMapping("/hello")  // This will respond to GET requests at /api/test/hello
    public String hello() {
        return "Hello from backend!";
    }
}
package com.example.Logistics.controller;


import com.example.Logistics.model.Customer;
import com.example.Logistics.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    //CREATE
    @PostMapping
   //@PreAuthorize("hasAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer){    //JsOn to automatic class object
        Customer savedCustomer= customerService.registerCustomer(customer);
        return ResponseEntity.ok(savedCustomer);
    }

    //read
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(){
        List<Customer> customers= customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Customer>> getAllCustomersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "05") int size
    ){
        Page<Customer> customersPage = customerService.getAllCustomersPaged(page, size);
        return ResponseEntity.ok(customersPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable long id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<Customer> getCustomerByPhone(@PathVariable String phone) {
        return customerService.getCustomerByPhone(phone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
   @PreAuthorize("hasAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Customer> updateCustomer(@PathVariable long id, @RequestBody Customer customerDetails) {
        Customer updatedCustomer = customerService.updateCustomer(id, customerDetails);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }

}

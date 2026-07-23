package com.example.Logistics.service;

import com.example.Logistics.model.Customer;
import com.example.Logistics.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;


@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    //create
    public Customer registerCustomer(Customer customer){
        if (customerRepository.existsByPhone(customer.getPhone())){
            throw new RuntimeException("Error: Customer already exists with this phone number");
        }
        customer.setCreatedAt(LocalDateTime.now());

        return  customerRepository.save(customer);
    }

    //read
    public List<Customer> getAllCustomers(){
        return customerRepository.findAll();
    }

    public Page<Customer> getAllCustomersPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return customerRepository.findAll(pageable);
    }

    public Optional<Customer> getCustomerById(Long id){
        return customerRepository.findById(id);
    }

    public Optional<Customer> getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }

    //update
    public Customer updateCustomer(Long id, Customer updateDetails){
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Customer not found with id: " + id));

        existingCustomer.setFullName(updateDetails.getFullName());
        existingCustomer.setEmail(updateDetails.getEmail());
        existingCustomer.setPhone(updateDetails.getPhone());
        existingCustomer.setAddress(updateDetails.getAddress());

        return customerRepository.save(existingCustomer);
    }

    //delete
    public void deleteCustomer(long id){
        if(!customerRepository.existsById(id)){
            throw new RuntimeException("Error: Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

}
package com.example.Logistics.repository;

import com.example.Logistics.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {    //table name , id type

    // Login and Authentication
    Optional<User> findByUsername(String username);              //Agar database mein ek aisa username dhoonden jo exist hi nahi karta (e.g., "unknown_user"), to Java mein NullPointerException ka error aa jata hai jo app ko crash kar sakta hai. Optional ek safe box ki tarah hai. Agar user mila, to box ke andar User ka object hoga. Agar nahi mila, to box khali (Optional.empty()) hoga, lekin app crash nahi hogi.

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    //findById -> built in
}
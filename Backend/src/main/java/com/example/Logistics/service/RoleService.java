package com.example.Logistics.service;

import com.example.Logistics.model.Role;
import com.example.Logistics.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    public Optional<Role> findByRoleName(String roleName){
        return roleRepository.findByRoleName(roleName);
    }

    public List<Role> getAllRoles(){
        return roleRepository.findAll();
    }

    //if admin wants to create role
    public Role saveRole(Role role){
        if(roleRepository.findByRoleName(role.getRoleName()).isPresent()){
            throw new RuntimeException("Role already exists");
        }
        return roleRepository.save(role);
    }

}

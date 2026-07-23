package com.example.Logistics.controller;

import com.example.Logistics.model.Role;
import com.example.Logistics.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController //api controller to return data in json
@RequestMapping("/api/roles")  //base URL
public class RoleController {

    @Autowired
    private RoleService roleService;

    // saving/creating data
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {   //function name- API name
        Role savedRole = roleService.saveRole(role);
        return ResponseEntity.ok(savedRole);
    }

    //read
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles(){
        List<Role> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Role> getRolesByName(@PathVariable String name) { //@pathvariables   name after url saved into the variable name
        return roleService.findByRoleName(name)
                .map(ResponseEntity::ok)                //if found
                .orElse(ResponseEntity.notFound().build());   //ready the response(built)
    }
}

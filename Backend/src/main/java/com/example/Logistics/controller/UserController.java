package com.example.Logistics.controller;

import com.example.Logistics.model.User;
import com.example.Logistics.security.JwtUtils;
import com.example.Logistics.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    //create
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user){
        User saveUser = userService.registerUser(user);
        return ResponseEntity.ok(saveUser);
    }

    //read
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/paged")                              //{{base_url}}/api/users/paged?page=0&size=5
    public ResponseEntity<Page<User>> getAllUsersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Page<User> usersPage = userService.getAllUsersPaged(page, size);
        return ResponseEntity.ok(usersPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable long id){
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //update-> put
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable long id, @RequestBody User userDetails){
        User existingUser = userService.getUserById(id).orElse(null);

        if (existingUser != null && "super_admin".equalsIgnoreCase(existingUser.getUsername())) {
            // Agar super_admin ka username change ya modify hone se rokna ho
            if (!existingUser.getUsername().equalsIgnoreCase(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Error: Super admin username cannot be changed!"));
            }
        }

        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    // Promote to Admin
    @PutMapping("/{id}/promote")
    public ResponseEntity<User> promoteToAdmin(@PathVariable Long id) {
        User updatedUser = userService.promoteToAdmin(id);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/promote-employee")
    public ResponseEntity<User> promoteToEmployee(@PathVariable Long id) {
        User updatedUser = userService.promoteToEmployee(id);
        return ResponseEntity.ok(updatedUser);
    }

    // Make Driver
    @PutMapping("/{id}/make-driver")
    public ResponseEntity<User> makeDriver(@PathVariable Long id) {
        User updatedUser = userService.makeDriver(id);
        return ResponseEntity.ok(updatedUser);
    }

    // Delete with Protected Guard
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable long id){
        User userToDelete = userService.getUserById(id).orElse(null);

        if (userToDelete != null) {
            // Restriction 1: super_admin username wale user ko deletion se block karein
            boolean isSuperAdmin = "super_admin".equalsIgnoreCase(userToDelete.getUsername());

            // Restriction 2: Check karein agar user ke pas ROLE_ADMIN / ADMIN ka role hai
            boolean isAdminRole = userToDelete.getRoles() != null && userToDelete.getRoles().stream()
                    .anyMatch(role -> role.getRoleName().equalsIgnoreCase("ROLE_ADMIN")
                            || role.getRoleName().equalsIgnoreCase("ADMIN"));

            if (isSuperAdmin || isAdminRole) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Error: Protected Admin accounts cannot be deleted!"));
            }
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    //Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> loginData){
        String username = loginData.get("username");
        String password = loginData.get("password");

        // verify credentials from userService
        User user = userService.loginUser(username, password);

        // if correct then gen token
        String token = jwtUtils.generateTokenFromUsername(user.getUsername());

        // Token aur data packing inside Object map
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful!");

        // Frontend ke liye required metadata payload
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("roles", user.getRoles()); // EAGER fetch ki wajah se automatic mil jayega

        return ResponseEntity.ok(response);
    }
}
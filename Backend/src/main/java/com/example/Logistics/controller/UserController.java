package com.example.Logistics.controller;

import com.example.Logistics.model.User;
import com.example.Logistics.security.JwtUtils;
import com.example.Logistics.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
    public ResponseEntity<User> updateUser(@PathVariable long id, @RequestBody User userDetails){     //@RequestBody=json data to class object
        User updatedUser= userService.updateUser(id, userDetails);
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

    //Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable long id){
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
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

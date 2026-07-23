package com.example.Logistics.service;

import com.example.Logistics.model.Driver;
import com.example.Logistics.model.Role;
import com.example.Logistics.model.User;
import com.example.Logistics.repository.DriverRepository;
import com.example.Logistics.repository.RoleRepository;
import com.example.Logistics.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.persistence.PersistenceContext;

@Service
public class UserService implements org.springframework.security.core.userdetails.UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DriverRepository driverRepository;

    //  create
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setIsActive(true);

        java.util.Set<Role> fullyLoadedRoles = new java.util.HashSet<>();
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findByRoleName("USER")
                    .orElseThrow(() -> new RuntimeException("Error: ROLE_USER not found!"));
            fullyLoadedRoles.add(defaultRole);
        } else {
            for (Role r : user.getRoles()) {
                Role roleFromDb = roleRepository.findById(r.getId())
                        .orElseThrow(() -> new RuntimeException("Error: Role ID " + r.getId() + " not found!"));
                fullyLoadedRoles.add(roleFromDb);
            }
        }
        user.setRoles(fullyLoadedRoles);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User saved = userRepository.save(user);


        userRepository.flush();

        return userRepository.findById(saved.getId())
                .orElse(saved);
    }

    //read
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    public Page<User> getAllUsersPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }

    public Optional<User> findByUsername(String username) {

        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserById(Long id) {

        return userRepository.findById(id);
    }

    //  Update
    public User updateUser(Long id, User updatedUserDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setFullName(updatedUserDetails.getFullName());
        existingUser.setEmail(updatedUserDetails.getEmail());
        // Agar active status ya baqi cheezain badalni hon
        existingUser.setIsActive(updatedUserDetails.getIsActive());
        return userRepository.save(existingUser);
    }

    //delete
    public void deleteUser(Long id){
        if(!userRepository.existsById(id)){
            throw new RuntimeException("Error: User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    //login
    public User loginUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        // BCrypt will use matches method and compare PT and CT
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Error: Invalid password!");
        }
        return user;
    }

    //spring security
   @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
            User user = userRepository.findByUsername(username)
           .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
       
           // user roles to spring format
       List<SimpleGrantedAuthority> authorities = user.getRoles().stream()   //spring security cannot understand simple strings needed gtantedauth
        .map(role -> new SimpleGrantedAuthority(role.getRoleName()))
        .collect(Collectors.toList());

        //user details
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }

    public User promoteToAdmin(long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Role Admin not found"));

        user.getRoles().clear();
        user.getRoles().add(adminRole);

        return userRepository.save(user);
    }

    public User makeDriver(long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role driverRole = roleRepository.findByRoleName("DRIVER")
                .orElseThrow(() -> new RuntimeException("Role Driver not found"));

        user.getRoles().clear();
        user.getRoles().add(driverRole);
        User updatedUser = userRepository.save(user);

        boolean alreadyDriver = driverRepository.existsByUserId(id);
        if (!alreadyDriver) {
            Driver driver = new Driver();
            driver.setUser(updatedUser);
            driver.setStatus("INCOMPLETE");

            driver.setFullName(updatedUser.getFullName());
            driver.setLicenseNumber("PENDING_" + id);
          driver.setPhone("PENDING_" + id);

            driverRepository.save(driver);
        }

        return updatedUser;
    }

    public User promoteToEmployee(long id) {
    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    Role employeeRole = roleRepository.findByRoleName("EMPLOYEE")
            .orElseThrow(() -> new RuntimeException("Role Employee not found"));
    user.getRoles().clear();
    user.getRoles().add(employeeRole);
    return userRepository.save(user);
}


}
package com.example.Logistics.security;

import io.jsonwebtoken.Jws;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import static io.jsonwebtoken.SignatureAlgorithm.HS256;

@Component
public class JwtUtils {

    private final String jwtSecret= "MutiXuanYourSuperSecretKeyForLogisticsApp2026SecureString";  //secret encryption key for digital signature on token

    //expire in 24hours
    private final int jwtExpirationMs = 86400000;

   //jwtsecret to cryptographic secret key object for hashing algo HMAC-SHA
    private Key getSigningKey(){
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    //create token if user and pass is correct
    public String generateTokenFromUsername(String username) {
        return Jwts.builder()                                                                                   //librarys's builder instance
                .setSubject(username) //ticket subject
                .setIssuedAt(new Date()) //ticket time
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) //current time + 24hrs
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();        //assemble and final (header + . + payload + . + signature) = token
    }

    public String getUsernameFromJwtToken(String token){
        return Jwts.parserBuilder()         //decode token and return username from payload
                .setSigningKey(getSigningKey())         // decode key for signature verification
                .build()
                .parseClaimsJws(token) //check token -> split token  -verify sign from secret key -check expiration time 
                .getBody()         //payload claims 
                .getSubject();          //subject field from payload claims = username
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);   //token verify
            return true;
        } catch (MalformedJwtException e) {
            System.out.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.out.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }




}

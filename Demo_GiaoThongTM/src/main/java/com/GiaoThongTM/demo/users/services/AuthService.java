package com.GiaoThongTM.demo.users.services;

import com.GiaoThongTM.demo.commons.constants.JwtProperties;
import com.GiaoThongTM.demo.users.dtos.request.SignIn;
import com.GiaoThongTM.demo.users.dtos.request.SignOut;
import com.GiaoThongTM.demo.users.dtos.request.SignUp;
import com.GiaoThongTM.demo.users.dtos.response.AuthResponse;
import com.GiaoThongTM.demo.users.entities.InvalidatedToken;
import com.GiaoThongTM.demo.users.entities.User;
import com.GiaoThongTM.demo.commons.enums.ErrorCode;
import com.GiaoThongTM.demo.commons.exceptions.AppException;
import com.GiaoThongTM.demo.users.repositories.InvalidatedTokenRepository;
import com.GiaoThongTM.demo.users.repositories.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final UserService userService;

    private final JwtProperties jwtProperties;

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public AuthResponse signIn(SignIn request) {
        User user = userService.findByUsernameOrThrow(request.getUsername());
        boolean isMatch = user.getPassword().equals(request.getPassword());
        if (!isMatch) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String accessToken = generateAccessToken(user);
//        String refreshToken = generateRefreshToken(user);
        AuthResponse result = AuthResponse.builder()
                .token(accessToken)
                .build();
        return result;
    }

    public void signUp(SignUp request) {
        if(userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        List<User> findAllUsers = userRepository.findAll();
        boolean isPasswordUsed = findAllUsers.stream()
                .anyMatch(user -> user.getPassword().equals(request.getPassword()));
        if (isPasswordUsed) {
            throw new AppException(ErrorCode.PASSWORD_WASUSED);
        }

        User user = userService.createUser(request);
//        String accessToken = generateAccessToken(user);
//        AuthResponse result = AuthResponse.builder()
//                .token(accessToken)
//                .build();
//        return result;
    }

    private String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.getAccessTokenExpirationTime());
        JWTClaimsSet claimSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer(jwtProperties.getIssuer())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(expiry))
                .claim("userId", user.getId())
                .claim("scope", buildScope(user))
                .build();
        JWSObject jwsObject = new JWSObject(new JWSHeader(JWSAlgorithm.HS512), new Payload(claimSet.toJSONObject()));
        try{
            jwsObject.sign(new MACSigner(jwtProperties.getSecret()));
            var accessToken = jwsObject.serialize();
            return accessToken;
        }catch(JOSEException e){
            throw new AppException(ErrorCode.TOKEN_SIGNING_FAILED);
        }
    }

    private String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.getRefreshTokenExpirationTime());
        JWTClaimsSet claimSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer(jwtProperties.getIssuer())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(expiry))
                .claim("type", "refresh")
                .build();
        JWSObject jwsObject = new JWSObject(new JWSHeader(JWSAlgorithm.HS512), new Payload(claimSet.toJSONObject()));
        try{
            jwsObject.sign(new MACSigner(jwtProperties.getSecret()));
            var refreshToken = jwsObject.serialize();
            return refreshToken;
        } catch (JOSEException e) {
            throw new AppException(ErrorCode.TOKEN_SIGNING_FAILED);
        }
    }

    public void signOut(SignOut token) throws ParseException, JOSEException {
        var signToken = verifyToken(token.getToken(), true);
        String jti = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jti)
                .expiryTime(expiryTime)
                .build();
        invalidatedTokenRepository.save(invalidatedToken);
    }

    private void validateRefreshToken(String token){
        try{
            JWSObject jwsObject = JWSObject.parse(token);
            jwsObject.verify(new MACVerifier(jwtProperties.getSecret()));
            JWTClaimsSet jwtClaimsSet = JWTClaimsSet.parse(jwsObject.getPayload().toJSONObject());
            Date expirationTime = jwtClaimsSet.getExpirationTime();
            if(expirationTime.before(new Date())){
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            String issuer = jwtClaimsSet.getIssuer();
            if(!issuer.equals(jwtProperties.getIssuer())){
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            String type = (String) jwtClaimsSet.getClaim("type");
            if(!"refresh".equals(type)){
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
        }catch(ParseException | JOSEException e){
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(jwtProperties.getSecret().getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiryTime = (isRefresh)
                ? new Date (signedJWT.getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(jwtProperties.getRefreshTokenExpirationTime(), ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);
        if(!(verified && expiryTime.after(new Date()))){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        return signedJWT;
    }

    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner("");
        if(!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                    stringJoiner.add(role.getName());
                    if(!CollectionUtils.isEmpty(role.getPermission())){
                        role.getPermission().forEach(permission -> stringJoiner.add(permission.getName()));
                    }
            });
        return stringJoiner.toString();
    }
}

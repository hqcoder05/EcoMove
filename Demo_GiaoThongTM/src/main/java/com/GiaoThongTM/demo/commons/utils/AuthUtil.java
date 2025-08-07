package com.GiaoThongTM.demo.commons.utils;

import com.GiaoThongTM.demo.commons.enums.ErrorCode;
import com.GiaoThongTM.demo.commons.exceptions.AppException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class AuthUtil {
    public static UUID getUserIdFromContext(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return UUID.fromString(jwt.getClaim("userId"));
    }
}

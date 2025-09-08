

package com.campusworks.bidding.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Feign Client Configuration
 * Handles authentication header propagation for inter-service communication
 */
@Configuration
@Slf4j
public class FeignClientConfig {

    /**
     * Request interceptor to propagate authentication headers
     * This ensures that when Bidding Service calls Task Service,
     * the user context is properly maintained
     */
    @Bean
    public RequestInterceptor authHeaderInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                try {
                    // Try to get request context from current thread
                    ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attributes != null) {
                        HttpServletRequest request = attributes.getRequest();
                        
                        // Propagate user context headers
                        String userId = request.getHeader("X-User-Id");
                        String userEmail = request.getHeader("X-User-Email");
                        String userRoles = request.getHeader("X-User-Roles");
                        
                        if (userId != null) {
                            template.header("X-User-Id", userId);
                            log.debug("🔐 Propagated X-User-Id: {} to Feign Client request", userId);
                        }
                        
                        if (userEmail != null) {
                            template.header("X-User-Email", userEmail);
                            log.debug("🔐 Propagated X-User-Email: {} to Feign Client request", userEmail);
                        }
                        
                        if (userRoles != null) {
                            template.header("X-User-Roles", userRoles);
                            log.debug("🔐 Propagated X-User-Roles: {} to Feign Client request", userRoles);
                        }
                        
                        log.info("🔐 Feign Client request headers propagated for user: {} ({})", userEmail, userId);
                    } else {
                        // If no request context, try to get from MDC or use a different approach
                        log.warn("⚠️ No request context available for Feign Client header propagation");
                        
                        // Alternative: Use MDC context if available
                        // String userId = MDC.get("userId");
                        // if (userId != null) {
                        //     template.header("X-User-Id", userId);
                        // }
                    }
                } catch (Exception e) {
                    log.error("❌ Error propagating headers to Feign Client request: {}", e.getMessage(), e);
                }
            }
        };
    }
}

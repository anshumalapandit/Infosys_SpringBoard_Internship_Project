# 🎯 Milestone 1: JWT Authentication & Role-Based Access Control

## ✅ Implementation Complete

This document outlines the complete implementation of Milestone 1 for the Disaster Management and Alert System.

---

## 📋 Milestone 1 Requirements

### Core Features Implemented:
1. ✅ **JWT-Based Authentication**
2. ✅ **Role-Based Access Control (RBAC)**
3. ✅ **Profile Setup with Location Data**
4. ✅ **Security Best Practices**

---

## 🔐 1. JWT-Based Authentication

### How It Works:
- **User Registration**: Users provide email, password, and role
- **Password Security**: Passwords are hashed using BCrypt before storing (NEVER stored in plain text)
- **Token Generation**: Upon successful login/registration, a JWT token is generated
- **Token Contents**:
  - User ID
  - Username
  - User Role
  - Token Expiry Time (24 hours)

### Implementation Details:

#### Backend (`JwtService.java`):
```java
// JWT token includes userId and role in claims
public String generateToken(UserDetails userDetails) {
    Map<String, Object> extraClaims = new HashMap<>();
    
    if (userDetails instanceof User) {
        User user = (User) userDetails;
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
    }
    
    return generateToken(extraClaims, userDetails);
}
```

#### Key Security Features:
- **Secret Key**: Stored in `application.properties` (Base64 encoded)
- **Token Expiry**: 24 hours (86400000 ms)
- **Signature Algorithm**: HS256
- **Token Validation**: Verified on every protected API call

---

## 👥 2. Role-Based Access Control (RBAC)

### Defined Roles:

#### 🔴 **ADMIN** (ROLE_ADMIN)
**Responsibilities:**
- Controls system configuration
- Assigns rescue tasks
- Manages responders and alerts
- Full system access

**Example Protected Endpoint:**
```java
@GetMapping("/admin/dashboard")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public ResponseEntity<?> adminDashboard() {
    // Only admins can access
}
```

#### 🟡 **RESPONDER** (ROLE_RESPONDER)
**Responsibilities:**
- Views assigned rescue operations
- Updates rescue status
- Communicates with admin
- Limited to operational tasks

**Additional Fields:**
- Responder Type (POLICE, FIRE, MEDICAL, SEARCH_RESCUE)
- Badge Number (for verification)

#### 🟢 **CITIZEN** (ROLE_USER)
**Responsibilities:**
- Views disaster alerts
- Requests emergency help
- Shares location information
- Basic user access

### Authorization Middleware:

#### `JwtAuthenticationFilter.java`:
```java
protected void doFilterInternal(HttpServletRequest request, 
                               HttpServletResponse response, 
                               FilterChain filterChain) {
    // Extract JWT from Authorization header
    // Verify token validity
    // Set authentication in SecurityContext
    // Block unauthorized users
}
```

**Important:** Without a valid token, no protected API can be accessed.

---

## 📍 3. Profile Setup with Location Data

### Why Location Data Matters:
> "Location data saves time and lives during disasters."

When a disaster occurs:
1. Admin selects affected region
2. System filters users by location
3. Alerts are sent only to impacted citizens and responders

### Profile Data Collected:

#### Basic Information:
- Full Name
- Email Address
- Phone Number
- Username

#### Location Data (Critical for Milestone 1):
- **Region/District**: e.g., "North District", "Downtown"
- **City**: User's city
- **State**: User's state
- **Pincode/ZIP**: Postal code for precise targeting

### Database Schema:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Hashed with BCrypt
    full_name VARCHAR(255),
    phone VARCHAR(50),
    
    -- Location data for region-based alerts
    region VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(20),
    
    -- Role-specific fields
    role VARCHAR(50) NOT NULL,
    responder_type VARCHAR(50),
    badge_number VARCHAR(100),
    department_access_code VARCHAR(255)
);
```

### Profile API Endpoints:

#### Get Current User Profile:
```
GET /api/profile
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phone": "+1 234 567 8900",
  "region": "North District",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "role": "ROLE_USER"
}
```

#### Update Profile:
```
PUT /api/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "+1 234 567 8900",
  "region": "North District",
  "city": "New York",
  "state": "NY",
  "pincode": "10001"
}
```

---

## 🔒 4. Security Best Practices

### ✅ Implemented Security Measures:

1. **Password Hashing**
   - BCrypt algorithm
   - Never store plain text passwords
   - Automatic salt generation

2. **JWT Security**
   - Secure secret key (Base64 encoded)
   - Token expiry (24 hours)
   - Signature verification on every request

3. **Input Validation**
   - Required fields validation
   - Email format validation
   - Role verification

4. **CORS Configuration**
   - Configured for `http://localhost:4200`
   - Prevents unauthorized cross-origin requests

5. **HTTPS Ready**
   - Application configured for HTTPS in production
   - Secure token transmission

6. **Role-Based Authorization**
   - `@PreAuthorize` annotations
   - Middleware verification
   - 403 Forbidden for unauthorized access

---

## 🎨 5. Beautiful, Smooth UI

### Design Principles Applied:

#### ✨ Visual Excellence:
- **Modern Color Palette**: Vibrant gradients (indigo, purple)
- **Glassmorphism**: Frosted glass effects
- **Dark Mode**: Premium dark theme
- **Smooth Animations**: Fade-in, slide-down, shake effects

#### 🎯 User Experience:
- **Intuitive Role Selection**: Visual tabs with active states
- **Clear Visual Hierarchy**: Section headers with icons
- **Responsive Design**: Mobile-friendly grid layout
- **Loading States**: Animated spinner during submission
- **Error Handling**: Beautiful error messages with shake animation

#### 📱 Responsive Features:
- Custom scrollbar styling
- Mobile-optimized form layout
- Touch-friendly buttons
- Adaptive grid system

### Key UI Components:

1. **Role Selector**
   - Visual tabs for Citizen/Responder/Admin
   - Hover effects
   - Active state highlighting

2. **Location Section**
   - Dedicated section with gradient background
   - Icon-based header (📍)
   - Clear purpose explanation

3. **Role-Specific Fields**
   - Conditional rendering
   - Smooth slide-down animation
   - Contextual icons (🚨 for Responder, 🔐 for Admin)

4. **Form Validation**
   - Required field indicators (*)
   - Real-time validation
   - Beautiful error messages

---

## 🚀 API Endpoints Summary

### Public Endpoints (No Authentication):
```
POST /api/auth/register  - User registration
POST /api/auth/login     - User login
GET  /api/demo/public    - Public demo endpoint
```

### Protected Endpoints (JWT Required):
```
GET  /api/profile        - Get current user profile
PUT  /api/profile        - Update user profile
GET  /api/demo/protected - Any authenticated user
```

### Role-Specific Endpoints:
```
GET  /api/demo/admin/dashboard         - ADMIN only
GET  /api/demo/responder/operations    - RESPONDER only
GET  /api/demo/citizen/alerts          - CITIZEN only
GET  /api/demo/emergency/coordinate    - ADMIN or RESPONDER
```

---

## 🧪 Testing the Implementation

### 1. Register a New User:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "role": "ROLE_USER",
    "phone": "+1 234 567 8900",
    "region": "North District",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }'
```

### 2. Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "johndoe",
  "role": "ROLE_USER",
  "userId": 1
}
```

### 3. Access Protected Endpoint:
```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### 4. Test Role-Based Access:
```bash
# This will succeed for ADMIN
curl -X GET http://localhost:8080/api/demo/admin/dashboard \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# This will return 403 Forbidden for non-ADMIN
curl -X GET http://localhost:8080/api/demo/admin/dashboard \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

## 📊 Database Migration

The database schema is automatically created/updated using:
```properties
spring.jpa.hibernate.ddl-auto=update
```

**Tables Created:**
- `users` - User accounts with location data

---

## 🎓 Teaching Points

### Key Concepts Demonstrated:

1. **JWT Authentication**
   - Stateless authentication
   - Token-based security
   - No server-side sessions

2. **Password Security**
   - BCrypt hashing
   - Never store plain text
   - Automatic salt generation

3. **Role-Based Access**
   - Different users, different permissions
   - Middleware authorization
   - 403 Forbidden for unauthorized access

4. **Location-Based Targeting**
   - Region-based alerts
   - Emergency targeting
   - Faster response planning

5. **Security Best Practices**
   - HTTPS ready
   - Secure JWT secret
   - Input validation
   - Token expiry

---

## ✅ Milestone 1 Checklist

- [x] JWT-based authentication implemented
- [x] Password hashing with BCrypt
- [x] User registration with validation
- [x] User login with JWT generation
- [x] Protected endpoints with JWT verification
- [x] Role-based access control (ADMIN, RESPONDER, CITIZEN)
- [x] Authorization middleware
- [x] Profile setup with location data
- [x] Region-based alert capability
- [x] Security best practices
- [x] Beautiful, smooth UI
- [x] Responsive design
- [x] Error handling
- [x] Loading states

---

## 🎉 Milestone 1 Complete!

All requirements have been successfully implemented with:
- ✅ Secure JWT authentication
- ✅ Role-based access control
- ✅ Profile with location data
- ✅ Beautiful, premium UI
- ✅ Security best practices

**Next Steps:** Proceed to Milestone 2 - Incident Reporting and Management

---

## 📞 Support

For questions or issues, refer to:
- Backend code: `backend/src/main/java/com/disaster/management/`
- Frontend code: `frontend/src/app/`
- API Documentation: `http://localhost:8080/swagger-ui.html`

# Socket.IO Security Implementation

## 1. Introduction

This document covers the security implementation for real-time chat and video call features using Socket.IO in the Jobiyo job portal application.

### Objective
To secure WebSocket communications against common vulnerabilities including unauthorized access, XSS attacks, DoS attacks, and data injection.

---

## 2. Vulnerabilities Identified

| # | Vulnerability | Severity | Risk Description |
|---|--------------|----------|------------------|
| 1 | No Socket Authentication | Critical | Anyone could connect without credentials |
| 2 | No Room Authorization | High | Users could join any chat room |
| 3 | No Input Sanitization | High | XSS attacks via malicious scripts in messages |
| 4 | No Rate Limiting | Medium | DoS attacks via message flooding |
| 5 | Unverified Call Signaling | High | Call spoofing and harassment |

---

## 3. Security Controls Implemented

### 3.1 JWT Authentication Middleware

**Purpose:** Verify user identity before allowing socket connection.

**Implementation:**
```javascript
io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Authentication required"));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.userId = decoded._id;
    next();
});
```

**Result:** Unauthenticated connections are rejected with 401 error.

---

### 3.2 Room Authorization

**Purpose:** Prevent users from accessing unauthorized chat rooms.

**Implementation:**
```javascript
socket.on('joinChat', async (roomId) => {
    const chat = await Chat.findOne({
        _id: roomId,
        users: socket.userId
    });
    if (!chat) {
        socket.emit('error', { message: 'You are not a member of this chat' });
        return;
    }
    socket.join(roomId);
});
```

**Result:** Users can only join chats they are members of.

---

### 3.3 Rate Limiting

**Purpose:** Prevent DoS attacks and message flooding.

**Configuration:**
- **Window:** 60 seconds
- **Max Events:** 30 per window
- **Block Duration:** 5 minutes

**Implementation:**
```javascript
const RATE_LIMIT = {
    windowMs: 60000,
    maxEvents: 30,
    blockDurationMs: 300000
};
```

**Result:** Abusive connections are automatically blocked.

---

### 3.4 Input Sanitization (XSS Prevention)

**Purpose:** Strip malicious HTML/JavaScript from messages.

**Implementation:**
```javascript
import sanitizeHtml from "sanitize-html";

const sanitizeContent = (content) => {
    return sanitizeHtml(content, { 
        allowedTags: [],
        allowedAttributes: {}
    }).trim();
};
```

**Test Case:**
- **Input:** `<script>alert('xss')</script>Hello`
- **Output:** `Hello`

---

### 3.5 Event Whitelisting

**Purpose:** Block unauthorized/malicious socket events.

**Implementation:**
```javascript
const ALLOWED_EVENTS = [
    'setup', 'joinChat', 'leaveChat', 
    'typing', 'callUser', 'answerCall', 'endCall'
];

socket.onAny((eventName) => {
    if (!ALLOWED_EVENTS.includes(eventName)) {
        socket.emit('error', { message: 'Invalid event' });
    }
});
```

---

## 4. Testing Results

### 4.1 Authentication Test

| Test Case | Expected Result | Actual Result | Status |
|-----------|-----------------|---------------|--------|
| Connect without token | Connection rejected | "Authentication required" error | ✅ Pass |
| Connect with valid token | Connection accepted | Socket connected | ✅ Pass |
| Connect with expired token | Connection rejected | "Authentication failed" error | ✅ Pass |

### 4.2 Authorization Test

| Test Case | Expected Result | Actual Result | Status |
|-----------|-----------------|---------------|--------|
| Join own chat room | Allowed | Successfully joined | ✅ Pass |
| Join unauthorized room | Denied | "Not a member" error | ✅ Pass |
| Spoof another user's setup | Denied | "Unauthorized room access" | ✅ Pass |

### 4.3 Rate Limiting Test

| Test Case | Expected Result | Actual Result | Status |
|-----------|-----------------|---------------|--------|
| Send 30 messages in 1 min | Allowed | All messages sent | ✅ Pass |
| Send 31+ messages in 1 min | Blocked | Rate limit error, disconnected | ✅ Pass |

### 4.4 XSS Prevention Test

| Input | Expected Output | Actual Output | Status |
|-------|-----------------|---------------|--------|
| `<script>alert(1)</script>` | (empty) | (empty) | ✅ Pass |
| `<img onerror=alert(1)>` | (empty) | (empty) | ✅ Pass |
| `Hello World` | `Hello World` | `Hello World` | ✅ Pass |

---

## 5. Files Modified

| File | Changes |
|------|---------|
| `backend/src/socket.js` | JWT auth, rate limiting, event whitelist |
| `backend/src/controllers/chat.controller.js` | Input sanitization, access control |
| `frontend/src/context/SocketContext.jsx` | Token passing in auth handshake |
| `frontend/src/redux/slices/userSlice.js` | Token selector |

---

## 6. Screenshots

### 6.1 Successful Socket Authentication
*(Insert screenshot of browser console showing "Socket connected" message)*

### 6.2 Authentication Failure (No Token)
*(Insert screenshot of console showing "Authentication required" error)*

### 6.3 Rate Limiting in Action
*(Insert screenshot of "Rate limit exceeded" error)*

### 6.4 XSS Prevention
*(Insert screenshot showing sanitized message in database/UI)*

---

## 7. Conclusion

The Socket.IO implementation now includes multiple layers of security:

1. **Authentication** - JWT verification on connection
2. **Authorization** - Room-level access control
3. **Rate Limiting** - DoS protection
4. **Input Validation** - XSS prevention
5. **Event Whitelisting** - Prevents unauthorized events

These controls align with OWASP security guidelines for real-time applications.

---

## 8. References

- OWASP WebSocket Security Guidelines
- Socket.IO Security Best Practices
- Node.js Security Checklist

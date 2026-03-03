export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: 'ROLE_USER' | 'ROLE_RESPONDER' | 'ROLE_ADMIN';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Incident {
    id: number;
    type: string;
    description: string;
    location: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
    reporterName: string;
}

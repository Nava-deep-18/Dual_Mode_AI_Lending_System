import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

// Initialize axios token synchronously for initial page loads to prevent race conditions
const initialToken = localStorage.getItem('access_token');
if (initialToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(initialToken || null);

    const login = (newToken) => {
        localStorage.setItem('access_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

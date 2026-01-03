import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';
import userReducer from '@/redux/slices/userSlice';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

const LoginPage = () => <div>Login Page</div>;
const HomePage = () => <div>Home Page</div>;
const RecruiterDashboard = () => <div>Recruiter Dashboard</div>;

const createMockStore = (user) => {
  return configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: { user: user, token: user ? 'token' : null } },
  });
};

describe('ProtectedRoute', () => {
    it('should redirect to the login page if user is not authenticated', () => {
        const store = createMockStore(null);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/recruiter']}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/recruiter" element={
                            <ProtectedRoute allowedRoles={['recruiter']}>
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should render the child component if user is authenticated and has the correct role', () => {
        const user = { role: 'recruiter' };
        const store = createMockStore(user);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/recruiter']}>
                    <Routes>
                        <Route path="/recruiter" element={
                            <ProtectedRoute allowedRoles={['recruiter']}>
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Recruiter Dashboard')).toBeInTheDocument();
    });

    it('should redirect to the home page if user does not have an allowed role', () => {
        const user = { role: 'student' };
        const store = createMockStore(user);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/recruiter']}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/recruiter" element={
                            <ProtectedRoute allowedRoles={['recruiter']}>
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should allow access if the user has one of multiple allowed roles', () => {
        const user = { role: 'admin' };
        const store = createMockStore(user);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/admin-or-recruiter']}>
                    <Routes>
                        <Route path="/admin-or-recruiter" element={
                            <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                                <div>Admin or Recruiter Area</div>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Admin or Recruiter Area')).toBeInTheDocument();
    });
    
    it('should render children if allowedRoles is not provided and the user is logged in', () => {
        const user = { role: 'any-role' };
        const store = createMockStore(user);
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/anybody']}>
                    <Routes>
                        <Route path="/anybody" element={
                            <ProtectedRoute>
                                <div>Welcome Anybody</div>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Welcome Anybody')).toBeInTheDocument();
    });
});
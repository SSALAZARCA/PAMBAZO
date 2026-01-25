import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerDashboard } from '../pages/customer/CustomerDashboardHome';
import { CustomerLoyaltyPage } from '../pages/customer/CustomerLoyaltyPage';

interface CustomerRoutesProps {
    user: any;
    onLogout: () => void;
}

export const CustomerRoutes: React.FC<CustomerRoutesProps> = ({ user, onLogout }) => {
    return (
        <Routes>
            <Route index element={<CustomerDashboard user={user} onLogout={onLogout} />} />
            <Route path="loyalty" element={<CustomerLoyaltyPage user={user} onLogout={onLogout} />} />
            <Route path="*" element={<Navigate to="/customer" replace />} />
        </Routes>
    );
};

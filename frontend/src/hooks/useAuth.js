// frontend\src\hooks\useAuth.js

import { useGetMeQuery } from '../services/api';

export const useAuth = () => {
    const { data: me, isLoading, isError } = useGetMeQuery();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    return {
        me,
        userId,
        isAuthenticated: !!token,
        isLoading,
        isError
    };
};
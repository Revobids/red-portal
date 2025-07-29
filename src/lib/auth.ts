export const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

export const isAuthenticated = (): boolean => {
    const token = getCookieValue('access_token');
    return !!token;
};

export const logoutUser = () => {
    if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
    }
};
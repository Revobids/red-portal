import { getCookieValue, logoutUser } from '@/lib/auth';

const getHeaders = () => {
    const access_token = getCookieValue('access_token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
    };
};

const getFileHeaders = () => {
    const access_token = getCookieValue('access_token');
    return { Authorization: `Bearer ${access_token}` };
};

const responseMiddleware = <T = unknown>(response: T): T => {
    console.log("middleware response:", response);
    // Only logout if we get a 401 statusCode in the response body
    if ((response as Record<string, unknown>).statusCode === 401) {
        logoutUser();
    }
    return response;
};

class ApiMethods {
    static apiRequest<T = unknown>(method: string, url: string, body: Record<string, unknown> = {}): Promise<T> {
        const header = method === "GET" ? 
            { method, headers: getHeaders() } : 
            { method, body: JSON.stringify(body), headers: getHeaders() };
        
        return new Promise<T>((resolve, reject) => {
            fetch(url, header)
                .then((res) => res.json())
                .then((res) => responseMiddleware(res))
                .then(resolve)
                .catch(reject);
        });
    }

    static apiFileRequest<T = unknown>(method: string, url: string, file: File): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);
        return new Promise<T>((resolve, reject) => {
            fetch(url, { method, body: formData, headers: getFileHeaders() })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    static apiFormDataRequest<T = unknown>(method: string, url: string, formData: FormData): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            fetch(url, { method, body: formData, headers: getFileHeaders() })
                .then((res) => res.json())
                .then((res) => responseMiddleware(res))
                .then(resolve)
                .catch(reject);
        });
    }

    static get<T = unknown>(url: string): Promise<T> {
        return this.apiRequest<T>("GET", url);
    }

    static post<T = unknown>(url: string, data: Record<string, unknown>): Promise<T> {
        return this.apiRequest<T>("POST", url, data);
    }

    static filePost<T = unknown>(url: string, file: File): Promise<T> {
        return this.apiFileRequest<T>("POST", url, file);
    }

    static put<T = unknown>(url: string, data: Record<string, unknown>): Promise<T> {
        return this.apiRequest<T>("PUT", url, data);
    }

    static patch<T = unknown>(url: string, data: Record<string, unknown>): Promise<T> {
        return this.apiRequest<T>("PATCH", url, data);
    }

    static postFormData<T = unknown>(url: string, formData: FormData): Promise<T> {
        return this.apiFormDataRequest<T>("POST", url, formData);
    }

    static delete<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> {
        return data ? this.apiRequest<T>("DELETE", url, data) : this.apiRequest<T>("DELETE", url);
    }
}

export default ApiMethods;
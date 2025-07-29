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

const responseMiddleware = (response: any) => {
    console.log("middleware response:", response);
    // Only logout if we get a 401 statusCode in the response body
    if (response.statusCode === 401) {
        logoutUser();
    }
    return response;
};

class ApiMethods {
    static apiRequest(method: string, url: string, body = {}) {
        const header = method === "GET" ? 
            { method, headers: getHeaders() } : 
            { method, body: JSON.stringify(body), headers: getHeaders() };
        
        return new Promise((resolve, reject) => {
            fetch(url, header)
                .then((res) => res.json())
                .then((res) => responseMiddleware(res))
                .then(resolve)
                .catch(reject);
        });
    }

    static apiFileRequest(method: string, url: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return new Promise((resolve, reject) => {
            fetch(url, { method, body: formData, headers: getFileHeaders() })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject);
        });
    }

    static get(url: string) {
        return this.apiRequest("GET", url);
    }

    static post(url: string, data: any) {
        return this.apiRequest("POST", url, data);
    }

    static filePost(url: string, file: File) {
        return this.apiFileRequest("POST", url, file);
    }

    static put(url: string, data: any) {
        return this.apiRequest("PUT", url, data);
    }

    static patch(url: string, data: any) {
        return this.apiRequest("PATCH", url, data);
    }

    static delete(url: string) {
        return this.apiRequest("DELETE", url);
    }
}

export default ApiMethods;
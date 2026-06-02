export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health/ai`);
        const data = await response.json();

        return {
            ok: response.ok && data?.status === 'ok',
            data
        };
    } catch (err) {
        return {
            ok: false,
            data: null
        };
    }
}

export async function readErrorMessage(response, fallbackMessage) {
    const contentType = response.headers.get('content-type') || '';

    try {
        if (contentType.includes('application/json')) {
            const data = await response.json();
            return data?.msg || data?.error || fallbackMessage;
        }

        const text = await response.text();
        return text?.trim() || fallbackMessage;
    } catch (err) {
        return fallbackMessage;
    }
}

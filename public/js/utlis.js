export const API_BASE_URL = "http://localhost:3001/api";


export const tryCatch = async (fn, onError = console.error) => {
    try {
        return await fn();
    } catch (error) {
        onError(error);
    }
};

export const bindEvent = (selector, event, handler) => {
    document.querySelector(selector)?.addEventListener(event, handler);
};

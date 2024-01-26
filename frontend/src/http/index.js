import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": 'application/json',
        Accept: 'application/json',
    }
});

// List of all the endpoints
export const sendOtp = (data) => {

    return api.post('/api/v1/send-otp', data);
}
export const verifyOtp = (data) => {
    return api.post('/api/v1/verify-otp', data);
}
export const activate = (data) => {
    return api.post('/api/v1/activate', data);
}
export const logout = (data) => {
    return api.post('/api/v1/logout', data);
}
export const createRoom = (data) => {
    return api.post('api/v1/rooms', data)
}
export const getAllRooms = () => {
    return api.get('api/v1/rooms');
}
export const getRoom = (roomId) => {
    return api.get(`api/v1/rooms/${roomId}`);
}
// interceptors
/*
Axios interceptors allow us to run our code or modify the request or response before the request is sent or after the response is received. This can be useful for handling global tasks like authentication, logging, error handling, etc., without repeating the same logic in every HTTP request.
*/

api.interceptors.response.use(
    (config) => {
        return config
    },
    async (error) => {
        console.log("Error happend bhai", `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/refresh`);
        const originalRequest = error.config;
        console.log(error);
        if (error.response.status === 401 &&
            originalRequest &&
            !originalRequest._isRetry) {
            originalRequest._isRetry = true;
            try {
                // eslint-disable-next-line no-unused-vars
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/refresh`,
                    {
                        withCredentials: true
                    });
                return api.request(originalRequest);
            } catch (error) {
                console.log("Inteceptor Error", error);
            }
        }
        throw error;

    })


export default api;
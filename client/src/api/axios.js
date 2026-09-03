import axios from 'axios'

const api = axios.create({
    baseURL: '/api', // Works locally (via Vite proxy) AND in production (via Render)
    withCredentials: true, // Ensures your HTTP-only JWT cookies are sent with every request
    headers: {
        'Content-Type': 'application/json',
    },
})

// Global Response Interceptor
api.interceptors.response.use(
    (response) => {
        // Any status code within the 2xx range triggers this function.
        // Simply pass the successful response down to the component.
        return response
    },
    (error) => {
        // Any status code outside the 2xx range triggers this function.
        if (error.response && error.response.status === 401) {
            // 1. Clear the user's data from the browser
            localStorage.removeItem('userInfo')

            // 2. Force a redirect to the login screen.
            // We use window.location because this file is pure JavaScript,
            // so we cannot use React Router's useNavigate() hook here.
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        // Pass the error down so the component can still show specific error messages if needed
        return Promise.reject(error)
    },
)

export default api

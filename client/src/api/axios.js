import axios from 'axios'
const api = axios.create({
    baseURL: '/api', // Works locally (via Vite proxy) AND in production (via Render)
    withCredentials: true, // Ensures your HTTP-only JWT cookies are sent with every request
    headers: {
        'Content-Type': 'application/json',
    },
})
export default api

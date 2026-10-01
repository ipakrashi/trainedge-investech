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
		return response
	},
	(error) => {
		// Bypass forced redirect for public feedback endpoints (Leads & Classes)
        const requestUrl = error.config?.url || ''
        const isPublicFeedbackRoute = requestUrl.includes('/demos/feedback/') || requestUrl.includes('/sessions/feedback/')

        if (error.response && error.response.status === 401 && !isPublicFeedbackRoute) {
            localStorage.removeItem('userInfo')

            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
	},
)

export default api

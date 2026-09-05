import dotenv from 'dotenv/config'
import express from 'express'
import dns from 'dns'
import connectDB from './dbConnection/dbConnect.js'
import userRoutes from './routes/userRoutes.js'
import leadRoutes from './routes/leadRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import leadActivityRoutes from './routes/leadActivityRoutes.js'
import roleRoutes from './routes/roleRoutes.js'
import sourceRoutes from './routes/sourceRoutes.js'
import statusRoutes from './routes/statusRoutes.js'
import experienceRoutes from './routes/experienceRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import paymentModeRoutes from './routes/paymentModeRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import batchRoutes from './routes/batchRoutes.js'
import evaluationRoutes from './routes/evaluationRoutes.js'
import sessionLogRoutes from './routes/sessionLogRoutes.js'

import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = express()
const PORT = process.env.PORT || 3000

//Connection to Database
connectDB()

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/users', userRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lead-activities', leadActivityRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/sources', sourceRoutes)
app.use('/api/statuses', statusRoutes)
app.use('/api/experiences', experienceRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/payment-modes', paymentModeRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/evaluations', evaluationRoutes)
app.use('/api/sessions', sessionLogRoutes)

// ---- PRODUCTION ROUTING BLOCK ----
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist')
    app.use(express.static(clientBuildPath))

    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'))
    })
} else {
    app.get('/', (req, res) => {
        res.send('API is running...')
    })
}
// ----------------------------------

// Custom Error Handlers
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
})

// Server Start
app.listen(PORT, () => {
    console.log(`Server Started On Port : ${PORT}`)
})

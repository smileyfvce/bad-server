import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
// import { checkQuery } from './middlewares/checkQuery'
import rateLimit from 'express-rate-limit'

const { PORT = 3000 } = process.env
const app = express()
const limiter = rateLimit({
    // Указываем интервал времени 15 минут
    windowMs: 15 * 60 * 1000,
    // Ограничиваем количество запросов в этом интервале
    limit: 100,
    // Включаем заголовки нового типа `RateLimit-*`
    standardHeaders: true,
    // Отключаем заголовки старого типа `X-RateLimit-*`
    legacyHeaders: false,
})

// Регистрируем созданную middleware в express
app.use(limiter)

app.use(cookieParser())
app.use(cors({ origin: process.env.ORIGIN_ALLOW, credentials: true }))
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use((_req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; object-src 'none';"
    )
    next()
})

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.options('*', cors())
app.use(routes)
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()

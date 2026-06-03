import crypto from 'crypto'
import { Request, Response } from 'express'

// Генерация CSRF-токена
export function generateCsrfToken(): string {
    const nonce = crypto.randomBytes(32).toString('base64url')
    const signature = crypto
        .createHmac('sha256', process.env.CSRF_SECRET || 'fallback-secret-2024')
        .update(nonce)
        .digest('base64url')
    return `${nonce}.${signature}`
}

// Эндпоинт для получения CSRF-токена
export function sendCsrfToken(_req: Request, res: Response) {
    const token = generateCsrfToken()
    
    // Сохраняем токен в cookie (httpOnly для безопасности)
    res.cookie('_csrf', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
    })
    
    // Отдаём токен в ответе
    res.json({ csrfToken: token })
}

import BadRequestError from "../errors/bad-request-error"
import { Request, Response, NextFunction } from "express"

// Запрещённые символы для MongoDB
const badSymbols = ['$', '.', "'", '"', '\\', '{', '}']

export function checkQuery(req: Request, _res: Response, next: NextFunction) {
        const isSafe = (val: unknown): boolean => {
        if (typeof val === 'string') {
            for (const sym of badSymbols) {
                if (val.includes(sym)) return false
            }
        }
        if (typeof val === 'object' && val !== null) {
            for (const key of Object.keys(val)) {
                if (badSymbols.some(s => key.includes(s))) return false
                if (!isSafe((val as any)[key])) return false
            }
        }
        return true
    }
    
    if (!isSafe(req.query)) {
        return next(new BadRequestError('Недопустимые символы в запросе'))
    }
    
    next()
}
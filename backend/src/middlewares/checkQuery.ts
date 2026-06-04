import BadRequestError from "../errors/bad-request-error"
import { Request, Response, NextFunction } from "express"

// Запрещённые символы для MongoDB (игнорируем +)
const forbiddenPattern = /[\$\.\'\"]/  // только опасные

export function checkQuery(req: Request, _res: Response, next: NextFunction) {
    const isSafe = (val: unknown): boolean => {
        if (typeof val === 'string') {
            return !forbiddenPattern.test(val)
        }
        if (typeof val === 'object' && val !== null) {
            for (const key of Object.keys(val)) {
                if (forbiddenPattern.test(key)) return false
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
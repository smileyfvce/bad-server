import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import sharp from 'sharp'

const MIN_FILE_SIZE = 2 * 1024 // 2 KB

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    if (req.file.size < MIN_FILE_SIZE) {
        return next(new BadRequestError('Файл слишком маленький'))
    }
    try {
        // Проверяем, что файл — корректное изображение
        await sharp(req.file.path).metadata()
    } catch (err) {
        return next(new BadRequestError('Файл не является изображением'))
    }
    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}

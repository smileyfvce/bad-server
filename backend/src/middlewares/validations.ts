import BadRequestError from '../errors/bad-request-error'
import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { Types } from 'mongoose'

// eslint-disable-next-line no-useless-escape
export const phoneRegExp = /^(\+\d+)?(?:\s|-?|\(?\d+\)?)+$/

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

// Middleware для валидации тела запроса
const validateBody = (schema: Joi.ObjectSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false })
        
        if (error) {
            const messages = error.details.map(detail => detail.message).join(', ')
            return next(new BadRequestError(messages))
        }
        
        req.body = value
        next()
    }
}

// Middleware для валидации параметров маршрута
const validateParams = (schema: Joi.ObjectSchema) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.params, { abortEarly: false })
        
        if (error) {
            const messages = error.details.map(detail => detail.message).join(', ')
            return next(new BadRequestError(messages))
        }
        
        req.params = value
        next()
    }
}

// Кастомная валидация ObjectId
const objectIdValidator = (value: string, helpers: Joi.CustomHelpers) => {
    if (Types.ObjectId.isValid(value)) {
        return value
    }
    return helpers.error('any.invalid')
}

// валидация id
export const validateOrderBody = validateBody(
    Joi.object({
        items: Joi.array()
            .items(
                Joi.string().custom((value, helpers) => {
                    if (Types.ObjectId.isValid(value as string)) {
                        return value
                    }
                    return helpers.error('any.invalid')
                })
            )
            .min(1)
            .max(50)
            .required()
            .messages({
                'array.empty': 'Не указаны товары',
                'array.max': 'Слишком много товаров',
            }),
        payment: Joi.string()
            .valid(...Object.values(PaymentType))
            .required()
            .messages({
                'string.valid': 'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
                'string.empty': 'Не указан способ оплаты',
            }),
        email: Joi.string().email().max(254).required().messages({
            'string.empty': 'Не указан email',
        }),
        phone: Joi.string().max(30).required().pattern(phoneRegExp).messages({
            'string.empty': 'Не указан телефон',
        }),
        address: Joi.string().max(300).required().messages({
            'string.empty': 'Не указан адрес',
        }),
        total: Joi.number().positive().required().messages({
            'number.base': 'Не указана сумма заказа',
        }),
        comment: Joi.string().max(1000).optional().allow(''),
    })
)

// валидация товара.
// name и link - обязательные поля, name - от 2 до 30 символов, link - валидный url
export const validateProductBody = validateBody(
    Joi.object({
        title: Joi.string().required().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "title" - 2',
            'string.max': 'Максимальная длина поля "title" - 30',
            'string.empty': 'Поле "title" должно быть заполнено',
        }),
        image: Joi.object({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }).required(),
        category: Joi.string().max(50).required().messages({
            'string.empty': 'Поле "category" должно быть заполнено',
        }),
        description: Joi.string().max(2000).required().messages({
            'string.empty': 'Поле "description" должно быть заполнено',
        }),
        price: Joi.number().allow(null),
    })
)

export const validateProductUpdateBody = validateBody(
    Joi.object({
        title: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "title" - 2',
            'string.max': 'Максимальная длина поля "title" - 30',
        }),
        image: Joi.object({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }),
        category: Joi.string().max(50),
        description: Joi.string().max(2000),
        price: Joi.number().allow(null),
    })
)

export const validateObjId = validateParams(
    Joi.object({
        productId: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (Types.ObjectId.isValid(value as string)) {
                    return value
                }
                return helpers.error('any.invalid')
            }),
    })
)

export const validateUserBody = validateBody(
    Joi.object({
        name: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        password: Joi.string().min(6).max(128).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
        email: Joi.string()
            .required()
            .email()
            .max(254)
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.empty': 'Поле "email" должно быть заполнено',
            }),
    })
)

export const validateAuthentication = validateBody(
    Joi.object({
        email: Joi.string()
            .required()
            .email()
            .max(254)
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.required': 'Поле "email" должно быть заполнено',
            }),
        password: Joi.string().max(128).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
    })
)

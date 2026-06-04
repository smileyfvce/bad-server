import { NextFunction, Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import NotFoundError from '../errors/not-found-error'
import Order from '../models/order'
import User, { IUser } from '../models/user'
//import { normalizeLimit } from '../utils/normalizeLimit'
import escapeRegExp from '../utils/escapeRegExp'
import getPagination from '../utils/getPagination'
import validateQuery from '../utils/validateQuery'

const allowedCustomerSortFields = [
    'createdAt',
    'lastOrderDate',
    'totalAmount',
    'orderCount',
];

export const getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        validateQuery(req.query, [
            'page',
            'limit',
            'sortField',
            'sortOrder',
            'registrationDateFrom',
            'registrationDateTo',
            'lastOrderDateFrom',
            'lastOrderDateTo',
            'totalAmountFrom',
            'totalAmountTo',
            'orderCountFrom',
            'orderCountTo',
            'search',
        ]);

        const {
            page = 1,
            limit = 10,
            sortField = 'createdAt',
            sortOrder = 'desc',
            registrationDateFrom,
            registrationDateTo,
            lastOrderDateFrom,
            lastOrderDateTo,
            totalAmountFrom,
            totalAmountTo,
            orderCountFrom,
            orderCountTo,
            search,
        } = req.query;
        const pagination = getPagination(page, limit, 10);

        const filters: FilterQuery<Partial<IUser>> = {};

        if (registrationDateFrom) {
            filters.createdAt = {
                ...filters.createdAt,
                $gte: new Date(registrationDateFrom as string),
            };
        }

        if (registrationDateTo) {
            const endOfDay = new Date(registrationDateTo as string);
            endOfDay.setHours(23, 59, 59, 999);
            filters.createdAt = {
                ...filters.createdAt,
                $lte: endOfDay,
            };
        }

        if (lastOrderDateFrom) {
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $gte: new Date(lastOrderDateFrom as string),
            };
        }

        if (lastOrderDateTo) {
            const endOfDay = new Date(lastOrderDateTo as string);
            endOfDay.setHours(23, 59, 59, 999);
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $lte: endOfDay,
            };
        }

        if (totalAmountFrom) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $gte: Number(totalAmountFrom),
            };
        }

        if (totalAmountTo) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $lte: Number(totalAmountTo),
            };
        }

        if (orderCountFrom) {
            filters.orderCount = {
                ...filters.orderCount,
                $gte: Number(orderCountFrom),
            };
        }

        if (orderCountTo) {
            filters.orderCount = {
                ...filters.orderCount,
                $lte: Number(orderCountTo),
            };
        }

        if (typeof search === 'string' && search) {
            const searchRegex = new RegExp(escapeRegExp(search), 'i');
            const orders = await Order.find(
                { deliveryAddress: searchRegex },
                '_id'
            );
            const orderIds = orders.map((order) => order._id);
            filters.$or = [
                { name: searchRegex },
                { lastOrder: { $in: orderIds } },
            ];
        }

        const sort: { [key: string]: any } = {};
        const safeSortField =
            typeof sortField === 'string' &&
            allowedCustomerSortFields.includes(sortField)
                ? sortField
                : 'createdAt';
        sort[safeSortField] = sortOrder === 'asc' ? 1 : -1;

        const options = {
            sort,
            skip: pagination.skip,
            limit: pagination.limit,
        };

        const users = await User.find(filters, null, options).populate([
            'orders',
            {
                path: 'lastOrder',
                populate: { path: 'products' },
            },
            {
                path: 'lastOrder',
                populate: { path: 'customer' },
            },
        ]);

        const totalUsers = await User.countDocuments(filters);
        const totalPages = Math.ceil(totalUsers / pagination.limit);

        res.status(200).json({
            customers: users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: pagination.page,
                pageSize: pagination.limit,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get /customers/:id
export const getCustomerById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.params.id).populate([
            'orders',
            'lastOrder',
        ])
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

// Patch /customers/:id
export const updateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, phone } = req.body
        const updateData: Partial<Pick<IUser, 'name' | 'phone'>> = {}

        if (typeof name === 'string') updateData.name = name
        if (typeof phone === 'string') updateData.phone = phone

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .orFail(
                () =>
                    new NotFoundError(
                        'Пользователь по заданному id отсутствует в базе'
                    )
            )
            .populate(['orders', 'lastOrder'])
        res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

// Delete /customers/:id
export const deleteCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).orFail(
            () =>
                new NotFoundError(
                    'Пользователь по заданному id отсутствует в базе'
                )
        )
        res.status(200).json(deletedUser)
    } catch (error) {
        next(error)
    }
}
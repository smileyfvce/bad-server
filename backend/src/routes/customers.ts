import csrf from '@dr.pogodin/csurf'
import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'

const customerRouter = Router()
const csrfProtection = csrf({ cookie: true });

customerRouter.use(auth, roleGuardMiddleware(Role.Admin))
customerRouter.get('/', auth, getCustomers)
customerRouter.get('/:id', auth, getCustomerById)
customerRouter.patch('/:id', auth, csrfProtection, updateCustomer)
customerRouter.delete('/:id', auth, csrfProtection, deleteCustomer)

export default customerRouter

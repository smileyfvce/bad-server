import csrf from '@dr.pogodin/csurf'
import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import auth from '../middlewares/auth'

const customerRouter = Router()
const csrfProtection = csrf({ cookie: true });

customerRouter.get('/', auth, getCustomers)
customerRouter.get('/:id', auth, getCustomerById)
customerRouter.patch('/:id', auth, csrfProtection, updateCustomer)
customerRouter.delete('/:id', auth, csrfProtection, deleteCustomer)

export default customerRouter

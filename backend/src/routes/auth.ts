import csrf from '@dr.pogodin/csurf'
import { Router } from 'express'
import {
    getCsrfToken,
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { sendCsrfToken } from '../middlewares/csrfGuard'

const authRouter = Router()
const csrfProtection = csrf({ cookie: true })
authRouter.get('/csrf-token', csrfProtection, getCsrfToken)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, csrfProtection, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', csrfProtection, logout)
authRouter.post('/register', register)

export default authRouter

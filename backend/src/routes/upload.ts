import csrf from '@dr.pogodin/csurf'
import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'
import { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'

const uploadRouter = Router()
const csrfProtection = csrf({ cookie: true });
uploadRouter.post('/', csrfProtection, fileMiddleware.single('file'), uploadFile)

export default uploadRouter

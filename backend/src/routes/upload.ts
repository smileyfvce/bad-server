import csrf from '@dr.pogodin/csurf'
import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'

const uploadRouter = Router()
const csrfProtection = csrf({ cookie: true });
uploadRouter.post('/', csrfProtection, fileMiddleware.single('file'), uploadFile)

export default uploadRouter

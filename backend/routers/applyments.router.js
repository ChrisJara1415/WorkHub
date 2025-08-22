import { Router } from 'express'
import {createApplyment, searchApplyments, searchApplymentById, updateApplyment, deleteApplyment} from '../controllers/applyments.controller.js'
import validateApiKey from '../middlewares/apiKey.middleware.js'
const router = Router()

router.get('/', validateApiKey, searchApplyments)
router.post('/', validateApiKey, createApplyment)
router.get('/:id', validateApiKey, searchApplymentById)
router.patch('/:id', validateApiKey, updateApplyment)
router.delete('/:id', validateApiKey, deleteApplyment)

export default router
import { Router } from 'express'
import {createApplyment, searchApplyments, searchApplymentById, updateApplyment, deleteApplyment} from '../controllers/applyments.controller.js'
const router = Router()

router.get('/', searchApplyments)
router.post('/', createApplyment)
router.get('/:id', searchApplymentById)
router.patch('/:id', updateApplyment)
router.delete('/:id', deleteApplyment)

export default router
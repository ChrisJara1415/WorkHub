import { Router } from 'express'
import {createReport, searchReports, searchReportByID, updateReport, deleteReport} from '../controllers/reports.controller.js'
import validateApiKey from '../middlewares/apiKey.middleware.js'
const router = Router()

router.get('/', validateApiKey, searchReports)
router.post('/', validateApiKey, createReport)
router.get('/:id', validateApiKey, searchReportByID)
router.patch('/:id', validateApiKey, updateReport)
router.delete('/:id', validateApiKey, deleteReport)

export default router
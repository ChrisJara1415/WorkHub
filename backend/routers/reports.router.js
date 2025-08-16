import { Router } from 'express'
import {createReport, searchReports, searchReportByID, updateReport, deleteReport} from '../controllers/reports.controller.js'
const router = Router()

router.get('/', searchReports)
router.post('/', createReport)
router.get('/:id', searchReportByID)
router.patch('/:id', updateReport)
router.delete('/:id', deleteReport)

export default router
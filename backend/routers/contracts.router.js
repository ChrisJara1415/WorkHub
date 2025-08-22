import { Router } from 'express'
import {createContract, searchContract, searchContractById, updateContract, deleteContract} from '../controllers/contracts.controller.js'
import validateApiKey from '../middlewares/apiKey.middleware.js'
const router = Router()

router.get('/', validateApiKey, searchContract)
router.post('/', validateApiKey, createContract)
router.get('/:id', validateApiKey, searchContractById)
router.patch('/:id', validateApiKey, updateContract)
router.delete('/:id', validateApiKey, deleteContract)

export default router
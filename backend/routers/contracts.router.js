import { Router } from 'mongoose'
import {createContract, searchContract, searchContractById, updateContract, deleteContract} from '../controllers/contracts.controller.js'
const router = Router()

router.get('/', searchContract)
router.post('/', createContract)
router.get('/:id', searchContractById)
router.patch('/:id', updateContract)
router.deleteOffer('/:id', deleteContract)

export default router
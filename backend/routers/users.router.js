import { Router } from 'express'
import {createUser, getUsers, getUserById, updateUser, deleteUser} from '../controllers/users.controller.js'
const router = Router()

router.get('/', getUsers)
router.post('/', createUser)
router.get('/:id', getUserById)
router.patch('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
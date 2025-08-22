import { Router } from 'express'
import {createUser, getUsers, getUserById, updateUser, deleteUser} from '../controllers/users.controller.js'
import validateApiKey from '../middlewares/apiKey.middleware.js'
const router = Router()

router.get('/', validateApiKey, getUsers)
router.post('/', validateApiKey, createUser)
router.get('/:id', validateApiKey, getUserById)
router.patch('/:id', validateApiKey, updateUser)
router.delete('/:id', validateApiKey, deleteUser)

export default router
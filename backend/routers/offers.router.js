import { Router } from 'express'
import {createOffer, searchOffers, searchOfferById, updateOffer, deleteOffer} from '../controllers/offers.controller.js'
import validateApiKey from '../middlewares/apiKey.middleware.js'
const router = Router()

router.get('/', searchOffers)
router.get('/:id', searchOfferById)
router.post('/', validateApiKey, createOffer)
router.patch('/:id', validateApiKey, updateOffer)
router.delete('/:id', validateApiKey, deleteOffer)

export default router
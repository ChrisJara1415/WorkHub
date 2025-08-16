import { Router } from 'express'
import {createOffer, searchOffers, searchOfferById, updateOffer, deleteOffer} from '../controllers/offers.controller.js'
const router = Router()

router.get('/', searchOffers)
router.post('/', createOffer)
router.get('/:id', searchOfferById)
router.patch('/:id', updateOffer)
router.delete('/:id', deleteOffer)

export default router
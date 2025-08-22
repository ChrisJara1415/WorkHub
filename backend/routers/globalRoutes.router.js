import usersRouter from './users.router.js'
import reportsRouter from './reports.router.js'
import offersRouter from './offers.router.js'
import contractsRouter from './contracts.router.js'
import applymentsRouter from './applyments.router.js'
import { Router } from 'express'

const router = Router()

router.use('/clientes', usersRouter)
router.use('/reportes', reportsRouter)
router.use('/ofertas', offersRouter)
router.use('/contratos', contractsRouter)
router.use('/postulaciones', applymentsRouter)

export default router;
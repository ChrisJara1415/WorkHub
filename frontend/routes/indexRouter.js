import express from "express"
import jwt from "jsonwebtoken"
const router = express.Router()
import { renderLandingPage } from "../controllers/indexControllers/landingPageController.js";

router.get('/', renderLandingPage);
router.get('/registro', (req, res) => {
	res.render('pages/register', { title: 'Registro | WorkHub', layout: false })
});

export default router

// Middleware simple para requerir login
function requireAuth(req, res, next) {
	try {
		const token = req.cookies?.auth
		if (!token) return res.status(302).redirect('/')
		const payload = jwt.verify(token, process.env.JWT_SECRET)
		req.user = payload
		next()
	} catch {
		return res.status(302).redirect('/')
	}
}

// Vistas protegidas por autenticación
router.get('/empleado', requireAuth, (req, res) => {
	if (req.user?.rol === 'admin') return res.redirect('/admin')
	res.render('pages/employee/dashboard', { title: 'Panel de Empleado', layout: false, user: req.user })
})

router.get('/empleador', requireAuth, (req, res) => {
	if (req.user?.rol === 'admin') return res.redirect('/admin')
	res.render('pages/employer/dashboard', { title: 'Panel de Empleador', layout: false, user: req.user })
})
import express from "express"
const router = express.Router()
import { renderLandingPage } from "../controllers/indexControllers/landingPageController.js";

router.get('/', renderLandingPage);
router.get('/registro', (req, res) => {
	res.render('pages/register', { title: 'Registro | WorkHub', layout: false })
});

export default router
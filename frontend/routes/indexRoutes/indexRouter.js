import express from "express"
const router = express.Router()
import { renderLandingPage } from "../../controllers/indexControllers/landingPageController.js";

router.get('/', renderLandingPage);

export default router
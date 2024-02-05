import { Router } from 'express';
import { healthcheck, userHealthcheck } from "../controllers/healthcheck.controller.js"
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/').get(healthcheck).post(verifyJWT, userHealthcheck);

export default router
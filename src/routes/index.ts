import { Router } from 'express';
import userRouter from './user.route';

const router = Router();
const prefix: string = '/api';

router.use(`${prefix}/file`, userRouter);

export default router;

import express from 'express';
import * as NewsController from '../controllers/news.controller.ts';

const router = express.Router();

router.get('/', NewsController.getNews);

export default router;

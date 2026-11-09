import express from 'express';
import * as resourceController from '../controllers/resource.controller.ts';

const router = express.Router();

router.get('/categories', resourceController.getCategories);
router.post('/search', resourceController.searchResources);
router.get('/match', resourceController.matchResources);
router.get('/', resourceController.listResources);
router.get('/:id', resourceController.getResource);

export default router;

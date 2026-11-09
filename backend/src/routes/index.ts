import express from 'express';
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/user', require('./user.routes'));
router.use('/identity', require('./identity.routes'));
router.use('/resources', require('./resource.routes'));
router.use('/applications', require('./application.routes'));
router.use('/news', require('./news.routes'));
router.use('/alerts', require('./alerts.routes'));

module.exports = router;

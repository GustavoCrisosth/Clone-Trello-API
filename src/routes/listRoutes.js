const express = require('express');
const router = express.Router({ mergeParams: true });

const listController = require('../controllers/listController');
const authMiddleware = require('../middlewares/authMiddleware');
const cardRoutes = require('./cardRoutes');

router.use(authMiddleware);

router.post('/', listController.createList);

router.put('/:id', listController.updateList);

router.delete('/:id', listController.deleteList);

router.use('/:listId/cards', cardRoutes);


module.exports = router;
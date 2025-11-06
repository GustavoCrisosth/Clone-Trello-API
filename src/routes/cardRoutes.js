const express = require('express');
const router = express.Router({ mergeParams: true });

const cardController = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', cardController.createCard);

router.patch('/:id/move', cardController.moveCard);

router.put('/:id', cardController.updateCard);

router.delete('/:id', cardController.deleteCard);

module.exports = router;
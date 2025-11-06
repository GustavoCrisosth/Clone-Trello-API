const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middlewares/authMiddleware');
const listRoutes = require('./listRoutes');


router.use(authMiddleware);

router.post('/', boardController.createBoard);

router.get('/', boardController.getAllBoards);

router.get('/:id', boardController.getBoardById);

router.put('/:id', boardController.updateBoard);

router.delete('/:id', boardController.deleteBoard);

router.use('/:boardId/lists', listRoutes);

module.exports = router;
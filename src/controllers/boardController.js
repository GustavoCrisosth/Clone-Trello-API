const { Board, List, Card } = require('../../models');
const { z } = require('zod');

const boardSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório.'),
});

async function createBoard(req, res) {
    try {

        const { title } = boardSchema.parse(req.body);

        const userId = req.user.id;

        const newBoard = await Board.create({ title, userId });

        res.status(201).json(newBoard);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Erro ao criar quadro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function getAllBoards(req, res) {
    try {
        const userId = req.user.id;

        const boards = await Board.findAll({
            where: { userId },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(boards);

    } catch (error) {
        console.error('Erro ao obter quadros:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function getBoardById(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const board = await Board.findOne({
            where: {
                id,
                userId
            },
            include: [
                {
                    model: List,
                    as: 'lists',
                    include: [
                        {
                            model: Card,
                            as: 'cards',
                        }
                    ],
                }
            ],

            order: [
                ['lists', 'order', 'ASC'],
                ['lists', 'cards', 'order', 'ASC']
            ]
        });

        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado ou não pertence a este utilizador.' });
        }

        res.status(200).json(board);

    } catch (error) {
        console.error('Erro ao obter quadro por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function updateBoard(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title } = boardSchema.parse(req.body);

        const board = await Board.findOne({ where: { id, userId } });

        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado ou não pertence a este utilizador.' });
        }

        board.title = title;
        await board.save();

        res.status(200).json(board);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Erro ao atualizar quadro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function deleteBoard(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const board = await Board.findOne({ where: { id, userId } });

        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado ou não pertence a este utilizador.' });
        }

        await board.destroy();

        res.status(204).send();

    } catch (error) {
        console.error('Erro ao apagar quadro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}


module.exports = {
    createBoard,
    getAllBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
};
const { Board, List } = require('../../models');
const { z } = require('zod');

const listSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório.'),
    order: z.number().int().positive().optional(),
});

async function createList(req, res) {
    try {
        const { boardId } = req.params;
        const userId = req.user.id;

        const { title } = listSchema.parse(req.body);

        const board = await Board.findOne({ where: { id: boardId, userId } });
        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado ou não pertence a este usuário.' });
        }

        const maxOrderList = await List.findOne({
            where: { boardId },
            order: [['order', 'DESC']],
        });
        const newOrder = maxOrderList ? maxOrderList.order + 1 : 1;

        const newList = await List.create({
            title,
            boardId,
            order: newOrder,
        });

        res.status(201).json(newList);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Erro ao criar lista:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function updateList(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, order } = req.body;

        const list = await List.findOne({
            where: { id },
            include: [{
                model: Board,
                as: 'board',
                where: { userId },
                attributes: []
            }]
        });

        if (!list) {
            return res.status(404).json({ message: 'Lista não encontrada ou não pertence a este usuário.' });
        }

        if (title) list.title = title;
        if (order) list.order = order;

        await list.save();
        res.status(200).json(list);

    } catch (error) {
        console.error('Erro ao atualizar lista:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function deleteList(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const list = await List.findOne({
            where: { id },
            include: [{
                model: Board,
                as: 'board',
                where: { userId },
                attributes: []
            }]
        });

        if (!list) {
            return res.status(404).json({ message: 'Lista não encontrada ou não pertence a este usuário.' });
        }

        await list.destroy();
        res.status(204).send();

    } catch (error) {
        console.error('Erro ao apagar lista:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = {
    createList,
    updateList,
    deleteList,
};
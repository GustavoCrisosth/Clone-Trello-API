const { Board, List, Card, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { z } = require('zod');

const cardSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório.'),
    description: z.string().optional(),
    order: z.number().int().positive().optional(),
});

async function createCard(req, res) {
    try {
        const { listId } = req.params;
        const userId = req.user.id;

        const { title, description } = cardSchema.parse(req.body);

        const list = await List.findOne({
            where: { id: listId },
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

        const maxOrderCard = await Card.findOne({
            where: { listId },
            order: [['order', 'DESC']],
        });
        const newOrder = maxOrderCard ? maxOrderCard.order + 1 : 1;

        const newCard = await Card.create({
            title,
            description: description || null,
            listId,
            order: newOrder,
        });

        res.status(201).json(newCard);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Erro ao criar cartão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function updateCard(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, description, order, listId } = req.body;

        const card = await Card.findOne({
            where: { id },
            include: [{
                model: List,
                as: 'list',
                include: [{
                    model: Board,
                    as: 'board',
                    where: { userId },
                    attributes: []
                }],
                attributes: []
            }]
        });

        if (!card) {
            return res.status(404).json({ message: 'Cartão não encontrado ou não pertence a este usuário.' });
        }

        if (listId && listId !== card.listId) {
            const newList = await List.findOne({
                where: { id: listId },
                include: [{ model: Board, as: 'board', where: { userId } }]
            });
            if (!newList) {
                return res.status(403).json({ message: 'Não é permitido mover o cartão para esta lista.' });
            }
            card.listId = listId;
        }

        if (title) card.title = title;
        if (description !== undefined) card.description = description;
        if (order) card.order = order;

        await card.save();
        res.status(200).json(card);

    } catch (error) {
        console.error('Erro ao atualizar cartão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function deleteCard(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const card = await Card.findOne({
            where: { id },
            include: [{
                model: List,
                as: 'list',
                include: [{
                    model: Board,
                    as: 'board',
                    where: { userId },
                    attributes: []
                }],
                attributes: []
            }]
        });

        if (!card) {
            return res.status(404).json({ message: 'Cartão não encontrado ou não pertence a este usuário.' });
        }

        await card.destroy();
        res.status(204).send();

    } catch (error) {
        console.error('Erro ao apagar cartão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function moveCard(req, res) {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { newListId, newOrder } = req.body;


        if (newOrder < 1) {
            return res.status(400).json({ message: 'Nova ordem deve ser positiva.' });
        }

        const card = await Card.findOne({
            where: { id },
            include: [{
                model: List,
                as: 'list',
                include: [{
                    model: Board,
                    as: 'board',
                    where: { userId },
                    attributes: []
                }],
                attributes: []
            }],
            transaction: t
        });

        if (!card) {
            await t.rollback();
            return res.status(404).json({ message: 'Cartão não encontrado ou não pertence a este usuário.' });
        }

        const oldListId = card.listId;
        const oldOrder = card.order;

        if (oldListId !== newListId) {
            const newList = await List.findOne({
                where: { id: newListId },
                include: [{ model: Board, as: 'board', where: { userId } }],
                transaction: t
            });
            if (!newList) {
                await t.rollback();
                return res.status(403).json({ message: 'Não é permitido mover o cartão para esta lista.' });
            }
        }

        if (oldListId === newListId) {

            if (newOrder > oldOrder) {
                await Card.update(
                    { order: sequelize.literal('"order" - 1') },
                    {
                        where: {
                            listId: oldListId,
                            order: { [Op.gt]: oldOrder, [Op.lte]: newOrder }
                        },
                        transaction: t
                    }
                );
            } else if (newOrder < oldOrder) {
                await Card.update(
                    { order: sequelize.literal('"order" + 1') },
                    {
                        where: {
                            listId: oldListId,
                            order: { [Op.lt]: oldOrder, [Op.gte]: newOrder }
                        },
                        transaction: t
                    }
                );
            }
        } else {

            await Card.update(
                { order: sequelize.literal('"order" - 1') },
                {
                    where: { listId: oldListId, order: { [Op.gt]: oldOrder } },
                    transaction: t
                }
            );
            await Card.update(
                { order: sequelize.literal('"order" + 1') },
                {
                    where: { listId: newListId, order: { [Op.gte]: newOrder } },
                    transaction: t
                }
            );
        }

        card.listId = newListId;
        card.order = newOrder;
        await card.save({ transaction: t });

        await t.commit();
        res.status(200).json(card);

    } catch (error) {
        await t.rollback();
        console.error('Erro ao mover cartão:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = {
    createCard,
    updateCard,
    deleteCard,
    moveCard,
};
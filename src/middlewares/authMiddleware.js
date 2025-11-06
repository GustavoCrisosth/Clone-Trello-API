const jwt = require('jsonwebtoken');
const { User } = require('../../models');


const JWT_SECRET = process.env.JWT_SECRET || 'ChaveSuperSecreta';

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Token mal formatado.' });
        }
        const token = parts[1];

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }

        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário do token não encontrado.' });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}

module.exports = authMiddleware;
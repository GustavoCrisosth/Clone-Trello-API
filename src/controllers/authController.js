const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const { z } = require('zod');


const JWT_SECRET = process.env.JWT_SECRET || 'ChaveSuperSecreta'

const registerSchema = z.object({
    email: z.string().email('Email inválido.').min(1, 'Email é obrigatório.'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres.'),
});


const loginSchema = z.object({
    email: z.string().email('Email inválido.').min(1, 'Email é obrigatório.'),
    password: z.string().min(1, 'Senha é obrigatória.'),
});


async function register(req, res) {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { email, password } = validatedData;

        const newUser = await User.create({ email, password });

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: { id: newUser.id, email: newUser.email },
            token,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

async function login(req, res) {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login realizado com sucesso!',
            user: { id: user.id, email: user.email },
            token,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = {
    register,
    login,
};
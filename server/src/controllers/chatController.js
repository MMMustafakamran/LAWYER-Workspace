const prisma = require('../utils/prisma');

const getMessages = async (req, res) => {
    try {
        const { barId } = req.params;

        const messages = await prisma.chat.findMany({
            where: { barId },
            include: {
                sender: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMessages
};

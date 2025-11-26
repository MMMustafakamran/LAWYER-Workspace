const prisma = require('../utils/prisma');

const getAllLaws = async (req, res) => {
    try {
        const laws = await prisma.law.findMany();
        res.json(laws);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getLawById = async (req, res) => {
    try {
        const { id } = req.params;
        const law = await prisma.law.findUnique({
            where: { id: parseInt(id) }
        });

        if (!law) {
            return res.status(404).json({ message: 'Law not found' });
        }
        res.json(law);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchLaws = async (req, res) => {
    try {
        const { query, category } = req.query;

        const where = {};
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ];
        }
        if (category && category !== 'All') {
            where.category = category;
        }

        const laws = await prisma.law.findMany({
            where,
            orderBy: { title: 'asc' }
        });

        res.json(laws);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Temporary function to seed some data (optional, can be removed later)
const seedLaws = async (req, res) => {
    try {
        const count = await prisma.law.count();
        if (count > 0) return res.json({ message: 'Laws already seeded' });

        await prisma.law.createMany({
            data: [
                {
                    title: 'Pakistan Penal Code (PPC)',
                    description: 'The primary criminal code of Pakistan.',
                    category: 'Criminal',
                    content: 'The Pakistan Penal Code (PPC) is a penal code for all offences charged in Pakistan. It was originally prepared by Lord Macaulay with a great consultation in 1860 on the behalf of the Government of India as the Indian Penal Code. After the independence in 1947, Pakistan inherited the same code and it was subsequently named after Pakistan.'
                },
                {
                    title: 'Code of Civil Procedure (CPC)',
                    description: 'Procedural law for administration of civil proceedings.',
                    category: 'Civil',
                    content: 'The Code of Civil Procedure, 1908 is a procedural law related to the administration of civil proceedings in Pakistan. It consolidates and amends the laws relating to the procedure of the Courts of Civil Judicature.'
                },
                {
                    title: 'Companies Act 2017',
                    description: 'Law governing companies in Pakistan.',
                    category: 'Corporate',
                    content: 'An Act to reform and re-enact the law relating to companies and for matters connected therewith. It replaced the Companies Ordinance, 1984.'
                },
                {
                    title: 'Family Courts Act 1964',
                    description: 'Law relating to Family Courts.',
                    category: 'Family',
                    content: 'An Act to make provision for the establishment of Family Courts for the expeditious settlement and disposal of disputes relating to marriage and family affairs and for matters connected therewith.'
                }
            ]
        });
        res.json({ message: 'Laws seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllLaws,
    getLawById,
    searchLaws,
    seedLaws
};

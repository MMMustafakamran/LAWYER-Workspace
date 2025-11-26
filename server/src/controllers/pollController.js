const prisma = require('../utils/prisma');

const createPoll = async (req, res) => {
    try {
        const { question, barType, candidateList, endDate } = req.body;

        // Only admins or lawyers can create polls (simplified for now)
        if (req.user.role !== 'LAWYER' && req.user.role !== 'SYSTEM_ADMIN') {
            return res.status(403).json({ message: 'Not authorized to create polls' });
        }

        const poll = await prisma.poll.create({
            data: {
                question,
                barType,
                candidateList,
                endDate: new Date(endDate)
            }
        });

        res.status(201).json(poll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPolls = async (req, res) => {
    try {
        const polls = await prisma.poll.findMany({
            include: {
                votes: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate results
        const pollsWithResults = polls.map(poll => {
            const results = {};
            poll.candidateList.forEach(candidate => {
                results[candidate] = 0;
            });
            poll.votes.forEach(vote => {
                if (results[vote.choice] !== undefined) {
                    results[vote.choice]++;
                }
            });
            return { ...poll, results, totalVotes: poll.votes.length };
        });

        res.json(pollsWithResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const vote = async (req, res) => {
    try {
        const { pollId, choice } = req.body;
        const userId = req.user.id;

        // Check if already voted
        const existingVote = await prisma.vote.findUnique({
            where: {
                pollId_userId: {
                    pollId: parseInt(pollId),
                    userId
                }
            }
        });

        if (existingVote) {
            return res.status(400).json({ message: 'You have already voted in this poll' });
        }

        const vote = await prisma.vote.create({
            data: {
                pollId: parseInt(pollId),
                userId,
                choice
            }
        });

        res.status(201).json(vote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPoll,
    getPolls,
    vote
};

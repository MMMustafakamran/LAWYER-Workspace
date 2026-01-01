const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

const createPoll = async (req, res) => {
    try {
        const { question, barType, candidateList, endDate } = req.body;

        // Only admins or lawyers can create polls
        if (req.user.role !== 'LAWYER' && req.user.role !== 'SYSTEM_ADMIN') {
            return res.status(403).json({ message: 'Not authorized to create polls' });
        }

        const poll = await Poll.create({
            question,
            barType,
            candidateList,
            endDate: new Date(endDate)
        });

        res.status(201).json(poll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPolls = async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });

        // Get votes for each poll and calculate results
        const pollsWithResults = await Promise.all(polls.map(async (poll) => {
            const votes = await Vote.find({ pollId: poll._id });
            
            const results = {};
            poll.candidateList.forEach(candidate => {
                results[candidate] = 0;
            });
            votes.forEach(vote => {
                if (results[vote.choice] !== undefined) {
                    results[vote.choice]++;
                }
            });
            
            return {
                ...poll.toObject(),
                votes,
                results,
                totalVotes: votes.length
            };
        }));

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
        const existingVote = await Vote.findOne({ pollId, userId });

        if (existingVote) {
            return res.status(400).json({ message: 'You have already voted in this poll' });
        }

        const newVote = await Vote.create({
            pollId,
            userId,
            choice
        });

        res.status(201).json(newVote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePoll = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Only admins can delete polls
        if (req.user.role !== 'SYSTEM_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete polls' });
        }

        const poll = await Poll.findById(id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        // Delete all associated votes
        await Vote.deleteMany({ pollId: id });
        await poll.deleteOne();

        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createPoll,
    getPolls,
    vote,
    deletePoll
};

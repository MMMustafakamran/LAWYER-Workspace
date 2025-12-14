const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './database_env.env' });

const http = require('http');
const { initSocket } = require('./src/socket/socket');

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/authRoutes');
const caseRoutes = require('./src/routes/caseRoutes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/laws', require('./src/routes/lawRoutes'));
app.use('/api/lawyers', require('./src/routes/lawyerRoutes'));
app.use('/api/marketplace', require('./src/routes/marketplaceRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/polls', require('./src/routes/pollRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));

app.get('/', (req, res) => {
    res.send('Lawyer App API is running');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

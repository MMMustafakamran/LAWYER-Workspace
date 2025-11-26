const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './database_env.env' });

const app = express();
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

app.get('/', (req, res) => {
    res.send('Lawyer App API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

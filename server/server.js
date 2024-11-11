const express = require('express');
const connectDB = require('./Config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./Routes/authRoutes');
const invoiceRoutes = require('./Routes/invoiceRoutes');
const customerRoutes = require('./Routes/customerRoutes');

dotenv.config();

const app = express();

// Connect Database
connectDB();

app.use(cors())

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from the 'Uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/customer', customerRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const express = require('express');
const connectDB = require('./Config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./Routes/authRoutes');
const invoiceRoutes = require('./Routes/invoiceRoutes');
const customerRoutes = require('./Routes/customerRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const merchantRoutes = require('./Routes/merchantRoutes');
const generateInvoices = require('./cron'); 

const authMiddleware = require('./Middlewares/authMiddleware');
const roleMiddleware = require('./Middlewares/roleMiddleware');

dotenv.config();

const app = express();

// Connect Database
connectDB();

app.use(cors())

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Serve static files from the 'Uploads' directory
// app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Serve static files from the 'Invoices' directory
// app.use('/invoices', express.static(path.join(__dirname, 'Invoices')));

// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// Serve assets from the 'dist/assets' folder
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/order', orderRoutes);
// app.use('/api/order', authMiddleware, roleMiddleware(["admin"]), orderRoutes);
app.use('/api/merchant', merchantRoutes);

//Catch all other routes and return the index.html file from dist
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

generateInvoices(); // Initialize the cron job

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

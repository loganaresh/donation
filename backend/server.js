const express = require('express');
const cors = require('cors');
const path = require('path');
const { protect } = require('./middleware/authMiddleware');
const { login } = require('./controllers/authController');
const upload = require('./middleware/uploadMiddleware');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/mock-payment', (req, res) => {
  // Generate fake transaction ID
  const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
  res.json({ success: true, transactionId });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Add these after existing routes
let products = []; // Replace the mock products array
// Auth routes
app.post('/api/auth/login', login);

// Protected admin routes
app.get('/api/admin/products', protect, (req, res) => {
  res.json(products);
});

// Admin product routes
app.post('/api/admin/products', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const newProduct = {
            id: products.length + 1,
            ...req.body,
            image: imageUrl,
            createdAt: new Date()
        };
        products.push(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading product', error: error.message });
    }
});


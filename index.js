const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connectDB = require('./config/DB');

const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/services.routes');
const packageRoutes = require('./routes/package.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');

const User = require('./models/user');

const app = express();

// ==============================
// Middleware Setup
// ==============================

// Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse incoming JSON and form-data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (one folder only)
app.use('/uploads', express.static('uploads'));

// ==============================
// Public Routes (No Auth)
// ==============================
app.use('/users', userRoutes); // login/register etc.

// ==============================
// Auth Middleware (Protected routes only)
// ==============================
const authenticateToken = (req, res, next) => {
  const openRoutes = ['register', 'login', 'uploads'];

  // Check if route is public
  if (openRoutes.some(route => req.originalUrl.includes(route))) {
    return next();
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, "mysecret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send({ message: 'Invalid token' });
  }
};

// Apply auth middleware to protected routes
app.use(authenticateToken);

// ==============================
// Protected Routes
// ==============================
app.use('/services', serviceRoutes);
app.use('/packages', packageRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/pay', paymentRoutes);

// ==============================
// Error Handling
// ==============================
app.use((err, req, res, next) => {
  res.status(400).send({
    status: 400,
    message: err.message || 'Something went wrong',
  });
});

// ==============================
// Start Server + Create Super Admin
// ==============================
const port = process.env.PORT || 3000;

app.listen(port, async () => {
  await connectDB();
  console.log(`🚀 Server running at http://localhost:${port}`);

  const superAdminEmail = 'zaffa1034@gmail.com';
  const superAdminPassword = 'Zaffa123';

  try {
    const superAdmin = await User.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      await User.create({
        username: 'zaffa',
        name: 'Super Admin',
        email: superAdminEmail,
        password: hashedPassword,
        role: 'super_admin',
      });

      console.log("✅ Super admin created!");
    } else {
      console.log("✅ Super admin already exists.");
    }
  } catch (err) {
    console.error("❌ Error checking/creating super admin:", err.message);
  }
});

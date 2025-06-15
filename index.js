const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/DB');
const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/services.routes');
const packageRouter = require("./routes/package.routes")
const orderRouter = require("./routes/order.routes")
const reviewRouter = require("./routes/review.routes");
const jwt = require("jsonwebtoken");
const paymentRoutes = require("./routes/payment.routes");
const User = require("./models/user"); // <== Add this import
const bcrypt = require("bcrypt"); // <== Add this import

// Middleware
app.use(
  cors({
    origin: "http://localhost:4200", // أو رابط الفرونت
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // مهم!
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// For authentication token
const authenticateToken = (req, res, next) => {
  if (req.originalUrl.includes('register') || req.originalUrl.includes('login') || req.originalUrl.includes('images')) {
    console.log('Public route, skipping token check.');
    next();
  } else {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Token outside if:", token);

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
  }
};

// Routes that don't need auth
app.use('/users', userRoutes);
app.use('/images', express.static('images'));
app.use('/uploads', express.static('uploads'));

// Now enable auth for the rest
app.use(authenticateToken);

// Routes that need auth
app.use('/services', serviceRoutes);
app.use("/packages", packageRouter);
app.use("/orders", orderRouter);
app.use("/reviews", reviewRouter);
app.use("/pay", paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(400).send({
    status: 400,
    message: err.message || 'Something went wrong',
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);

  // === SUPER ADMIN CREATION LOGIC ===
  const superAdminEmail = 'zaffa1034@gmail.com'; // <== Put your super-admin email here
  const superAdminPassword = 'Zaffa123'; // <== Put your strong password here (16+ chars!)

  const superAdminExists = await User.findOne({ email: superAdminEmail });

  if (!superAdminExists) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    await User.create({
        username: 'zaffa',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'super_admin', // <== Important: role = super_admin
      name: 'Super Admin'
    });

    console.log("✅ Super admin created!");
  } else {
    console.log("✅ Super admin already exists.");
  }
});

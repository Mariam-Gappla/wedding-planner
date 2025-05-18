const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/DB');
const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/services.routes');
const packageRouter = require("./routes/package.routes")
const orderRouter = require("./routes/order.routes")
const reviewRouter = require("./routes/review.routes");
const jwt=require("jsonwebtoken");
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
 // For parsing JSON request bodies
app.use('/images', express.static('images'));
//for authentecation token
const authenticateToken = (req, res, next) => {
    if (req.originalUrl.includes('register') || req.originalUrl.includes('login') || req.originalUrl.includes('images')) {
        console.log('Public route, skipping token check.');
        next();
    }
    else {
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
app.use(authenticateToken);



// Routes
app.use('/users', userRoutes);
app.use('/services', serviceRoutes);
app.use("/packages", packageRouter);
app.use("/orders", orderRouter);
app.use("/orders", reviewRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(400).send({
        status: 400, // Fixed: res.statusCode was undefined, so set it directly
        message: err.message || 'Something went wrong',
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});

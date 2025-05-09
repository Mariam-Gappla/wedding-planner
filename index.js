const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/DB');
const userRoutes = require('./routes/user.routes');
const vendorRoutes=require('./routes/vendor.routes');
const serviceRoutes=require('./routes/services.routes');
const packageRouter=require("./routes/package.routes")
const orderRouter=require("./routes/order.routes")
const reviewRouter=require("./routes/review.routes")

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// Routes
app.use('/users', userRoutes);
app.use('/vendors',vendorRoutes);
app.use('/services',serviceRoutes);
app.use("/packages",packageRouter);
app.use("/orders",orderRouter);
app.use("/orders",reviewRouter);

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

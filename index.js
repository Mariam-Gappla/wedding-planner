const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/DB');
const userRoutes = require('./routes/user');
const vendorRoutes=require('./routes/vendor.routes');
const serviceRoutes=require('./routes/services.routes');
const packageRouter=require("./routes/package.routes")

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// Routes
app.use('/user', userRoutes);
app.use('/vendor',vendorRoutes);
app.use('/service',serviceRoutes);
app.use("/package",packageRouter);

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

const express = require('express');
const app = express();
const user=require('./routes/user');
const cors = require('cors');
app.use(cors());
app.use("/user",user)
app.use((err, req, res, next) => {
    res.status(400).send({
        status: res.statuscode,
        message: err.message,
    })
})
app.listen(3000, () => {
    console.log("server is running on port 3000")
})
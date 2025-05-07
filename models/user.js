const { required } = require('joi');
const mongoose=require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/Zafa").then(()=>{
//     console.log("connected to database")
// }).catch((err)=>{
//     console.log("error connecting to database")
// });
const userSchema=new mongoose.Schema({
   username:{
        type:"string",
        required:true,
    },
    email:{
        type:"string",
        required:true,
        unique:true,
        match:/^[a-zA-z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
    },
    password:{
        type:"string",
        required:true,
    },
   role:{
    type:"string",
    required:true,
   }
});

const User=mongoose.model("User",userSchema);
module.exports=User;
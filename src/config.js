const mongoose = require('mongoose');
const connect= mongoose.connect("mongodb://localhost:27017/Login");

connect.then(()=>{
    console.log("Connected to the database");
})
.catch(()=>{
    console.log("error connecting to the database");
});

//schema
const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
});

//collection
const collection = new mongoose.model("users", userSchema);

module.exports = collection;
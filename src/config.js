const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to the online database");
    })
    .catch((error) => {
        console.log("Error connecting to the online database:", error);
    });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("users", userSchema);

module.exports = collection;

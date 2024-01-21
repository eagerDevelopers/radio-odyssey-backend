require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose") 
const cookieParser = require("cookie-parser");
var serverRouter = require("./routes");

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/", serverRouter);

app.listen(PORT, () => {
    console.log(`Backend server is running on port: ${PORT}`);
    console.log(`Connecting to ${DB_NAME} using mongoose...`);
    mongoose.connect(DB_URI, { dbName: DB_NAME })
        .then(() => {
            console.log(`Successfully connected to ${DB_NAME}`);
        })
        .catch(error => {
            console.log("Error occured while connecting to database: " + error);
        });

    mongoose.connection.on("error", error => {
        console.log("Error occured with database connection: " + error);
    });
    mongoose.connection.on("disconnected", msg => {
        console.log("Database connection broken: " + msg);
    });

});



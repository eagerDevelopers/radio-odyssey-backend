require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mongodb = require("./mongodb");
const mongoose = require("mongoose") 

var serverRouter = require("./routes");

const port = process.env.PORT || 5000;
const dbUri = process.env.DB_URI;

mongoose
	.connect(dbUri, { useNewUrlParser: true, dbName: 'radio-odyssey-database' })
	.then(() => {
        console.log("Mongoose connected!")
        const app = express();
        app.use(cors());
        app.use(express.json());
        // Configure server with endpoints defined in routes.js with base url "/"
        app.use("/", serverRouter);
        
        app.listen(port, () => {
            console.log(`Backend server is running on port: ${port}`);
            mongodb.connectToMongoCluster().catch(console.dir);
        
            // console.log("Fetching user eagerdeveloper...");
        
            // let usersCollection = mongodb.getMongoClient().db("radio-odyssey-database").collection("Users");
            // usersCollection
            //     .findOne({username: "eagerdeveloper"})
            //     .then((result) => {
            //     console.log("Fetched user successfully!");
            //         console.log(result);
            //     })
            //     .catch((err) => {
            //         console.error(err);
            //     });
        
        })	
    })
    .catch(ex => {console.log("mongoose failed to connect:", ex)})



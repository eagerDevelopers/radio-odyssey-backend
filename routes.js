const express = require("express");
const mongodb = require("./mongodb");

// Backend endpoints are defined in express.Router
const serverRouter = express.Router();

serverRouter.post("/login", function (request, response) {  
    let user = {
        username: request.body.username,
        password: request.body.password,
    };

    console.log(`Checking if user ${user.username} exists in database...`);
    
    let usersCollection = mongodb.getUsersCollection();

    let fetchedUser = usersCollection.findOne({ username: user.username });

    fetchedUser.then((value) => {
        console.log(`Fetched data: ${value?.username} ${value?.password}`);

        if (value == null) {
            console.log(`User ${user.username} DOES NOT exist in database...`);

            response.json({userAuthenticated: false});
            return;
        }

        if (user.password != value.password) {
            console.log(`Password for ${user.username} DOES NOT match...`);

            response.json({userAuthenticated: false});
            return;
        }
        
        console.log(`User ${user.username} DOES exist in database and password matches...`);

        response.json({userAuthenticated: true});
    });
});

module.exports = serverRouter; 

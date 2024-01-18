const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const mongodb = require("./mongodb");
const { User, signUpUserChain } = require("./models/User");

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

serverRouter.post("/signup", signUpUserChain(), async function (request, response) {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
        return response.json({ errors: validationErrors.array() });
    }
    
    // Hash password with random salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(request.body.password, salt);

    const user = new User(
        request.body.username,
        passwordHash,
        request.body.firstName,
        request.body.lastName,
        request.body.email,
    )

    const usersCollection = mongodb.getUsersCollection();
    
    // Check if user with inputed username or email already exists in database
    if (await usersCollection.findOne({username: user.username }) != null) {
        return response.json({ error: `User with username ${user.username} already signed up`});
    }
    if (await usersCollection.findOne({email: user.email }) != null) {
        return response.json({ error: `User with email ${user.email} already signed up`});
    }

    try {
        usersCollection.insertOne(user);
    } catch (error) {
        return response.json({ errors: error });
    }

    return response.json({ message: `User ${user.username} successfully signed up!` });
})

serverRouter.get("/mapApiKey", function (request, response) {  
    response.json({mapApiKey: process.env.MAP_API_KEY});
});

serverRouter.get("/radioStations", async function (request, response) {
    const radioCollection = mongodb.getRadioCollection();
    const radioStations = await radioCollection.find({}).toArray();
    
    return response.json({ radioStations: radioStations });
});

module.exports = serverRouter; 

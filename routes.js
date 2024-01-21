const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const mongodb = require("./mongodb");
const { User, signUpUserChain } = require("./models/User");
const { ObjectId } = require('mongodb');
const Station = require("./models/Station")
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

serverRouter.get("/stations/:id", async (req, res) => {
    let stationId
    try {
        stationId = new ObjectId(req.params.id)
    } catch (e) {
        console.log("object id exception", e)
        return res.status(404).json({error: "stationId invalid"})
    }

	const station = await Station.findOne({ _id: stationId })
    if (station === null) {
        return res.status(404).json({error: "station not found"})
    }
	res.send(station)
})

serverRouter.put("/stations/:id",async ( request,response)=>{
    let stationId
    try{
    stationId=new ObjectId(request.params.id)
    } catch(e){
        console.log("object id exception", e)
        return response.status(404).json({error: "stationId invalid"})
    }
    const station = await Station.findOneAndUpdate({ _id: stationId } ,request.body)
    if(station === null){
        return response.status(404).json({error: "station not found"})
    }
    response.send(station)
})

serverRouter.delete("/stations/:id", async (request,response)=>
{
    let stationId
    try{
        stationId= new ObjectId(request.params.id)
    }catch(e){
        console.log("object id exception", e)
        return response.status(404).json({error: "stationId invalid"})
    }
    try{
        const {deletedCount} = await Station.deleteOne({ _id: stationId })
        if (deletedCount<1) {
            return response.status(404).send({ error: "Station doesn't exist!" })
        }
    }catch(e){
        return response.status(404).send({ error: "Error deleting station!" })
    }
    response.json({status: "ok"})
})

serverRouter.post("/stations", async function(request,response) {
    console.log("u stations postu sam", request.body.name)

	const station = new Station({
        ...request.body,        
	})
	await station.save()

    response.send(station)
})





module.exports = serverRouter; 

// seederr pozove radio browser -> dobije podatke nazaddddddddd o xyz stanica
// nakon toga seeder poziva APi naseg servera da te stanice doda u nas sustav
// nas server koji implementira nas API dodaje te te podatke u Mongodb
// konacno react client poziva nas API da dobije podatke o radio staniiiicama
// nas server ce pogledati u mongodb i vratiti podatke koje tamo nadje

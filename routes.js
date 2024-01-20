const express = require("express");
const bcrypt = require("bcrypt");
const { ObjectId } = require('mongodb');
const User = require("./models/User");
const Station = require("./models/Station")

// Backend endpoints are defined in express.Router
const serverRouter = express.Router();

serverRouter.post("/login", async function (request, response) {
    try {
        const user = await User.findOne({username: request.body.username});
        if (!user) {
            return response.status(404).json({ userAuthenticated: false, message: "User not defined in database"});
        }

        const passwordIsValid = bcrypt.compareSync(request.body.password, user.password);
        if (!passwordIsValid) {
            return response.status(401).send({ userAuthenticated: false, message: "Invalid Password" });
        }

        return response.status(200).json({ userAuthenticated: true, message: "User successfully signed in"});
    } catch (error) {
        return response.status(500).json({ userAuthenticated: false, message: "Error while logging in user: " + error });
    }
});

serverRouter.post("/signup", async function (request, response) {
    try {
        const registeredUsers = await User.findByUsernameOrEmail(request.body.username, request.body.email);
        if (registeredUsers.length != 0) {
            return response.status(401).json({ message: "User already defined in database" });
        }
    } catch (error) {
        response.status(500).json({ message: "Error while checking if user already defined in database: " + error });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(request.body.password, salt);

    const user = new User({
        username: request.body.username,
        password: passwordHash,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
    });

    try {
        await user.save();
    } catch (error) {
        return response.status(500).json({ message: "Error while saving user: " + error });
    }

    return response.status(200).json({ message: "User successfully signed up"});
});

serverRouter.get("/mapApiKey", function (request, response) {  
    response.json({mapApiKey: process.env.MAP_API_KEY});
});

serverRouter.get("/stations", async function(request,response) {
    console.log("u f-iji")
    const station = await Station.find()
    response.json(station)
})

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

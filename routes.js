const express = require("express");
const { ObjectId } = require('mongodb');
const User = require("./models/User");
const Station = require("./models/Station")
const AuthController = require("./controllers/AuthController");

// Backend endpoints are defined in express.Router
const serverRouter = express.Router();

serverRouter.post("/login", AuthController.login);

serverRouter.post("/signup", AuthController.signup);

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

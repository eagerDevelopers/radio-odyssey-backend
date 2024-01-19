const mongoose = require("mongoose")
require('mongoose-type-url');

const schema = mongoose.Schema({
	stationuuid: {type: String, required: true, index:true},
	name: {type: String, required: true, index:true},
    url: {type: mongoose.SchemaTypes.Url, required:true},
    homepage: mongoose.SchemaTypes.Url,
    favicon: mongoose.SchemaTypes.Url,
    tags: String,
    country: String,
    lastchangetime_in_radiobrowser: Date,
    codec: {type: String, required: true},
    lng: {type: Number, required: true , index:true},
    lat: {type: Number, required: true, index:true}
})

module.exports = mongoose.model("Station", schema)
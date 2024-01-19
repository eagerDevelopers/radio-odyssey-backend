const axios = require('axios');
const fs = require('fs');

function delay(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000); // Multiply by 1000 to convert seconds to milliseconds
  });
}


async function fetchStationsInDB(){
  try{
    const response=await axios.get("http://localhost:5001/stations")
    const dbStations =  response.data
    const stationsByRadioBrowserId = {}
    dbStations.forEach(s => {
      stationsByRadioBrowserId[s.stationuuid] = s
    })
    return stationsByRadioBrowserId
  }catch(e){
    console.error('Error fetching stations from DB:', error.message);
  }
}

async function fetchAllCountries() {
  try {
    const response = await axios.get('https://de1.api.radio-browser.info/json/countries');
    console.log("countries")
    console.log(`fetched total ${response.data.length} countries`)
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    throw error;
  }
}

async function fetchStationsForCountry(countryCode) {
  try {
    console.log(`fetching stations for:${countryCode}`)
    const response = await axios.get(`https://de1.api.radio-browser.info/json/stations/bycountry/${countryCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stations for ${countryCode}:`, error.message);
    return []
  }
}

function filterStationsWithCoordinates(stations) {
  return stations.filter(station => {
    return (
      station.geo_lat 
      && station.geo_long
      && station.name
      && station.stationuuid
      && station.codec
      && station.url
    )
  })
}

function mergeStations(countryStations, allStations) {
  return allStations.concat(countryStations);
}

async function saveStationsToFile(stations) {
  try {
    const jsonString = JSON.stringify(stations, null, 2);
    fs.writeFileSync('stations.json', jsonString);
    console.log('Stations saved to stations.json');
  } catch (error) {
    console.error('Error saving stations to file:', error.message);
    throw error;
  }
}
function limitStations(stations,limit){
    if(stations.length<=limit){
        return stations
    }
    return stations.splice(0,limit)
}

async function updateStation(station, ourId){
  try {
    const response = await axios.put('http://localhost:5001/stations/'+ourId, station);
  } catch (error) {
    
    console.error('Error in update station:', station);
  }
}

async function insertStation(station){
  try {
    const response = await axios.post('http://localhost:5001/stations/', station);
  } catch (error) {
    console.error('Error in insert station:', station);
  }
}

async function updateOurServer(stanice, stationsByRadioBrowserId) {
  const kolikoStanica = stanice.length
  for (let i=0; i<kolikoStanica; i++) {
    const stanica = stanice[i]
    const radioBrowserId = stanica.stationuuid
    const stanicaModified = {...stanica, 
                              lat: stanica.geo_lat,
                              lng: stanica.geo_long,
                              lastchangetime_in_radiobrowser: stanica.lastchangetime_iso8601
                            }
    // check if station is already in our server, if yes update it, else insert it as new
    if (radioBrowserId in stationsByRadioBrowserId) {
      const ourId = stationsByRadioBrowserId[radioBrowserId]._id
      await updateStation(stanicaModified, ourId)
    } else {
      await insertStation(stanicaModified)
    }
  }
}


async function main() {
  try {
    // Fetch all countries
    const countries = await fetchAllCountries();
    const stationsByRadioBrowserId = await fetchStationsInDB()
    // Fetch and merge stations for each country
    let allStations = [];
    for (const country of countries) {
      const countryStations = await fetchStationsForCountry(country.iso_3166_1);
      const filteredStations = filterStationsWithCoordinates(countryStations);
      const limitirane = limitStations(filteredStations, 15);
      updateOurServer(limitirane, stationsByRadioBrowserId)
      allStations = mergeStations(limitirane, allStations);
      await delay(1)
    }
    // Save the final list of stations to a file
    await saveStationsToFile(allStations);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Run the script
main();

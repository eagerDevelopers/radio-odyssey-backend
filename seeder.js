const axios = require('axios');
const fs = require('fs');

async function fetchAllCountries() {
  try {
    const response = await axios.get('https://de1.api.radio-browser.info/json/countries');
    console.log("countries")
    console.log(response.data)
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
  return stations.filter(station => station.geo_lat && station.geo_long);
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

async function main() {
  try {
    // Fetch all countries
    const countries = await fetchAllCountries();
    //return
    // Fetch and merge stations for each country
    let allStations = [];
    for (const country of countries) {
      const countryStations = await fetchStationsForCountry(country.iso_3166_1);
      const filteredStations = filterStationsWithCoordinates(countryStations);
      const limitirane = limitStations(filteredStations, 15);
      allStations = mergeStations(limitirane, allStations);
    }
    

    // Save the final list of stations to a file
    await saveStationsToFile(allStations);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Run the script
main();

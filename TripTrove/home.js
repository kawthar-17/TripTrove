
window.onload = function () {
    /* navbar sticky */
    window.onscroll = () => {
        let header = document.querySelector('.header');
        header.classList.toggle('sticky', window.scrollY > 100);
    };
}

/****  home page ****/
const submit = document.getElementById("submit");


/* getting the iata code for the flight api from full-airports.json */
function fetchAirportIata(city1, city2, callback) {
    fetch('./full-countries-airports.json')
    .then(response => response.json())
    .then(countriesAirports => {

       
        let city1Iata = countriesAirports[city1];
        let city2Iata = countriesAirports[city2];

        if (city1Iata && city2Iata) {
            console.log(`IATA code for ${city1}:`, city1Iata);
            console.log(`IATA code for ${city2}:`, city2Iata);
            callback(city1Iata, city2Iata);
        } else {
            console.log('One or both cities not found in the JSON data.');
        }
    })
.catch(error => console.error('Error loading json: ', error));

}

/* fetching weather */
let weatherApi = {
    weatherApiKey : "05251efef4264869a9c114841252402",

    fetchWeather : function(city2Iata, city2) {
        fetch(
            "http://api.weatherapi.com/v1/forecast.json?key=" +
            this.weatherApiKey +
            "&q=iata:" +
            city2Iata +
            "&days=5&aqi=no&alerts=no" ,           
        )
        .then((response) => {
            if (!response.ok) {
                alert("Error, one of the weather parameter is wrong.");
                throw new Error ("Error, one of the weather parameter is wrong."); //stop the execution of the current function
            }
            return response.json();
        })
        .then((data) => this.weatherDOM(data, city2))
        .catch(error => console.error('Error fetching weather data:', error));   
    },
    weatherDOM: function(data, city2) {
        const weatherContainer = document.getElementById('weatherContainer');
        const weatherHeading = document.getElementById('weather-heading');

        weatherHeading.innerHTML = `Weather in ${city2}`;
        weatherContainer.innerHTML = ''; // Clear previous results

        data.forecast.forecastday.forEach(day => {  // data.forecast.forecastday are objects in the api response
            const { date, day : { maxtemp_c , mintemp_c ,avgvis_miles , avghumidity , condition: {text , icon} } } = day;  //data extracted from api
            const weatherElement = document.createElement('div');
            weatherElement.className = 'weathe-element'

            weatherElement.innerHTML = `
                <p class="weather-info">${date}</p>
                <hr class="hr">
                <div class="weather-icon">
                <img src="${icon}" alt="${text}" />
                <p class="weather-info"><span> ${text}</span> </p>               
                </div>
                <p class="weather-info">${mintemp_c} °C / ${maxtemp_c} °C</p>  
                <div class="humidity-wind">           
                <p class="weather-info">${avgvis_miles} km/h <br> <span>wind speed</span></p>
                <p class="weather-info">${avghumidity} % <br><span>humidity</span></p>
                </div>
            `;
            weatherContainer.appendChild(weatherElement);
        });
    },
    
}

/* fetching the flight api */
let flightapi = {
    flightAPIKey: "67c6e1c4ba51f3cf85d83a34",
    fetchFlight : function(city1Iata, city2Iata, date1) {
        fetch(
            "https://api.flightapi.io/trackbyroute/" +
             this.flightAPIKey +
            "?date=" +
            date1 +
            "&airport1=" +
            city1Iata +
            "&airport2=" +
            city2Iata,
        )
        .then((response1) => {
            if (!response1.ok) {
                alert("Error, one of the parameter is wrong.");
                throw new Error ("Error, Couldn't find any flight");
            }
            return response1.json();
        })
        .then((data1) => this.flightDOM(data1))
        .catch(error => console.error('Error fetching flight data:', error));   
    },

    flightDOM: function(data1) {
        const flightsContainer = document.getElementById('flightsContainer');
        flightsContainer.innerHTML = ''; // Clear previous results

        data1.forEach(flight => {
            const { Airline, FlightNumber, DepartureTime, ArrivalTime } = flight;
            const flightElement = document.createElement('div');
            flightElement.className = 'flight-element'

            flightElement.innerHTML = `
                <p class="flight-info"> <span>Airline: </span>${Airline}</p>
                <hr class="hr">
                <p class="flight-info"><span>Flight Number: </span>${FlightNumber}</p>
                <p class="flight-info"><span>Departure Time: </span>${DepartureTime}</p>
                <p class="flight-info"><span>Arrival Time: </span>${ArrivalTime}</p>
            `;
            flightsContainer.appendChild(flightElement);
        });
    }
}

/* edit the date to fit the flight api requirement */
function formatDate(date) {
    return date.replace(/-/g, '');
}
/****  end home page ****/


/****  attraction page ****/

/* getting the longtitude and latitudefor for the api from long-lat.json */
function fetchLongLat(city2, callback) {
    console.log(`Fetching coordinates for: ${city2}`);
    fetch('./long-lat.json')
    .then(response => response.json())
    .then(countrieCoordinate => {
        console.log('JSON data parsed:', countrieCoordinate);
        let cityData = countrieCoordinate[city2];

        if (cityData) {
            let cityLongitude = cityData.longitude;
            let cityLatitude = cityData.latitude;

            console.log(`longitude for ${city2}:`, cityLongitude);
            console.log(`latitude for ${city2}:`, cityLatitude);
            if (callback) {
                callback(cityLongitude, cityLatitude);
            }
        } else {
            console.log('One or both cities not found in the JSON2 data.');
        }
    })
.catch(error => console.error('Error loading json2: ', error));

}


/**** end attraction page ****/


submit.addEventListener("click", function() {

    /* in home page */
    const city1 = document.getElementById("city1").value;
    const city2 = document.getElementById("city2").value;
    const date1 = formatDate(document.getElementById("date1").value);
    const date = document.getElementById("date1").value;
    /* in attraction page */
    fetchAirportIata(city1, city2, (city1Iata, city2Iata) => {
        weatherApi.fetchWeather(city2Iata, city2);
        flightapi.fetchFlight(city1Iata, city2Iata, date1);
    });

    // Save data to local storage
    localStorage.setItem("city1", city1);
    localStorage.setItem("city2", city2);
    localStorage.setItem("date", date);
    
    fetchLongLat(city2, (cityLongitude, cityLatitude) => {
        localStorage.setItem("cityLatitude", cityLatitude);
        localStorage.setItem("cityLongitude", cityLongitude);
        localStorage.setItem("city2", city2);
    });
    
});

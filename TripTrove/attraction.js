window.onload = function () {
    /* navbar sticky */
    window.onscroll = () => {
        let header = document.querySelector('.header');
        header.classList.toggle('sticky', window.scrollY > 100);
    };
    /*
    const cityLatitude = localStorage.getItem("cityLatitude");
    const cityLongitude = localStorage.getItem("cityLongitude");
    */
    const city2 = localStorage.getItem("city2");

    console.log(city2);
    

    if (city2) {
        fetchLongLat(city2, (cityLongitude, cityLatitude) => {
           
            hotelapi.fetchHotel(cityLatitude, cityLongitude);
            restoapi.fetchResto(cityLatitude, cityLongitude);
            placesapi.fetchPlace(cityLatitude, cityLongitude);
        });
    } else {
        console.error('City not found in local storage.');
    }
};

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

/*** hotel api  ***/
let hotelapi = {
    hotelAPIKey: "74fe98b79a904cc3a5d2ec1bcebc9183",
    fetchHotel : function(cityLatitude, cityLongitude) {
        fetch(
            "https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:" +
            cityLongitude +
            ","+
            cityLatitude +
            ",10000&limit=10&apiKey=" +
            this.hotelAPIKey,
        )
        .then((response) => {
            if (!response.ok) {
                alert("Error, no hotel found.");
                throw new Error ("Error, no hotel found.");
            }
            return response.json();
        })
        .then((data) => this.hoteltDOM(data))
        .catch(error => console.error('Error fetching hotel data:', error));   
    },

    hoteltDOM: function(data) {
        const hotelContainer = document.getElementById('hotels');
        hotelContainer.innerHTML = ''; // Clear previous results

        data.features.forEach(hotel => {
            const { properties } = hotel;
            const nameEng = properties?.datasource?.raw?.name  || 'N/A';
            const website = properties?.website || 'N/A';
            const phone = properties?.contact ? properties.contact.phone : 'N/A';
        
        
            const hotelElement = document.createElement('div');
            hotelElement.className = 'hotel-element'
            
            // Fetch the image and update the DOM
            
            hotelElement.innerHTML = `
            <div class=hotel-info>
                <h3 class="hotel-name">${nameEng}</h3>
                <div class="hotel-contact">
                    <p class="hotel-phone"><i class='bx bx-phone'></i>:${phone}</p>
                    <a href="${website}" target="_blank"><button class="hotel-btn">Check Website</button></a>
                    <button class="save-to-favorites"><i class='bx bx-heart'></i></button>
                </div>
            </div>
            
            `;
            hotelContainer.appendChild(hotelElement);
            this.fetchImage(properties, function(imageUrl) {
                if (imageUrl) {
                    const imgElement1 = document.createElement('img');
                    imgElement1.src = imageUrl;
                    imgElement1.alt = nameEng;
                    imgElement1.className = 'hotal-img';
                    hotelElement.appendChild(imgElement1);
                }

                const saveButton = hotelElement.querySelector('.save-to-favorites');
                saveButton.addEventListener('click', () => {
                    const hotelData = {
                        Name: nameEng,
                        Phone: phone,
                        Website: website,
                        Image: imageUrl || 'N/A', // Save the image URL or 'N/A' if no image is found
                        favId: generateID(),
                    };
                    
                    // Retrieve current favorites from localStorage
                    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                    favorites.push(hotelData);

                    // Save updated favorites back to localStorage
                    localStorage.setItem('favorites', JSON.stringify(favorites));

                    alert('Hotel saved to favorites!');

                });
            });
    
        });
        
    },
    
fetchImage: function(properties, callback){
    const hotalName = properties?.datasource?.raw?.name || 'N/A';
   
    const imageApiKey = "yhW1WAtrQcQ1pa_N0y_UYFlEL9Sfc6qp1Uo55lZhv7Q";
    fetch(
        "https://api.unsplash.com/search/photos?query="
        + hotalName
        + "&client_id="
        + imageApiKey
      )
    .then((response) => {
        if (!response.ok) {
            alert("No image found.");
            throw new Error("No image found.");
        }
            return response.json();
        })
        .then((data) => {
            if (data.results && data.results.length > 0) {
                const imageUrl = data.results[0]?.urls?.regular || null;
                callback(imageUrl);
            }else {
                console.error('No image results found for:', restoName);
                callback(null); // No image found, return null
            }
        })
        .catch(error => console.error('Error fetching image data:', error));
    }
};

       
/*** restaurant api ***/
let restoapi = {
    restoAPIKey: "74fe98b79a904cc3a5d2ec1bcebc9183",
    fetchResto : function(cityLatitude, cityLongitude) {
        fetch(
            "https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:" +
            cityLongitude +
            ","+
            cityLatitude +
            ",10000&limit=10&apiKey=" +
            this.restoAPIKey,
        )
        .then((response) => {
            if (!response.ok) {
                throw new Error ("Error, no restaurant found.");
            }
            return response.json();
        })
        .then((data) => this.restoDOM(data))
        .catch(error => console.error('Error fetching restaurant data:', error));   
    },

    restoDOM: function(data) {
        const restoContainer = document.getElementById('Restaurant');
        restoContainer.innerHTML = ''; // Clear previous results

        data.features.forEach(resto => {
            const { properties } = resto;
            const restoName = properties?.datasource?.raw?.name || 'N/A';
            const restoWebsite = properties?.datasource?.raw?.website || 'N/A';
            const restoPhone = properties?.contact ? properties.contact.phone : 'N/A';
            let restoCuisine = properties?.datasource?.raw?.cuisine || 'N/A';
        
            // Format the cuisine type
        if (restoCuisine !== 'N/A') {
            restoCuisine = restoCuisine.split(';').join(' ');
        }   

            const restoElement = document.createElement('div');
            restoElement.className = 'resto-element'

            restoElement.innerHTML = `
            <div class="resto-info">
                <h3 class="resto-name">${restoName}</h3>
                <div class="resto-contact">
                <p class="resto-phone"><i class='bx bx-phone'></i>: ${restoPhone}</p>
                <p class="resto-cuisine"><span>Cuisine type: </span>${restoCuisine}</p>
                </div>
                <a href="${restoWebsite}" target="_blank"><button class="resto-btn">Check Website</button></a>
                <button class="save-to-favorites"><i class='bx bx-heart'></i></button>
            </div>
            `;
            restoContainer.appendChild(restoElement);

            // Fetch the image and update the DOM
            this.fetchImage(properties, function(imageUrl) {
                if (imageUrl) {
                    const imgElement2 = document.createElement('img');
                    imgElement2.src = imageUrl;
                    imgElement2.alt = restoName;
                    imgElement2.className = 'resto-img';
                    restoElement.appendChild(imgElement2);
                }
                //save option
                const saveButton = restoElement.querySelector('.save-to-favorites');
                saveButton.addEventListener('click', () => {
                    const restoData = {
                        Name: restoName,
                        Phone: restoPhone,
                        Website: restoWebsite,
                        Image: imageUrl || 'N/A', // Save the image URL or 'N/A' if no image is found
                        favId: generateID(),
                    };
                    
                    // Retrieve current favorites from localStorage
                    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                    favorites.push(restoData);

                    // Save updated favorites back to localStorage
                    localStorage.setItem('favorites', JSON.stringify(favorites));

                    alert('Restaurant saved to favorites!');

                });
            });
    
        });
        
    },
    
fetchImage: function(properties, callback){
    const restoName = properties?.datasource?.raw?.name || 'N/A'; 
    const imageApiKey = "yhW1WAtrQcQ1pa_N0y_UYFlEL9Sfc6qp1Uo55lZhv7Q";

    fetch(
        "https://api.unsplash.com/search/photos?query="
        + restoName
        + "&client_id="
        + imageApiKey
      )
    .then((response) => {
        if (!response.ok) {
            alert("No image found.");
            throw new Error("No image found.");
        }
            return response.json();
        })
        .then((data) => {
            if (data.results && data.results.length > 0) {
                const imageUrl = data.results[0]?.urls?.regular || null;
                callback(imageUrl);
            }else {
                console.error('No image results found for:', restoName);
                callback(null); // No image found, return null
            }
        })
        .catch(error => console.error('Error fetching image data:', error));
    
    }
};


/*** landmark api ***/
let placesapi = {
    placesAPIKey: "74fe98b79a904cc3a5d2ec1bcebc9183",
    fetchPlace : function(cityLatitude, cityLongitude) {
        const url =
            "https://api.geoapify.com/v2/places?categories=entertainment&filter=circle:" +
            cityLongitude +
            ","+
            cityLatitude +
            ",10000&limit=20&apiKey=" +
            this.placesAPIKey;

            console.log("Request URL:", url); 
        fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error ("Error, no place found.");
            }
            return response.json();
        })
        .then((data) => this.placeDOM(data))
        .catch(error => console.error('Error fetching place data:', error));   
    },

    placeDOM: function(data) {
        const placeContainer = document.getElementById('places-of-intrest');
        placeContainer.innerHTML = ''; // Clear previous results

        data.features.forEach(place => {
            const { properties } = place;
            const PlaceName = properties?.datasource?.raw?.name || 'N/A';
            const PlaceWebsite = properties?.website || 'N/A';
            const placePhone = properties?.contact ? properties.contact.phone : 'N/A';
            const placeTourism = properties?.datasource?.raw?.tourism || 'N/A';

            const placeElement = document.createElement('div');
            placeElement.className = 'place-element'

            placeElement.innerHTML = `
            <div class="place-info">
                <p class="place-name">${PlaceName}</p>
                <div class="place-contact">
                    <p class="place-type">It's a ${placeTourism}</p>
                    <p class="place-phone"><i class='bx bx-phone'></i>: ${placePhone}</p>
                </div>
                <a href="${PlaceWebsite}" target="_blank"><button class="place-btn">Check Website</button></a>
                <button class="save-to-favorites"><i class='bx bx-heart'></i></button>
            </div> 
            `;
            placeContainer.appendChild(placeElement);

            // Fetch the image and update the DOM
            this.fetchImage(properties, function(imageUrl) {
            if (imageUrl) {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = PlaceName;
                imgElement.className = 'place-img';
                placeElement.appendChild(imgElement);
            }

            //save option
            const saveButton = placeElement.querySelector('.save-to-favorites');
                saveButton.addEventListener('click', () => {
                    const placeData = {
                        Name: PlaceName,
                        Phone: placePhone,
                        Website: PlaceWebsite,
                        Image: imageUrl || 'N/A', // Save the image URL or 'N/A' if no image is found
                        favId: generateID(),
                    };
                    
                    // Retrieve current favorites from localStorage
                    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                    favorites.push(placeData);

                    // Save updated favorites back to localStorage
                    localStorage.setItem('favorites', JSON.stringify(favorites));

                    alert('Place saved to favorites!');

                });
        });
    
    });
    
},
    

fetchImage: function(properties, callback){
    const PlaceName = properties?.datasource?.raw?.name || 'N/A';
    const placeTourism = properties?.datasource?.raw?.tourism || 'N/A';
   
    const imageApiKey = "yhW1WAtrQcQ1pa_N0y_UYFlEL9Sfc6qp1Uo55lZhv7Q";
    fetch(
        "https://api.unsplash.com/search/photos?query="
        + PlaceName
        + placeTourism
        +"&client_id="
        + imageApiKey
      )
    .then((response) => {
        if (!response.ok) {
            throw new Error("No image found.");
        }
            return response.json();
        })
        .then((data) => {
            if (data.results && data.results.length > 0) {
                const imageUrl = data.results[0]?.urls?.regular || null;
                callback(imageUrl);
            }else {
                console.error('No image results found for:', restoName);
                callback(null); // No image found, return null
            }
        })
        .catch(error => console.error('Error fetching image data:', error));
    }
};


// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
  }
  
/**** end attraction page ****/
window.onload = function () {
    /* navbar sticky */
    window.onscroll = () => {
        let header = document.querySelector('.header');
        header.classList.toggle('sticky', window.scrollY > 100);
    };
    

};


//from html

const form = document.getElementById("form");
const UserName = document.getElementById("login-name");
const email = document.getElementById("login-email");
const pass = document.getElementById("login-password");
const favList = document.getElementById("fav-list");


//get saved items from local storage
let Name = localStorage.getItem("Name");
let Phone = localStorage.getItem("Phone");
let Website = localStorage.getItem("Website");
let favId = localStorage.getItem("favId");

const localStorageFav = JSON.parse(localStorage.getItem("favorites")) || [];
let favorites = localStorageFav;

// Add history + fav
function addToHistory(e) {
  e.preventDefault();

  if (UserName.value.trim() === "" || email.value.trim() === "" || pass.value.trim() === "") {
    alert("Please fill all the information");
   
    const favorite = {
      favId: favId,
      Name: Name,
      Phone: Phone,
      Website: Website,
    }

      //history.push(search);
      favorites.push(favorite);

      updateLocalStorage();

    //addHistoryDOM(search);
    addFavDOM(favorite);
    

    UserName.value = "";
    email.value = "";
    pass.value = "";
  }
}

// Generate random ID
/*function generateID() {
  return Math.floor(Math.random() * 100000000);
}
*/
//favorite saved
function addFavDOM(favorite){
    const Element = document.createElement("li");
    Element.className = 'fav-container';
    Element.innerHTML = `
    <div class="fav-info">
      <h3 class="fav-name">${favorite.Name}</h3>
      <p class="fav-phone"><i class='bx bx-phone'></i>:${favorite.Phone}</p>
      <a href="${favorite.Website}" target="_blank"><button class="fav-btn">Check Website</button></a>
       <button class="delete-btn" onclick="removeFav(${favorite.favId})"><i class='bx bxs-trash'></i></button>
       </li>         
    `;
    favList.appendChild(Element);

}


        
function removeFav(favId) {
  favorites = favorites.filter((favorite) => favorite.favId !== favId);
 updateLocalStorage();
 start();
}
// Update local storage 
function updateLocalStorage() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Start page
function start() {
  favList.innerHTML = "";
  favorites.forEach(addFavDOM);
}

start();

form.addEventListener("submit", addToHistory);
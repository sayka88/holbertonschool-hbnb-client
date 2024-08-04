document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  populateCountryFilter();
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        const response = await loginUser(email, password);
        if (response.ok) {
          const data = await response.json();
          document.cookie = `token=${data.access_token}; path=/`;
          window.location.href = "index.html";
        } else {
          alert("Login failed: " + response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Login failed: An unexpected error occurred.");
      }
    });
  }

  if (window.location.pathname.includes("index.html")) {
    fetchPlaces(getCookie("token"));
  }
});

async function populateCountryFilter() {
  try {
    const response = await fetch("http://127.0.0.1:5000/countries");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const countries = await response.json();

    const countryFilter = document.getElementById("country-filter");
    if (countryFilter) {
      const allOption = document.createElement("option");
      allOption.value = "All";
      allOption.textContent = "All";

      countryFilter.appendChild(allOption);

      countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.name;
        option.textContent = country.name;
        countryFilter.appendChild(option);
      });

      countryFilter.addEventListener("change", (event) => {
        const selectedCountry = event.target.value;
        filterPlacesByCountry(selectedCountry);
      });
    }
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
}

function checkAuthentication() {
  const token = getCookie("token");
  const loginLink = document.getElementById("login-link");

  if (!token && loginLink) {
    loginLink.style.display = "block";
  } else {
    if (loginLink) {
      loginLink.style.display = "none";
    }
    fetchPlaces(token);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function fetchPlaces(token) {
  try {
    const response = await fetch("http://127.0.0.1:5000/places", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const places = await response.json();
    displayPlaces(places);
  } catch (error) {
    console.error("Fetch error: ", error);
  }
}

function displayPlaces(places) {
  const placesContainer = document.getElementById("places-list");
  placesContainer.innerHTML = "";

  places.forEach((place) => {
    const placeDiv = document.createElement("div");
    placeDiv.dataset.country = place.country_name;
    placeDiv.className = "place-card";
    placeDiv.innerHTML = `
          <h2>${place.host_name}</h2>
          <p>Price per night: $${place.price_per_night}</p>
          <p>Location: ${place.city_name}, ${place.country_name}</p>
          <button class="details-button" data-id="${place.id}">View Details</button>
      `;
    placesContainer.appendChild(placeDiv);
  });
  document.querySelectorAll(".details-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const placeId = event.target.dataset.id;
      window.location.href = `place.html?id=${placeId}`;
    });
  });
}

function filterPlacesByCountry(selectedCountry) {
  const places = document.querySelectorAll(".place-card");

  places.forEach((place) => {
    const placeCountry = place.dataset.country;
    if (selectedCountry === "All" || placeCountry === selectedCountry) {
      place.style.display = "block";
    } else {
      place.style.display = "none";
    }
  });
}

async function loginUser(email, password) {
  const response = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response;
}


function getPlaceIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function fetchPlaceDetails(token, placeId) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const place = await response.json();
    console.log(place);
    displayPlaceDetails(place);
    displayReviews(place.reviews);
    checkAuthentication();
  } catch (error) {
    console.error("Fetch error: ", error);
  }
}

function displayPlaceDetails(place) {
  const placeDetailsSection = document.getElementById("place-details");
  placeDetailsSection.innerHTML = `
      <h1>${place.host_name}</h1>
      <div class="place-detail">
      <p><strong>Host: </strong>${place.host_name}</p>
       <p><strong>Price per night:</strong> $${place.price_per_night}</p>
       <p><strong>Location:</strong> ${place.city_name}, ${
    place.country_name
  }</p>
      <p><strong>Description:</strong> ${place.description}</p>
     
     <p><strong>Amenities:</strong> ${place.amenities.map(
       (amenity) => amenity
     )}</p>
      </div>
     
    `;
}

function displayReviews(reviews) {
  const reviewsSection = document.getElementById("reviews");

  if (reviews.length === 0) {
    reviewsSection.innerHTML = "<p>No reviews yet.</p>";
    return;
  } else {
    reviewsSection.innerHTML = "<h1>Reviews</h1>";
  }

  const reviewsHTML = reviews
    .map((review) => {
      const fullStars = "⭐".repeat(review.rating);
      const emptyStars = "☆".repeat(5 - review.rating);

      return `
          <div class="review">
            <h4>${review.user_name}:</h4>
            <p>${review.comment}</p>
            <p>Rating: ${fullStars}${emptyStars}</p>
          </div>
        `;
    })
    .join("");

  reviewsSection.innerHTML += reviewsHTML;
}

function checkAuthentication() {
  const token = getCookie("token");
  const addReviewSection = document.getElementById("add-review");

  if (addReviewSection) {
    addReviewSection.style.display = token ? "block" : "none";
  }
}


document.addEventListener("DOMContentLoaded", () => {
    const token = getCookie("token");
    const placeId = getPlaceIdFromURL();
  
    if (placeId) {
      fetchPlaceDetails(token, placeId);
    }
  
    const reviewForm = document.getElementById("review-form");
    if (reviewForm) {
      reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!token) {
          alert("You must be logged in to submit a review.");
          return;
        }
  
        const reviewText = document.getElementById("review-text").value;
        const rating = parseInt(document.getElementById("rating_review").value, 10); 
  
        try {
          const response = await addReview(token, placeId, reviewText, rating); 
          if (response.ok) {
            alert("Review submitted successfully.");
            reviewForm.reset();
            fetchPlaceDetails(token, placeId);
          } else {
            alert("Failed to submit review: " + response.statusText);
          }
        } catch (error) {
          console.error("Error submitting review:", error);
          alert("An unexpected error occurred.");
        }
      });
    }
  });
  
  async function addReview(token, placeId, reviewText, rating) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/places/${placeId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            review: reviewText,
            rating: rating, 
          }),
        }
      );
      return response;
    } catch (error) {
      console.error("Error adding review:", error);
    }
  }
  
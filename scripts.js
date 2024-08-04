const places = [
    {
        name: "Beautiful Beach House",
        price: 150,
        location: "Los Angeles, United States",
    },
    {
        name: "Cozy Cabin",
        price: 100,
        location: "Toronto, Canada",
    },
    {
        name: "Modern Apartment",
        price: 200,
        location: "New York, United States",
    }
];

// Пример заполнения фильтра стран (это можно сделать динамически из API)
const countries = ["All", "United States", "Canada"];
const countryFilter = document.getElementById('country-filter');
countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.toLowerCase();
    option.textContent = country;
    countryFilter.appendChild(option);
});

// Примерный скрипт для управления отображением формы или кнопки
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = checkIfAuthenticated(); // Ваша функция проверки аутентификации
    const addReviewSection = document.querySelector('.reviews');

    if (isAuthenticated) {
        const reviewForm = `
            <form action="submit_review" method="post" class="add-review form">
                <label for="review">Review:</label>
                <textarea id="review" name="review" required></textarea>
                <label for="rating">Rating:</label>
                <input type="number" id="rating" name="rating" min="1" max="5" required>
                <button type="submit">Submit Review</button>
            </form>`;
        addReviewSection.insertAdjacentHTML('beforeend', reviewForm);
    } else {
        const addButton = `<a href="add_review.html" class="add-review">Add Review</a>`;
        addReviewSection.insertAdjacentHTML('beforeend', addButton);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            await loginUser(email, password);
        });
    }
});

async function loginUser(email, password) {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            window.location.href = 'index.html';
        } else {
            alert('Login failed: ' + response.statusText);
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}


const mealsEl = document.getElementById("meals");
const FavouriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById('meal-info')
const popupCloseBtn = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    
    addMeal(randomMeal, true);
}

async function getMealbyId(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id);
    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;

}

async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    const respData = await resp.json();
    const meals = respData.meals;

    return meals;

}

function addMeal(mealData, random = false) {
    
    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `
            <span class="random">
                Special for You
            </span> ` : '' }
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        </div>
        <div class="meal-body">
            <h4 class="meal-header">${mealData.strMeal}</h4>
            <button class = "fav-btn">
            <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");
    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal)
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal)
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    const showMealInfoHandler = meal.querySelectorAll(".meal-header")

    showMealInfoHandler.forEach(item => {
        item.addEventListener('click', () => {
        showMealInfo(mealData)
        })  
    })

    mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    // clean the container before adding favourite meals
    FavouriteContainer.innerHTML = "";

    const mealIds = getMealsLS();

    const meals = [];

    for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealbyId(mealId);
        
        addMealFav(meal);

    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
    <img class="meal-header" src=${mealData.strMealThumb}
    alt=${mealData.strMeal}>
    <span class="meal-header">${mealData.strMeal}</span>
    <button class = "clear">
    <i class="fa-solid fa-circle-xmark"></i>
    </button>
    `
    const btn = favMeal.querySelector(".clear");
    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);
        const favBtn = document.querySelector(".meal-body .fav-btn")
        favBtn.classList.remove("active")

        fetchFavMeals();
    })

    const showMealInfoHandler = favMeal.querySelectorAll(".meal-header")

    showMealInfoHandler.forEach(item => {
        item.addEventListener('click', () => {
        showMealInfo(mealData)
        })
    })

    FavouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    //clean it up

    mealInfoEl.innerHTML = '';
    //update meal info 
    const mealEl = document.createElement('div')

    const ingredients = []
    //get the ingredients
    for ( let i = 1; i<=20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} - 
            ${mealData['strMeasure'+i]}`)
        }else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        <p>
            ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        `

    mealInfoEl.appendChild(mealEl)

    //show the popup
    mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener("click", async () => {
    
    mealsEl.innerHTML = "";
    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);

    if(meals) {

        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener('click', () => {

    mealPopup.classList.add('hidden');
});

const sections = document.querySelectorAll(".section")
const sectBtns = document.querySelector(".controls")
const sectBtn = document.querySelectorAll(".control")
const allSections = document.querySelector(".main-content")

const mealsEl = document.getElementById("meals")
const favouriteContainer = document.querySelector(".fav--meals--cont")
const searchTerm = document.getElementById("search-term")
const searchBtn = document.getElementById("search")
const errorCont = document.querySelector(".errorCont")
const searchedScreen = document.querySelector(".searchedItem-cont")
const mealPopup = document.getElementById("meal-popup")
const mealInfoEl = document.getElementById('meal-info')
const popupCloseBtn = document.getElementById("close-popup")
const navToggle = document.querySelector(".nav-toggle")


/* ---------------------------------nav-toggle-------------------------------------- */
navToggle.addEventListener('click', function() {
    sectBtns.classList.toggle("show--controls");
})

/* ---------------------------------screen toggle----------------------------------- */
function pageTransitions() {
    for(let i = 0; i < sectBtn.length; i++) {
        sectBtn[i].addEventListener('click', function() {
            let currentBtn = document.querySelectorAll(".active-btn");
            currentBtn[0].className  = currentBtn[0].className.replace("active-btn", "")
            this.className += ' active-btn';
        })
    }

    allSections.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (id) {
            sectBtn.forEach((btn) => {
                btn.classList.remove('active')
            })
            e.target.classList.add('active')

            sections.forEach((section) => {
                section.classList.remove('active')
            })

            const element = document.getElementById(id);
            element.classList.add('active');
        }
    });
}

pageTransitions();

/* ---------------------------------- data logic---------------------------------- */
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
            <h4 class="meal-name">${mealData.strMeal}</h4>
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
    // clean the container
    favouriteContainer.innerHTML = "";

    const mealIds = getMealsLS();

    const meals = [];

    for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealbyId(mealId);
        
        addMealFav(meal);

    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement("div")
    favMeal.classList.add("meal")

    favMeal.innerHTML = `
        <div class="meal-header">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}"/>
        </div>
        <div class="meal-body">
            <h4 class="meal-name">${meal.strMeal}</h4>
        </div>
        <button class = "clear">
            <i class="fa-solid fa-circle-xmark"></i>
        </button>
    `
    const btn = favMeal.querySelector(".clear");
    btn.addEventListener("click", (e) => {
        removeMealLS(mealData.idMeal);
        console.log(e)
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

    favouriteContainer.appendChild(favMeal);
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
    
    searchedScreen.innerHTML = "";
    const mealName = searchTerm.value;

    const meals = await getMealsBySearch(mealName);

    if(meals) {

        meals.forEach((meal) => {
           const searchedMeal = document.createElement("div")
           searchedMeal.classList.add("meal")
           
           searchedMeal.innerHTML = `
                <div class="meal-header">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}"/>
                </div>
                <div class="meal-body">
                    <h4 class="meal-name">${meal.strMeal}</h4>
                    <button class = "fav-btn">
                    <i class="fas fa-heart"></i>
                    </button>
                </div>
            `

            searchedScreen.appendChild(searchedMeal)

            const btn = searchedMeal.querySelector(".meal-body .fav-btn");
            btn.addEventListener("click", () => {
                if (btn.classList.contains("active")) {
                    removeMealLS(meal.idMeal)
                    btn.classList.remove("active");
                } else {
                    addMealLS(meal.idMeal)
                    btn.classList.add("active");
                }

                fetchFavMeals();
            });
        });
    } else {

        errorCont.innerHTML  = ``

        const noMealsCont = document.createElement("div")
        noMealsCont.classList.add("noMealsCont")

        noMealsCont.innerHTML = `
            <h1>No recipes found, please try something else! </h1>
        `

        errorCont.append(noMealsCont)
    }
});

popupCloseBtn.addEventListener('click', () => {

    mealPopup.classList.add('hidden');
});
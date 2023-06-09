import './css/styles.css';
import debounce from "lodash.debounce";
import Notiflix from "notiflix";
import {fetchCountries} from "./js/fetchCountries";

const DEBOUNCE_DELAY = 300;
let searchWord = "";

const searchBox = document.querySelector("#search-box");              // Посилання на input з id="search-box", та його стилізація
searchBox.style.fontWeight = "bold";

const countryList = document.querySelector(".country-list");          // Посилання на список country-list, та його стилізація
countryList.style.listStyle = "none";
countryList.style.display = "flex";
countryList.style.flexDirection = "column";
countryList.style.rowGap = "10px";

const countryInfo = document.querySelector(".country-info");          // Посилання на div-контейнер з класом country-info, та його стилізація

searchBox.addEventListener("keyup", debounce(searchCountries, DEBOUNCE_DELAY));  // Вішаємо слухач на searchBox, пошук (функція searchCountries) буде робитися кожні 300 мілісекунд



//Опис функцій =================================================================================================================================================

//1.Функція searchCountries - бере слово searchWord, яке ввели в input (searchBox), видаляє зайві пробіли, і передає його в функцію fetchCountries, 
//Обробляє проміс, що повертається з функції fetchCountries та видає повідомлення з помилкою, якщо пошук не успішний. 
//Якщо пошук успішний і fetchCountries повернула масив країн, то обробляємо отриманий масив функцією 
//filterCommonName(функція поверне масив тільки тих країн, у яких загальна назва (name.common) містить слово searchWord, відсортований за алфавітом по полю name.common)
function searchCountries(){

    if (searchBox.value.trim().toLowerCase() === searchWord){
        return;
    }
    
    searchWord = searchBox.value.trim().toLowerCase();  //отримуємо слово з input та форматуємо його (забираємо зайві пробіли та приводимо до нижнього регістру)
    countryList.innerHTML = "";                               //Очищаємо розмітку списку країн
    countryInfo.innerHTML = "";                               //Очищаємо розмітку даних країни

    if (searchWord){                                          //якщо слово не пусте, то робимо html-запит    
        fetchCountries(searchWord)
        .then((response) => response)
        .then((countriesJson) => renderCountries(countriesJson.sort((country1,country2) => country1.name.official.localeCompare(country2.name.official)))) //renderCountries(filterOfficialName(countriesJson, searchWord)))
        .catch((error) => {
            if (error.message === '404') { 
                Notiflix.Notify.failure("Oops, there is no country with that name");
            } 
            console.log(error.message);
        })
    }
}


//3.Функція renderCountries - приймає масив об'єкnів-країн. Кожен об'єкт має поля {name,flags,capital,population,languages}.
//Функцыя створює html-розмітку: якщо країна одна, то видається інформація по всім полям, якщо країн декілька, 
//то видається тільки список країн з картинкою флага і назвою.
//Якщо країн більше 10, то видається повідомлення "Too many matches found. Please enter a more specific name.".
function renderCountries(countries){
    let murkup = "";

    if (!countries.length){
        Notiflix.Notify.failure("Oops, there is no country with that name");
        return;
    }

    // Якщо країн більше 10
    if (countries.length > 10) {
        Notiflix.Notify.info("Too many matches found. Please enter a more specific name.");   
        return;
    }

    // Якщо країна одна
    if (countries.length === 1) {
        murkup = countries.map(({name:{official},flags:{alt, svg},capital,population,languages}) => {
            return `<p class="country-and-flag" style="font-weight: bold; font-size: 30px; height: 40px; display:flex; column-gap: 10px">
                        <span class="flag" style="height: 100%;">
                            <img 
                                class="flag-svg"
                                src=${svg}
                                alt="${alt}"
                                height=100%
                            >
                        </span>
                        ${official}
                    </p>
                    <p class="capital"><span class="field" style="font-weight: bold">Capital: </span>${capital}</p>
                    <p class="population"><span class="field" style="font-weight: bold">Population: </span>${population}</p>
                    <p class="lanquages"><span class="field" style="font-weight: bold">Languages: </span>${Object.values(languages).join(", ")}</p>
                    `;
        }).join("");

        countryInfo.innerHTML = murkup;
        return;
    }

    // Якщо країн від 2 до 10 включно
    if (countries.length <= 10) {
    murkup = countries.map(({name:{official},flags:{alt, svg}}) => {
        return `<li class="country-list-item" style="font-size: 16px; height: 30px; display:flex; align-items: center; column-gap: 10px">
                    <img 
                        class="flag-svg"
                        src=${svg}
                        alt="${alt}"
                        width= 30px
                    >
                    ${official}
                </li>`;
        }).join("");
        countryList.innerHTML = murkup;
        return;
    }    
 }




 
 //4.Функція sortOfficialName - сортує масив об'єктів-країн за алфавітом по полю name.official та повертає його як результат.
 //function sortOfficialName(countries, searchWord){
 //    return  countries.sort((country1,country2) => country1.name.official.localeCompare(country2.name.official))
 // }


 //5.Функція filterOfficialName - вибирає з масиву об'єктів countries тільки ті, 
 //в яких загальна назва країни (name.common) містить слово searchWord. 
 //Функція сортує отриманий масив за алфавітом по полю name.common та повертає його як результат.
 // function filterOfficialName(countries, searchWord){
 //    return  countries
 //       .filter(({name:{official}}) => official.toLowerCase().includes(searchWord))
 //       .sort((country1,country2) => country1.name.official.localeCompare(country2.name.official))
 // }

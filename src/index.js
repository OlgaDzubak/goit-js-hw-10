import './css/styles.css';
import debounce from "lodash.debounce";
import Notiflix from "notiflix";
import {fetchCountries} from "./js/fetchCountries";

const DEBOUNCE_DELAY = 300;

const searchBox = document.querySelector("#search-box");              // Посилання на input з id="search-box", та його стилізація
searchBox.style.fontWeight = "bold";

const countryList = document.querySelector(".country-list");          // Посилання на список country-list, та його стилізація
countryList.style.listStyle = "none";
countryList.style.display = "flex";
countryList.style.flexDirection = "column";
countryList.style.rowGap = "20px";

const countryInfo = document.querySelector(".country-info");          // Посилання на div-контейнер з класом country-info, та його стилізація

searchBox.addEventListener("keyup", debounce(searchCountries, 300));  // Вішаємо слухач на searchBox, пошук (функція searchCountries) буде робитися кожні 300 мілісекунд



//Опис функцій =================================================================================================================================================

//1.Функція searchCountries - бере слово searchWord, яке ввели в input (searchBox), видаляє зайві пробіли, і передає його в функцію fetchCountries, 
//Обробляє проміс, що повертається з функції fetchCountries та видає повідомлення з помилкою, якщо пошук не успішний. 
//Якщо пошук успішний і fetchCountries повернула масив країн, то обробляємо отриманий масив функцією 
//filterCommonName(функція поверне масив тільки тих країн, у яких загальна назва (name.common) містить слово searchWord, відсортований за алфавітом по полю name.common)
function searchCountries(){

    const searchWord = searchBox.value.trim().toLowerCase();  //отримуємо слово з input та форматуємо його (забираємо зайві пробіли та приводимо до нижнього регістру)
    countryList.innerHTML = "";                               //Очищаємо розмітку списку країн
    countryInfo.innerHTML = "";                               //Очищаємо розмітку даних країни

    if (searchWord){                                          //якщо слово не пусте, то робимо html-запит    
        fetchCountries(searchWord)
        .then((response) => response)
        .then((countriesJson) => renderCountries(filterCommonName(countriesJson, searchWord)))
        .catch((error) => {
            if (error == "Error: 404") {
                Notiflix.Notify.failure("Oops, there is no country with that name");
            } else {
                Notiflix.Notify.failure(error);
            }
        })
    }
}


//3.Функція renderCountries - приймає масив об'єкnів-країн. Кожен об'єкт має поля {name,flags,capital,population,languages}.
//Функцыя створює html-розмітку: якщо країна одна, то видається інформація по всім полям, якщо країн декілька, 
//то видається тільки список країн з картинкою флага і назвою.
//Якщо країн більше 10, то видається повідомлення "Too many matches found. Please enter a more specific name.".
function renderCountries(countries){
    let murkup = "";

    if (!countries){
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
        murkup = countries.map(({name:{common},flags:{alt, svg},capital,population,languages}) => {
            return `<p class="country-and-flag" style="font-weight: bold; font-size: 30px; height: 40px; display:flex; column-gap: 10px">
                        <span class="flag" style="height: 100%;">
                            <img 
                                class="flag-svg"
                                src=${svg}
                                alt="${alt}"
                                height=100%
                            >
                        </span>
                        ${common}
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
    murkup = countries.map(({name:{common},flags:{alt, svg}}) => {
        return `<li class="country-list-item">
                    <img 
                        class="flag-svg"
                        src=${svg}
                        alt="${alt}"
                        width="30px"
                    >
                    ${common}
                </li>`;
        }).join("");
        //console.log(murkup);
        countryList.innerHTML = murkup;
        return;
    }    
 }


 //4.Функція filterCommonName - вибирає з масиву об'єктів countries тільки ті, 
 //в яких загальна назва країни (name.common) містить слово searchWord. 
 //Функція сортує отриманий масив за алфавітом по полю name.common та повертає його як результат.
  function filterCommonName(countries, searchWord){
    return  countries
       .filter(({name:{common}}) => common.toLowerCase().includes(searchWord))
       .sort((country1,country2) => country1.name.common.localeCompare(country2.name.common))
 }

//Функція fetchCountries - приймає пошукове слово searchWord, підставляє його в рядок html-запиту русурсу https://restcountries.com, 
//визиває функцію fetch з цим запитом, та обровбляє ситуацію коли по запросу нічого не знайдено. Вертає проміс.
export function fetchCountries(searchWord) {
    return fetch(`https://restcountries.com/v3.1/name/${searchWord}?fields=name,capital,population,flags,languages`)
            .then((response) => {
                if (!response.ok) { 
                    throw new Error(response.status);
                }
                return(response.json());
            })
}

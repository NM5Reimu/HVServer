const express = require('express');
const cors = require('cors');
let requireDate = require('./src/bd/animeLib.json');
const fs = require('fs');
const { Console } = require('console');
requireDate = require('./src/bd/tempLib.json');

const app = express();
const port = 3000;

app.use(cors());

app.listen(port, () => {
  console.log('Server has been started');
});

// * Сортировка тайтлов. 
// TODO Можно сделать реверс для каждой сортировки
function byField(field) {
  switch (field) {
    case 'name':
      return (a, b) => (a[field] > b[field] ? 1 : -1);
    case 'rating':
      return (a, b) => (a[field] < b[field] ? 1 : -1);
  }
}

// * Так было раньше. 
// app.get('/getSearched/:value', (req, res) => {
//   let parse = JSON.parse(req.params.value);
//   ...
//   res.send(resultArray);
// });

// * Получение тайтла по его ID
app.get('/getTitleById/:id', (req, res) => {
  res.send(requireDate[req.params.id]);
  console.log(`Sent title: ${requireDate[req.params.id].name}`);
});

// * Получение всех тайтлов из базы данных
// TODO По хорошему нужно избавиться от этого запроса
app.get('/getAllTitles', (req, res) => {
  res.send(requireDate);
});

// * Установка значения рейтинга для тайтла по его ID
app.get('/setRatingById/:value', (req, res) => {
  let parsed = JSON.parse(req.params.value);
  // console.log(`Request [set rating]: ${parsed}`);

  for (const title of requireDate) {
    if (parsed.id === title.id) {
      title.rating = parsed.rating;

      fs.writeFile('./src/bd/tempLib.json', JSON.stringify(requireDate), (err) => {
        console.log(err || `[${title.name}] rating is set to [${parsed.rating}/5]`);
      });
      requireDate = require('./src/bd/tempLib.json');
      res.send(title);
    }
  }
});

// * Установка значения избранного для тайтла по его ID
app.get('/setFavoriteById/:value', (req, res) => {
  let parsed = JSON.parse(req.params.value);
  for (const title of requireDate) {
    if (parsed.id === title.id) {
      title.favorites = parsed.favorites;

      fs.writeFileSync('./src/bd/tempLib.json', JSON.stringify(requireDate), (err) => {
        console.log(err || `[${title.name}] favorites is set to [${parsed.favorites}]`);
      });
      requireDate = require('./src/bd/tempLib.json');
      res.send(title);
      console.log(`[${title.name}] favorite is set to [${parsed.favorites}]`);
    }
  }
});

//___________________________________________

// * Получение тайтлов по запросу
app.get('/getSearched', (req, res) => {
  const { search, tags, favorites, sortBy } = req.query;

  // * Ничего умнее для преобразования строки в булин по ее значению я не придумал. Не бейте.
  const convertStringToBoolean = (str) => str === 'false' ? false : true;

  // * Функция проверяет есть ли все заданные пользователем теги в проверяемом тайтле
  const searchAllTags = (titleTags, searchTags) => {
    let ans = true;

    if (searchTags) {
      searchTags.map((item) => (ans *= titleTags.includes(item)));
      return ans;
    } else return ans;
  };

  // * Вспомогательная функция поиска избранных тайтлов. Если значение value - false, то все тайтлы проходят проверку
  const searchFavorites = (value, req) => {
    if (req === false) return true;
    return req === value;
  };

  const searchBySubstring = (titleName, subStr) => {
    return titleName.toLowerCase().indexOf(subStr.toLowerCase()) !== -1;
  };

  const resultArray =
    search || tags || favorites
      ? requireDate.filter(
          (item) =>
            searchBySubstring(item.name, search) &&
            searchAllTags(item.tags, tags) &&
            searchFavorites(item.favorites, convertStringToBoolean(favorites))
        )
      : requireDate;

  res.send(resultArray.sort(byField(sortBy)));
})
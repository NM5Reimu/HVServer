const express = require('express');
let requireDate = require('./src/bd/animeLib.json');
const fs = require('fs');
requireDate = require('./src/bd/tempLib.json');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log('Server has been started');
});

function byField(field) {
  return (a, b) => (a[field] > b[field] ? 1 : -1);
}

//requireDate.sort(byField('name'))

app.get('/getSearched/:value', (req, res) => {
  let parse = JSON.parse(req.params.value);

  //Функция проверяет есть ли все заданные пользователем теги в проверяемом тайтле
  const searchAllTags = (searchTags, titleTags) => {
    let ans = true;

    if (searchTags) {
      searchTags.map((item) => (ans *= titleTags.includes(item)));
      return ans;
    } else return ans;
  };

  //Вспомогательная функция поиска избранных тайтлов. Если значение value - false, то все тайтлы проходят проверку
  const searchFavorites = (value, req) => {
    if (req === false) return true;
    return req === value;
  };

  const searchBySubstring = (item, subStr) => {
    return item.name.toLowerCase().indexOf(subStr.toLowerCase()) !== -1;
  };

  const resultArray =
    parse.searchField || parse.tags || parse.favs
      ? requireDate.filter(
          (item) =>
            searchBySubstring(item, parse.searchField) &&
            searchAllTags(parse.tags, item.tags) &&
            searchFavorites(item.favorites, parse.favs),
        )
      : requireDate;

  res.send(resultArray);
});

app.get('/getTitleById/:id', (req, res) => {
  res.send(requireDate[req.params.id]);
  console.log(`Был отправлен объект: ${requireDate[req.params.id].name}`);
});

app.get('/getAllTitles', (req, res) => {
  res.send(requireDate);
});

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

app.get('/setFavoriteById/:value', (req, res) => {
  let parsed = JSON.parse(req.params.value);
  //console.log(`Request [set favorite]: ${parsed}`);
  for (const title of requireDate) {
    if (parsed.id === title.id) {
      title.favorites = parsed.favorites;

      fs.writeFileSync('./src/bd/tempLib.json', JSON.stringify(requireDate), (err) => {
        console.log(err || `[${title.name}] favorites is set to [${parsed.favorites}]`);
      });
      requireDate = require('./src/bd/tempLib.json');
      res.send(title);
    }
  }
});

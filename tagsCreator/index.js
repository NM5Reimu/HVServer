const fs = require("fs");

const lib = require('./animeLib.json');
let tagsList = [];


lib.map(title => {
    title.tags.map(tag => {
        if(tagsList.includes(tag) === false){
            tagsList.push(tag);
            console.log(`Added tag: ${tag}`);
        }
    })
})

fs.writeFileSync("animeTagsList.json", JSON.stringify(tagsList));
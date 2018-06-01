'use strict';

const bulkdensity = require('../density');
const bk = new bulkdensity('./test/sample.txt', {minKeywordLength: 3});

bk.getDensity()
    .then((keywords) => {
        console.log(JSON.stringify(keywords));
    })
    .catch((err) => {
        console.error(err);
    });
# file-keyword-density

Analyze keyword density of an entire text/html file

## Tests

```
npm test
```

## Usage

```
const TEXT_FILE_PATH = '...';      // html or text file with your keywords
const STOP_WORD_FILE_PATH = '...'; // set if you don't want to use default one
const bulkdensity = require('./density');
const bk = new bulkdensity(TEXT_FILE_PATH, {minKeywordLength: 3, stopWordFile: STOP_WORD_FILE_PATH});

bk.getDensity()
    .then((keywords) => {
        console.log(JSON.stringify(keywords));
    })
    .catch((err) => {
        console.error(err);
    });
```

'use strict';

const fs = require('fs');
const striptags = require('striptags');

const DEFAULT_BUFFER_SIZE = 32 * 1024;
const DEFAULT_MAX_KEYWORD_LENGTH = 50;
const DEFAULT_MIN_KEYWORD_LENGTH = 3;

class BulkDensity {
    constructor(filePath, opts) {
        opts = opts || {};
        this.keywords = {};
        this.filePath = filePath;
        this.bufferSize = opts.bufferSize ? opts.bufferSize : DEFAULT_BUFFER_SIZE;
        this.stopWordFile = opts.stopWordFile ? opts.stopWordFile : './stopwords.json';
        this.minKeywordLength = opts.minKeywordLength ? opts.minKeywordLength : DEFAULT_MIN_KEYWORD_LENGTH;
        this.maxKeywordLength = opts.maxKeywordLength ? opts.maxKeywordLength : DEFAULT_MAX_KEYWORD_LENGTH;
    }

    getDensity() {
        return new Promise((resolve, reject) => {
            let self = this;
            let stream = fs.createReadStream(this.filePath, { highWaterMark: this.bufferSize });

            stream.on('data', function(chunk) {
                // Yes, trailing keywords can be broken but we want a large enough
                // buffer. When buffer is large then we should be fine ignoring
                // trailing couple of keywords.
                try {
                    let chunkDensity = self._getDensityChunk(chunk.toString());
                } catch(err) {
                    reject(err);
                }

            });

            stream.on('end', function() {
                let sorted = self._sortByCount();
                resolve(sorted);
            });

            stream.on('error', function(err) {
                reject(err);
            });

        });
    }

    _getDensityChunk(content) {
        // clean html and special chars
        content = this._cleanContent(content);

        // remove stop words
        content = this._removeStopWords(content);

        // calc density
        return this._calculateKeywordsDensity(content);
    }

    _cleanContent(content) {
        // line breaks are separators
        content = content.replace(/<\s*br[^>]*\/?\s*>/ig, ' ');

        // strip hml
        content = String(striptags(content));

        // remove html entities
        content = content.replace(/&([^;]+);/g, ' ');

        // replace all special chars with separator
        content = content.replace(/[^A-Z0-9]+/ig, " ");

        return content;
    }

    _removeStopWords(content) {
        var fileData = fs.readFileSync(this.stopWordFile, 'utf8').toLowerCase();
        var stopwords = JSON.parse(fileData);
        for (var i = stopwords.length - 1; i >= 0; i--) {
            var regex  = new RegExp("( |^)" + stopwords[i].replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1") + "( |$)", "g");
            content = content.replace(regex, "$1$2");
        }

        // multiple spaces collapse into singles
        content = content.replace(/ {2,}/g, " ");

        return content;
    }

    _calculateKeywordsDensity(content) {
        //split the text with space
        var words = content.split(" ");

        for (var i = words.length - 1; i >= 0; i--) {
            let keyword = words[i].toLowerCase();
            if (keyword.length <= this.minKeywordLength || keyword.length >= this.maxKeywordLength)
                continue;
            if (this.keywords[keyword]) {
                //a new duplicate keyword
                this.keywords[keyword]++;
            } else {
                this.keywords[keyword] = 1;
            }
        }

        return this.keywords;
    }

    _sortByCount() {
        var sortable = [];
        for (var keyword in this.keywords) {
            sortable.push([keyword, this.keywords[keyword]]);
        }

        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });

        return sortable;
    }
}

module.exports = BulkDensity;
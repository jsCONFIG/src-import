var fs = require('fs');
var utils = require('utils');

var importCore = function (opt) {
    opt = utils.smartyMerge({
        keyword: 'imports',
        baseDir: ''
    }, opt);

    var reg = utils.regGenerator(opt.keyword);

    var resolveFileContent = function (filePath, fileContent) {
        var matchResult = fileContent.match(reg);
        if (!matchResult) {
            return false;
        }


    };

};

module.exports = importCore;
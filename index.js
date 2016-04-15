var fs = require('fs');
var path = require('path');
var evts = require('event-stream');
var utils = require('utils');
var importCore = require('core');

var srcImport = function (opt) {
    var resolveFn = function (file) {
        var coreFn = importCore(opt);
        var content = file.contents.toString();
        var result =  coreFn(file.path, content);
        if (result) {
            file.contents = result;
        }
    };

    return evts.through();
};

module.exports = srcImport;
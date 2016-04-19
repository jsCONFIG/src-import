var fs = require('fs');
var path = require('path');
var evts = require('event-stream');
var Promise = require('promise');
var utils = require('./utils');
var importCore = require('./core');

var buildResolveCenter = function (opt) {
    var parser = new importCore();
    var resolveMain = function (startFilePath) {
            var combinedMap = [];
            var resolveUnit = function (filePath) {
                var spec = parser.resolveFile(filePath);
                combinedMap.push(spec);
                if (spec.dependencies.length) {
                    spec.dependencies.forEach(function (info) {
                        resolveUnit(info.filePath);
                    });
                }
            };
            resolveUnit(startFilePath);
            return {status: 'success', data: parser.combineFile(combinedMap)};
    };
    return {
        parser: parser,
        resolve: resolveMain
    };
};

var srcImport = function (opt) {
    var resolveGroup = buildResolveCenter(opt);
    var processCenter = function (file) {
        var fileContent = file.contents.toString();
        if (file.isBuffer()) {
            var resolveResult = resolveGroup.resolve(file.path);
            console.log(resolveResult.data);
            if (resolveResult.status === 'success') {
                file.contents = new Buffer(resolveResult.data);
            }
        }

        this.emit('data', file);
    };

    return evts.through(processCenter);
};

module.exports = srcImport;
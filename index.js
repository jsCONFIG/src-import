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
            var fileL = 0;
            var resolveUnit = function (filePath) {
                fileL++;
                parser.resolveFile(filePath).then(function (spec) {
                    fileL--;
                    combinedMap.push(spec);
                    if (spec.dependencies.length) {
                        spec.dependencies.forEach(function (info) {
                            resolveUnit(info.filePath);
                        });
                    }

                    if (fileL <= 0) {
                        return {status: 'success', data: combinedMap};
                    }
                },
                function (msg) {
                    return {status: 'error', data: msg};
                });
            };
            resolveUnit(startFilePath);
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
            if (resolveResult.status === 'success') {
                file.contents = new Buffer(resolveResult.data);
            }
        }

        this.emit('data', file);
    };

    return evts.through(processCenter);
};

module.exports = srcImport;
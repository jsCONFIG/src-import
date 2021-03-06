var fs = require('fs');
var path = require('path');
var evts = require('event-stream');
var Promise = require('promise');
var utils = require('./utils');
var importCore = require('./core');

var buildResolveCenter = function (opt) {
    var parser = new importCore(opt);
    var resolveMain = function (file) {
            var startFilePath = file.path;
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
    opt = opt || {};
    var processCenter = function (file) {
        opt.cwd = file.cwd;
        var resolveGroup = buildResolveCenter(opt);
        var cwd = file.cwd;
        var fileContent = file.contents.toString();
        if (file.isBuffer()) {
            var resolveResult = resolveGroup.resolve(file);
            if (resolveResult.status === 'success') {
                file.contents = new Buffer(resolveResult.data);
            }
        }

        this.emit('data', file);
    };

    return evts.through(processCenter);
};

module.exports = srcImport;
var path = require('path');

var utils = {
    smartyMerge: function (rootObj, newObj, isNumParse) {
        newObj = newObj || {};
        var tempObj = {};
        for (var i in rootObj ) {
            tempObj[i] = rootObj[i];
            if (i in newObj) {
                var temp = newObj[i],
                    parseVal = parseFloat(temp, 10);
                if (isNumParse && !isNaN(parseVal)) {
                    temp = parseVal;
                }
                tempObj[i] = temp;
            }
        }
        return tempObj;
    },

    merge: function (rootObj, newObj) {
        rootObj = rootObj || {};
        newObj = newObj || {};
        for (var i in newObj) {
            if (newObj.hasOwnProperty(i)) {
                rootObj[i] = newObj[i];
            }
        }

        return rootObj;
    },

    regGenerator: function (keyword) {
        return new RegExp(['(\\S?)\\s*(', keyword, ')\\((\'|")([^"\'*:><?\\|]+)\\3\\);?'].join(''), 'g');
    },

    // 从匹配中解析出信息
    resolveInfoFromMatch: function (matchArr) {
        var info = {
            keyword: matchArr
        };
    },

    buildError: function (filePath, msg) {
        msg = msg || 'Not Found';
        return {
            file: filePath,
            content: '// ' + msg,
            error: true
        };
    },

    fixFilePath: function (fPath) {
        var newExtname = path.extname(fPath);
        var extCopyName = newExtname;
        if (!newExtname.length || newExtname === '.') {
            extCopyName = newExtname = '.js';
        }
        else {
            newExtname = '';
        }
        fPath = fPath + newExtname;
        return {
            path: fPath,
            extname: extCopyName
        };
    },

    resolvePath: function (currentFilePath, anotherPathParam) {
        var currentFilePathDir = path.dirname(currentFilePath);
        var absolutePath = path.resolve(currentFilePathDir, anotherPathParam);
        var fileInfo = this.fixFilePath(absolutePath);
        var extname = fileInfo.extname;
        absolutePath = fileInfo.path;

        return {
            dir: path.dirname(absolutePath),
            file: path.basename(absolutePath),
            filePath: absolutePath,
            extname: extname
        };
    },

    // 解析依赖
    resolveCombine: function (fileGroup) {
        var groupMap = {};
        var combinedContent = '';
        fileGroup.forEach(function (fileInfo) {
            groupMap[fileInfo.filePath] = fileInfo;
        });

        var combinedMap = {};
        var resolveOrder = [];
        var resolveUnit = function (fileInfo) {
            if (fileInfo.dependencies.length) {
                fileInfo.dependencies.forEach(function (depFileInfo) {
                    resolveUnit(groupMap[depFileInfo.filePath]);
                });
            }
            if (!combinedMap[fileInfo.filePath]) {
                combinedMap[fileInfo.filePath] = true;
                resolveOrder.push(fileInfo);
            }
        };
        fileGroup.forEach(function (fileInfo) {
            resolveUnit(fileInfo);
        });

        return resolveOrder;
    },

    unikey: function (len) {
        len = len || 9;
        var result = '';
        for( ; result.length < len; result += Math.random().toString(36).substr(2) );
        return result.substr(0, len);
    },

    // 发号器
    keyCreator: function () {
        // 使用时间戳+随机符的形式生成
        var timestamp = +(new Date);
        timestamp = Math.ceil(timestamp / 3600000);
        var keyArr = (this.unikey(6) + timestamp).match(/.{1,3}/g);
        return keyArr.join('_');
    }
};

module.exports = utils;
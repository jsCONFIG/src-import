var fs = require('fs');
var Promise = require('promise');
var path = require('path');
var utils = require('./utils');

var importCore = function (opt) {
    this.opt = utils.smartyMerge({
        cwd: '',
        keyword: 'imports',
        baseDir: '',
        //  是否异步
        async: false,
        // 自动判断是否赋值替换
        smart: true,
        encoding: 'utf-8'
    }, opt);

    this.reg = utils.regGenerator(this.opt.keyword);
    this.fileGroup = {};
    // 被等于的模块地图
    this.needHandleMap = {};
};

importCore.prototype.resolveFile = function (filePath) {
    var self = this;
    if (this.opt.async) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    var info = utils.buildError(filePath, 'Not Found');
                    self.fileGroup[filePath] = info;
                    reject(info);
                    return false;
                }
                var info = self.resolveFileContent(filePath, data);
                self.fileGroup[filePath] = info;
                resolve(info);
            });
        });
    }
    var fileContent = fs.readFileSync(filePath, {encoding: self.opt.encoding});
    var info = self.resolveFileContent(filePath, fileContent);
    this.fileGroup[filePath] = info;
    return info;
};

importCore.prototype.resolveFileContent = function (filePath, fileContent) {
    fileContent = fileContent.toString();
    var reg = this.reg;
    var needHandleMap = this.needHandleMap;
    var matchArr;
    var dependencies = [];
    var absolutePath = path.resolve(filePath);
    var filePathInfo = utils.fixFilePath(absolutePath);
    var extname = filePathInfo.extname;
    absolutePath = filePathInfo.path;
    fileContent = fileContent.replace(reg, function (unit, prefixSym, keyword, rubbish, pathParam, index) {
        var info = utils.merge({
            // 仅导入(非赋值)
            justImport: prefixSym !== '=',
            pathParam: pathParam
        }, utils.resolvePath(filePath, pathParam));

        if (!needHandleMap[info.filePath]) {
            needHandleMap[info.filePath] = !info.justImport;
        }
        dependencies.push(info);
        return prefixSym + ' ' + keyword + '("' + info.filePath + '");';
    });

    return {
        dir: path.dirname(absolutePath),
        file: path.basename(absolutePath),
        extname: extname,
        filePath: absolutePath,
        fileContent: fileContent,
        dependencies: dependencies
    };
};

importCore.prototype.pureFileContent = function (fileContent, handleMap) {
    var reg = this.reg;
    var smart = this.opt.smart;
    return fileContent.replace(reg, function (unit, prefixSym, keyword, rubbish, pathParam, index) {
        if (prefixSym === '=') {
            if (smart) {
                if (!handleMap.hasOwnProperty(pathParam)) {
                    return '/*Not Found: ' + pathParam + '*/';
                }
                return prefixSym + ' ' + handleMap[pathParam] + ';';
            }
            return '';
        }
        // 非赋值情况直接清除即可
        return prefixSym;
    });
};

importCore.prototype.combineFile = function (filesDesc) {
    this.combineOrder = utils.resolveCombine(filesDesc);
    var smart = this.opt.smart;
    var cwd = this.opt.cwd;
    var fileContent = [];
    // 句柄
    var handleMap = {};
    var needHandleMap = this.needHandleMap;
    var self = this;
    this.combineOrder.forEach(function (fileInfo) {
        var pureContent = self.pureFileContent(fileInfo.fileContent, handleMap);
        if (smart && needHandleMap[fileInfo.filePath]) {
            var baseFilePath = fileInfo.filePath.replace(cwd, '');
            var varKey = utils.keyCreator(baseFilePath);
            handleMap[fileInfo.filePath] = varKey;
            pureContent = 'var ' + varKey + ' = ' + pureContent;
        }
        else {
            pureContent = pureContent;
        }
        fileContent.push(';\n' + pureContent);
    });
    return fileContent.join('');
};

module.exports = importCore;
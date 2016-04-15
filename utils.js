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

    regGenerator: function (keyword) {
        return new RegExp(['(\\S?)\\s*(?:', keyword, ')\\((\'|")([^"\'*/:><?\\|]+)\\2\\)'].join(''), 'g');
    }
};

module.exports = utils;
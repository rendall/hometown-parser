"use strict";
var oneWordPtrn = /^[A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF]+$/;
var symbolPtrn = / ?[\n\:;&\/\+] ?/;
var andPtrn = /(?:\b|^)(?:and|including|include|within|to|near|nearby)(?: +|\b)/;
var commaPtrn = / ?(?:,| -[A-Za-z]|[A-Za-z]- | - ) ?/;
var sentencePattern = /[^\.](.*?)\./;
var manyWordsPtrn = /^[A-Z\u00C0-\u00D6\u00D8-\u00DE a-z\u00DF-\u00F6\u00F8-\u00FF\-]+$/;
var websitePtrn = /(?:https?:\/\/)?[a-z0-9\/\.]+\.[a-z]{2,4}(?![a-z])(?:\/[a-z\/\.\?=0-9\&_]*)?/i;
var washingtonDCPtrn = /Washington,? ?D\.?C\.?/i;
var twoLetterCitiesPtrn = /\b((?:L\.?A\.?|S\.?F\.?|D\.?C\.?|O\.?C\.?))\b/g;
var threeLetterCitiesPtrn = /\b(?!LOS|LAS|RIO|SAN)(?:[A-Z\u00C0-\u00D6\u00D8-\u00DE]\.?){3}\b/g;
var cityStatePtrn = /(?:[A-Z][a-z]+\b )?(?:[A-Z][a-z]+\b )?(?:[A-Z][a-z]+\b),? +[A-W]\.?[A-Z]\.?\b/;
var isChattyPtrn = /(\b[a-z\u00DF-\u00F6\u00F8-\u00FF]+\b *?){3,}/;
var isChatty = function (str) { return RegExp(isChattyPtrn).test(str); };
var parenthesisPtrn = /\(.*?\)/;
var townPtrn = /[A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF\.]{2}/;
var townCommaRegion = /\b[A-Z\u00C0-\u00D6\u00D8-\u00DE][a-z\u00DF-\u00F6\u00F8-\u00FF]+\b, +[A-Z\u00C0-\u00D6\u00D8-\u00DE][a-z\u00DF-\u00F6\u00F8-\u00FF]+\b/;
var removeExpr = function (pattern, str) {
    var regex = RegExp(pattern);
    var splits = pattern[Symbol.split](str);
    var newStr = splits.filter(function (s) { return !isEmpty(s); });
    return newStr.join("");
};
var lastMatch = function (regex, str, lastIndex) {
    if (lastIndex === void 0) { lastIndex = 0; }
    if (regex.flags.indexOf("g") == -1)
        return lastMatch(RegExp(regex, regex.flags + "g"), str, lastIndex);
    var match = RegExp(regex).exec(str);
    if (match == null)
        return match;
    var lMatch = lastMatch(regex, str, match.index);
    return lMatch == null ? match : lMatch;
};
var firstMatch = function (regex, str) { return regex.exec(str); };
var splitExpr = function (pattern, str) {
    var match = firstMatch(pattern, str);
    if (match == null)
        return ["", str, ""];
    var i = match.index;
    return [str.substring(0, i), str.substr(i + match[0].length), match[0]];
};
var extractExpr = function (pattern, str) {
    var regex = RegExp(pattern);
    var extracted = pattern[Symbol.match](str);
    if (extracted == null)
        return ["", str];
    var expr = extracted[0];
    var remainingString = str.replace(expr, "");
    var exprReturn = [expr, remainingString];
    return exprReturn;
};
var isPattern = function (pattern, str) { return RegExp("^" + pattern.source + "$").test(str) && splitExpr(pattern, str)[2] == str; };
var hasPattern = function (pattern, str) { return RegExp(pattern).test(str); };
var hasParenthesis = function (str) { return hasPattern(parenthesisPtrn, str); };
var isParenthesis = function (str) { return isPattern(parenthesisPtrn, str); };
var hasTown = function (str) { return hasPattern(townPtrn, str); };
var isOneWord = function (str) { return isPattern(oneWordPtrn, str); };
var isSaintOrMount = function (str) { return isPattern(/[MS]t\.? [A-Z][a-z]+/, str); };
var isOneTown = function (str) { return R.anyPass([isSaintOrMount, isOneWord])(str); };
var isAndString = function (str) { return hasPattern(andPtrn, str); };
var isSymbolSplit = function (str) { return hasPattern(symbolPtrn, str); };
var isManyWords = function (str) { return hasPattern(manyWordsPtrn, str); };
var hasCityState = function (str) { return hasPattern(cityStatePtrn, str); };
var isEmpty = function (str) { return str == "" || str == undefined; };
var isCityState = function (str) { return isPattern(cityStatePtrn, str); };
var hasComma = function (str) { return hasPattern(commaPtrn, str); };
var hasSentence = function (str) { return hasPattern(sentencePattern, str); };
var hasWebsite = function (str) { return hasPattern(websitePtrn, str); };
var isKnownGarbage = function (str) { return ["etc", "gps", "we", "the"].indexOf(str.toLowerCase()) >= 0; };
var removeWebsites = function (str) { return hasWebsite(str) ? extractExpr(websitePtrn, str)[1] : str; };
var normTrimFront = function (str) { return hasPattern(/^[^A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF\(]/, str) ? normTrimFront(str.substr(1)) : str; };
var normTrimBack = function (str) { return hasPattern(/[^A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF\)]$/, str) ? normTrimBack(str.substr(0, str.length - 1)) : str; };
var toSingleSpaces = function (str) { return str.indexOf('  ') == -1 ? str : toSingleSpaces(str.replace('  ', ' ')); };
var normTrimPlus = function (str) { return R.compose(normTrimBack, normTrimFront)(str); };
var capitalizeWord = function (str) { return str.length >= 3 && !hasPattern(threeLetterCitiesPtrn, str) ? str[0].toUpperCase() + str.substring(1).toLowerCase() : str; };
var allUpperCasePtrn = /[A-Z\u00C0-\u00D6\u00D8-\u00DE ]{5,}/;
var allLowerCasePtrn = /[a-z\u00DF-\u00F6\u00F8-\u00FF ]{5,}/;
var normalizeCase = function (str) { return R.compose(R.join(' '), R.map(capitalizeWord))(str.toLowerCase().split(' ')); };
var normalizeInputStr = function (str) { return R.compose(normTrimPlus, removeWebsites)(str); };
var divideString = function (f, pattern, str) {
    var divided = f(pattern, str);
    if (isEmpty(divided[0]))
        return parseTowns(divided[1]);
    var concat = parseTowns(divided[0]).concat(parseTowns(divided[1]));
    return concat;
};
var somethingInFrontOfAColonPtrn = /^.*:/;
var parseTowns = function (expandStr) {
    var str = normalizeInputStr(expandStr);
    if (isEmpty(str) || !hasTown(str))
        return [];
    if (isKnownGarbage(str))
        return [];
    if (isPattern(threeLetterCitiesPtrn, str))
        return [str];
    if (isOneTown(str)) {
        var capTown = R.compose(R.join(' '), R.map(capitalizeWord), R.split(' '))(str);
        return [capTown];
    }
    if (hasPattern(somethingInFrontOfAColonPtrn, str))
        return parseTowns(removeExpr(/^.*:/, str));
    if (isParenthesis(str)) {
        var insideParen = str.substr(1, str.length - 2);
        var reduced = removeExpr(/\b[a-z\u00DF-\u00F6\u00F8-\u00FF]+/, insideParen);
        return parseTowns(reduced);
    }
    if (hasParenthesis(str)) {
        var divided = extractExpr(parenthesisPtrn, str);
        var pContent = divided[0];
        var insideParen = pContent.substr(1, pContent.length - 2);
        return parseTowns(divided[1]).concat(parseTowns(pContent));
    }
    if (isPattern(washingtonDCPtrn, str))
        return [str];
    if (hasPattern(washingtonDCPtrn, str))
        return divideString(extractExpr, washingtonDCPtrn, str);
    if (isPattern(twoLetterCitiesPtrn, str))
        return [str];
    if (hasPattern(twoLetterCitiesPtrn, str))
        return divideString(extractExpr, twoLetterCitiesPtrn, str);
    if (hasPattern(threeLetterCitiesPtrn, str))
        return divideString(extractExpr, threeLetterCitiesPtrn, str);
    if (hasSentence(str))
        return divideString(extractExpr, sentencePattern, str);
    if (isAndString(str))
        return divideString(splitExpr, andPtrn, str);
    if (isSymbolSplit(str))
        return divideString(splitExpr, symbolPtrn, str);
    if (isCityState(str))
        return [str];
    if (hasCityState(str))
        return divideString(extractExpr, cityStatePtrn, str);
    if (hasComma(str))
        return divideString(splitExpr, commaPtrn, str);
    if (isChatty(str))
        return [];
    if (hasPattern(/\b[A-Z\u00C0-\u00D6\u00D8-\u00DE][a-z\u00DF-\u00F6\u00F8-\u00FF]+\b/, str) && hasPattern(/\b[a-z\u00DF-\u00F6\u00F8-\u00FF]{3,}\b/, str))
        return parseTowns(removeExpr(/\b[a-z\u00DF-\u00F6\u00F8-\u00FF]{2,}\b/, str));
    if (isPattern(allUpperCasePtrn, str) || isPattern(allLowerCasePtrn, str))
        return parseTowns(normalizeCase(str));
    if (isManyWords(str))
        return [str];
    console.warn("Ideally should not be here: " + str);
    return [];
};
var splitCityFromState = function (str) { return removeExpr(/,? *[A-Z].?[A-Z].*\b/, str); };
var canonicalData = [
    ['', ["Abroad", "All", "Area", "Beyond", "More", "No", /^Various/, /^Everywhere/]],
    ["USA", ["Cities Across US", /^U.?S.?A.*\b/, /^United States/]],
    ["Seattle", [/Greater *Seattle/, "Mostly Seattle"]],
    ["Philadelphia", [/^Phil/, "PHL"]],
    ["Las Vegas", [/Vegas/]],
    ["Los Angeles", [/^L.?A.*\b/]],
    ["Washington DC", [/^D.?C.*\b/, /^Washington +D\.?C\.?/]],
    [splitCityFromState, [cityStatePtrn]],
    ["San Francisco", [/^\s*Bay *Area/, /^San Fra/, "SF", "SFO"]],
    ["Nevada City", [/Nevada City/]],
    ["California", ["CA"]],
    ["Montréal", ["Montreal"]],
    ["Oklahoma City", ["OKC"]],
    ["Portland", ["PDX", "Greater Portland"]],
    ["Park City", [/^Park City/]]
];
var toCanonicalName = function (str, i, j) {
    if (i === void 0) { i = 0; }
    if (j === void 0) { j = 0; }
    if (i >= canonicalData.length)
        return str;
    var patterns = canonicalData[i][1];
    if (j >= patterns.length)
        return toCanonicalName(str, i + 1, 0);
    var pattern = patterns[j];
    var isMatch = typeof pattern == "string" ? str == pattern : RegExp(pattern).test(str);
    var canonical = canonicalData[i][0];
    if (isMatch) {
        if (typeof canonical == "string")
            return canonical;
        return canonical(str);
    }
    return toCanonicalName(str, i, j + 1);
};
//# sourceMappingURL=hometowns.js.map
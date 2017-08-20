/* 
☑   isPattern(pattern, str) returns a boolean answering: string exactly matches pattern.  i.e. entire string == firstmatch.
☑   hasPattern(pattern, str) returns a boolean: if string contains pattern.
☑   splitPattern(pattern, str) returns a tuple: [str up to first match, str after first match, match]
☑   extractPattern(pattern, str) returns a tuple: [last match, str with last match removed]
☑   removePattern(pattern, str) returns a string of all matches removed.
*/
// Latin Basic + Latin-1 Supplement 
// capital letters: [A-Z\u00C0-\u00D6\u00D8-\u00DE]
// lower-case letters: [a-z\u00DF-\u00F6\u00F8-\u00FF]
const oneWordPtrn = /^[A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF]+$/; // matches single-word hometown. Chico, Seattle, Amsterdam etc.
const symbolPtrn = / ?[\n\:;&\/\+] ?/;
const andPtrn = /(?:\b|^)(?:and|including|include|within|to|near|nearby)(?: +|\b)/;
const commaPtrn = / ?(?:,| -[A-Za-z]|[A-Za-z]- | - ) ?/;
const sentencePattern = /[^\.](.*?)\./;
const manyWordsPtrn = /^[A-Z\u00C0-\u00D6\u00D8-\u00DE a-z\u00DF-\u00F6\u00F8-\u00FF\-]+$/; //matches hometown with spaces. Could be San Francisco or 'San Francisco and Berlin'.
const websitePtrn = /(?:https?:\/\/)?[a-z0-9\/\.]+\.[a-z]{2,4}(?![a-z])(?:\/[a-z\/\.\?=0-9\&_]*)?/i; // not perfect but good enough
const washingtonDCPtrn = /Washington,? ?D\.?C\.?/i; // must remove washington dc before removing just 'dc'.
const twoLetterCitiesPtrn = /\b((?:L\.?A\.?|S\.?F\.?|D\.?C\.?|O\.?C\.?))\b/g; // captures SF LA DC - and, unfortunately, LA = Lousiana. Hmm.
const threeLetterCitiesPtrn = /\b(?!LOS|LAS|RIO|SAN)(?:[A-Z\u00C0-\u00D6\u00D8-\u00DE]\.?){3}\b/g; // works best if we extract NYC and USA explicitly
const cityStatePtrn = /(?:[A-Z][a-z]+\b )?(?:[A-Z][a-z]+\b )?(?:[A-Z][a-z]+\b),? +[A-W]\.?[A-Z]\.?\b/; // captures "City, ST" like "Boulder, CO" "San Francisco, CA". Sloppy but it works.
const isChattyPtrn = /(\b[a-z\u00DF-\u00F6\u00F8-\u00FF]+\b *?){3,}/; // matches a string that is comprised of more than three words that are all lower-case.
const isChatty = (str: string) => RegExp(isChattyPtrn).test(str);
const parenthesisPtrn = /\(.*?\)/; // captures a parenthesis and its contents.
const townPtrn = /[A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF\.]{2}/ // just checks to see if there are any two letters remaining at all.
const townCommaRegion = /\b[A-Z\u00C0-\u00D6\u00D8-\u00DE][a-z\u00DF-\u00F6\u00F8-\u00FF]+\b, +[A-Z\u00C0-\u00D6\u00D8-\u00DE][a-z\u00DF-\u00F6\u00F8-\u00FF]+\b/
/*
    Accepts a pattern and a string, and returns a string with the
    pattern matches removed from the string.
*/
const removeExpr = (pattern: RegExp, str: string): string => {
    const regex = RegExp(pattern);
    const splits = pattern[Symbol.split](str);
    const newStr = splits.filter((s) => !isEmpty(s));
    return newStr.join("");
}
const lastMatch = (regex: RegExp, str: string, lastIndex: number = 0): RegExpExecArray | null => {
    if (regex.flags.indexOf("g") == -1) return lastMatch(RegExp(regex, regex.flags + "g"), str, lastIndex); // this must have "g" set.
    const match = RegExp(regex).exec(str);
    if (match == null) return match;
    const lMatch = lastMatch(regex, str, match.index);
    return lMatch == null ? match : lMatch;
}
const firstMatch = (regex: RegExp, str: string) => regex.exec(str);
const splitExpr = (pattern: RegExp, str: string): [string, string, string] => {
    const match = firstMatch(pattern, str);
    if (match == null) return ["", str, ""];
    const i = match.index!;
    return [str.substring(0, i), str.substr(i + match[0].length), match[0]];
}
const extractExpr = (pattern: RegExp, str: string): [string, string] => {
    const regex = RegExp(pattern);
    const extracted = pattern[Symbol.match](str);
    if (extracted == null) return ["", str];
    const expr = extracted[0];
    const remainingString = str.replace(expr, "");
    const exprReturn: [string, string] = [expr, remainingString];
    return exprReturn;
}

const isPattern = (pattern: RegExp, str: string) => RegExp(`^${pattern.source}$`).test(str) && splitExpr(pattern, str)[2] == str;
const hasPattern = (pattern: RegExp, str: string) => RegExp(pattern).test(str);
const hasParenthesis = (str: string) => hasPattern(parenthesisPtrn, str);
const isParenthesis = (str: string) => isPattern(parenthesisPtrn, str);
const hasTown = (str: string) => hasPattern(townPtrn, str);
const isOneWord = (str: string) => isPattern(oneWordPtrn, str);
const isSaintOrMount = (str: string) => isPattern(/[MS]t\.? [A-Z][a-z]+/, str);
const isOneTown = (str: string) => R.anyPass([isSaintOrMount, isOneWord])(str);
const isAndString = (str: string) => hasPattern(andPtrn, str);
const isSymbolSplit = (str: string) => hasPattern(symbolPtrn, str);
const isManyWords = (str: string) => hasPattern(manyWordsPtrn, str);
const hasCityState = (str: string) => hasPattern(cityStatePtrn, str);
const isEmpty = (str: string) => str == "" || str == undefined;
const isCityState = (str: string) => isPattern(cityStatePtrn, str);
const hasComma = (str: string) => hasPattern(commaPtrn, str);
const hasSentence = (str: string) => hasPattern(sentencePattern, str);
const hasWebsite = (str: string) => hasPattern(websitePtrn, str);
const isKnownGarbage = (str: string) => ["etc", "gps", "we", "the"].indexOf(str.toLowerCase()) >= 0;
const removeWebsites: any = (str: string) => hasWebsite(str) ? extractExpr(websitePtrn, str)[1] : str;
const normTrimFront: any = (str: string) => hasPattern(/^[^A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF\(]/, str) ? normTrimFront(str.substr(1)) : str;
const normTrimBack: any = (str: string) => hasPattern(/[^A-Z\u00C0-\u00D6\u00D8-\u00DEa-z\u00DF-\u00F6\u00F8-\u00FF\)]$/, str) ? normTrimBack(str.substr(0, str.length - 1)) : str;
const toSingleSpaces:any = (str:string) => str.indexOf('  ') == -1? str : toSingleSpaces(str.replace('  ', ' '));
const normTrimPlus = (str: string) => R.compose(normTrimBack, normTrimFront)(str);
const capitalizeWord = (str: string) => str.length >= 3 && !hasPattern(threeLetterCitiesPtrn, str) ? str[0].toUpperCase() + str.substring(1).toLowerCase() : str;
const allUpperCasePtrn = /[A-Z\u00C0-\u00D6\u00D8-\u00DE ]{5,}/;
const allLowerCasePtrn = /[a-z\u00DF-\u00F6\u00F8-\u00FF ]{5,}/;
const normalizeCase = (str: string) => R.compose(R.join(' '), R.map(capitalizeWord))(str.toLowerCase().split(' '));

const normalizeInputStr = (str: string) => R.compose(normTrimPlus, removeWebsites)(str);
const divideString = (f: (pattern: RegExp, str: string) => [string, string], pattern: RegExp, str: string) => {
    const divided = f(pattern, str);

    //console.debug(`dividing ${str}`, divided);

    if (isEmpty(divided[0])) return parseTowns(divided[1]);

    const concat = parseTowns(divided[0]).concat(parseTowns(divided[1]));
    return concat;
}

const somethingInFrontOfAColonPtrn = /^.*:/
const parseTowns = (expandStr: string): string[] => {
    //console.debug(`dividing ${expandStr}`);

    const str = normalizeInputStr(expandStr) as string;

    if (isEmpty(str) || !hasTown(str)) return [];
    if (isKnownGarbage(str)) return [];

    //console.debug(`dividing ${str} passes minimum standard`);

    if (isPattern(threeLetterCitiesPtrn, str)) return [str];

    //console.debug(`dividing ${str} is not a three-letter city`);

    if (isOneTown(str)) {
        const capTown = R.compose(R.join(' '), R.map(capitalizeWord), R.split(' '))(str);
        //if (str != capTown)    //console.debug(`dividing "${str}" capitalized to ${capTown}`);

        return [capTown];
    }
    //console.debug(`dividing ${str} is not one town`);

    // Can likely enough always remove everything in front of a colon.
    if (hasPattern(somethingInFrontOfAColonPtrn, str)) return parseTowns(removeExpr(/^.*:/, str));
    //console.debug(`dividing ${str} has no colon`);

    if (isParenthesis(str)) {
        const insideParen = str.substr(1, str.length - 2);
        // all lower case words are removed
        const reduced = removeExpr(/\b[a-z\u00DF-\u00F6\u00F8-\u00FF]+/, insideParen);
        return parseTowns(reduced);
    }

    //console.debug(`dividing ${str} is not in a parenthesis`);

    if (hasParenthesis(str)) {
        const divided = extractExpr(parenthesisPtrn, str);
        const pContent = divided[0];
        const insideParen = pContent.substr(1, pContent.length - 2);
        return parseTowns(divided[1]).concat(parseTowns(pContent));
    }

    //console.debug(`dividing ${str} does not have a parenthesis`);


    if (isPattern(washingtonDCPtrn, str)) return [str];
    //console.debug(`dividing ${str} is not Washington DC`);

    if (hasPattern(washingtonDCPtrn, str)) return divideString(extractExpr, washingtonDCPtrn, str);

    //console.debug(`dividing ${str} does not have Washington DC`);


    if (isPattern(twoLetterCitiesPtrn, str)) return [str];
    //console.debug(`dividing ${str} is not a two-letter city`);


    if (hasPattern(twoLetterCitiesPtrn, str)) return divideString(extractExpr, twoLetterCitiesPtrn, str);

    //console.debug(`dividing ${str} does not have a two-letter city`);



    if (hasPattern(threeLetterCitiesPtrn, str)) return divideString(extractExpr, threeLetterCitiesPtrn, str);

    //console.debug(`dividing ${str} does not have a three letter city`);

    if (hasSentence(str)) return divideString(extractExpr, sentencePattern, str);

    //console.debug(`dividing ${str} does not have a sentence`);


    // Often people list their address in the form <Town, Region> as in "Oswego, New York" or "Tokyo, Japan"
    // This is hard to distinguish from lists like "Los Cruces, Rotterdam, Corpus Christi and Flåm"
    // So extracting the first must happen before 'and' and 'comma' splits the string, but can be after the sentences are split out.


    if (isAndString(str)) return divideString(splitExpr, andPtrn, str);

    //console.debug(`dividing ${str} does not contain and/including/to etc.`);

    if (isSymbolSplit(str)) return divideString(splitExpr, symbolPtrn, str);

    //console.debug(`dividing ${str} does not contain & / ; or other conjunction symbol`);


    //if (hasPattern(threeLetterCitiesPtrn, str)) return divideString(extractExpr, threeLetterCitiesPtrn, str);
    if (isCityState(str)) return [str];

    //console.debug(`dividing ${str} is not a City, ST pattern`);


    if (hasCityState(str)) return divideString(extractExpr, cityStatePtrn, str);

    //console.debug(`dividing ${str} does not have a City, ST`);


    if (hasComma(str)) return divideString(splitExpr, commaPtrn, str);

    //console.debug(`dividing ${str} does not have a comma`);


    if (isChatty(str)) return [];

    //console.debug(`dividing ${str} isn't too chatty`);


    // if there are any capitalized words in the string, remove all words that are not capitalized 
    if (hasPattern(/\b[A-Z\u00C0-\u00D6\u00D8-\u00DE][a-z\u00DF-\u00F6\u00F8-\u00FF]+\b/, str) && hasPattern(/\b[a-z\u00DF-\u00F6\u00F8-\u00FF]{3,}\b/, str)) return parseTowns(removeExpr(/\b[a-z\u00DF-\u00F6\u00F8-\u00FF]{2,}\b/, str));

    //console.debug(`dividing ${str} doesn't have lower-case words`);


    // now normalize all cap or all lower case
    if (isPattern(allUpperCasePtrn, str) || isPattern(allLowerCasePtrn, str)) return parseTowns(normalizeCase(str));

    //console.debug(`dividing ${str} is not all UPPERCASE or lowercase`);


    if (isManyWords(str)) return [str];

    //console.debug(`dividing ${str} is not 'many words'`);

    console.warn(`Ideally should not be here: ${str}`);
    return [];
}
// const doTest = (message: string, expr: any, expected: any) => {
//     const equals = (expr instanceof Array) ? R.equals(expr.sort(), expected.sort()) : R.equals(expr, expected);
//     console.assert(equals, `\n${message}\nReceived:`, expr);
// }

// const testRun = () => {
//     console.debug("Beginning tests.");
//     doTest("This test should always fail.", false, true);
//     doTest('isPattern(/[^\.](.*?)\./, "Aa.") => true', isPattern(/[^\.](.*?)\./, "Aa."), true);
//     doTest('isPattern(/[^\.](.*?)\./, "Aa.Ba.Ca.") => false', isPattern(/[^\.](.*?)\./, "Aa.Ba.Ca."), false);
//     doTest('n/a should return empty', parseTowns("n/a"), []);
//     doTest('normTrimFront("123f") should return "f"', normTrimFront("123f"), "f");
//     doTest('normalizeInputStr("  ") should return empty', normalizeInputStr("  "), "");
//     doTest('normalizeInputStr(" f ") should return "f"', normalizeInputStr(" f "), "f");
//     doTest('normalizeInputStr("...f...") should return "f"', normalizeInputStr("...f..."), "f");
//     doTest('normalizeInputStr("facebook.com/campminderaser") should return empty', normalizeInputStr("facebook.com/campminderaser"), "");
//     doTest('removeWebsites("hey facebook.uk.co.com/my/pages/index.html") should return "hey "', removeWebsites("hey facebook.uk.co.com/my/pages/index.html"), "hey ");
//     doTest('splitExpr(/a/, "LaR") will return ["L", "R"]', splitExpr(/a/, "LaR"), ["L", "R", "a"]);
//     doTest("isOneTown('no no') false", isOneTown("no no"), false);
//     doTest("isOneTown('yes') is yes", isOneTown("yes"), true);
//     doTest("single word", parseTowns("accord"), ["Accord"]);
//     doTest("splitsIntoTwo", parseTowns("chicago/acron").length, 2);
//     doTest('parseTowns("Capital Wasteland (Various)") => ["Capital Wasteland", "Various"]', parseTowns("Capital Wasteland (Various)"), ["Capital Wasteland", "Various"]);
//     doTest('parseTowns("Champaign (but relocating to DC in late Sept.)"), ["Champaign", "DC"]', parseTowns("Champaign (but relocating to DC in late Sept.)"), ["Champaign", "DC", "Sept"]);
//     doTest('parseTowns("Los Angeles/Montréal") => ["Los Angeles", "Montréal"]', parseTowns("Los Angeles/Montréal"), ["Los Angeles", "Montréal"]);
//     doTest('parseTowns("SF/NYC/LA") => ["SF", "NYC", "LA"]', parseTowns("SF/NYC/LA"), ["SF", "NYC", "LA"]);
//     doTest('parseTowns("Silicon Valley, Pai (Thailand)"), ["Silicon Valley", "Pai","Thailand]"', parseTowns("Silicon Valley, Pai (Thailand)"), ["Silicon Valley", "Pai", "Thailand"]);
//     doTest('parseTowns("Stockholm, Malmö, Göteborg, Oslo, Copenhagen, Helsinki, Montréal, Wyszków") =>  ["Stockholm", "Malmö", "Göteborg", "Oslo", "Copenhagen", "Helsinki", "Montréal", "Wyszków"]', parseTowns("Stockholm, Malmö, Göteborg, Oslo, Copenhagen, Helsinki, Montréal, Wyszków"), ["Stockholm", "Malmö", "Göteborg", "Oslo", "Copenhagen", "Helsinki", "Montréal", "Wyszków"])
//     doTest('parseTowns("Truckee, CA Portland, OR, Durango, CO, Los Angeles, CA, Reno, NV, Oakland, CA, Seattle, WA") should return ["Truckee, CA","Portland, OR","Durango, CO","Los Angeles, CA","Reno, NV","Oakland, CA","Seattle, WA"]', parseTowns("Truckee, CA Portland, OR, Durango, CO, Los Angeles, CA, Reno, NV, Oakland, CA, Seattle, WA"), ["Truckee, CA", "Portland, OR", "Durango, CO", "Los Angeles, CA", "Reno, NV", "Oakland, CA", "Seattle, WA"]);
//     doTest('parseTowns("We are a collection of wayward mutts gathered from all over the country: Seattle, Salt Lake, Connecticut, Nantucket, New Jersey") should return ["Seattle", "Salt Lake", "Connecticut", "Nantucket", "New Jersey"]', parseTowns("We are a collection of wayward mutts gathered from all over the country: Seattle, Salt Lake, Connecticut, Nantucket, New Jersey"), ["Seattle", "Salt Lake", "Connecticut", "Nantucket", "New Jersey"]);
//     doTest('parseTowns("We have two hometowns: Los Angeles & Seattle") should return ["Los Angeles", "Seattle"]', parseTowns("We have two hometowns: Los Angeles & Seattle"), ["Los Angeles", "Seattle"]);
//     doTest('parseTowns("Woodstock NY to Arcata CA") should return ["Arcata CA", "Woodstock NY"]', parseTowns("Woodstock NY to Arcata CA"), ["Woodstock NY", "Arcata CA"]);
//     doTest('parseTowns("Seattle and LA / Pittsburgh") = ["Seattle", "LA", "Pittsburgh"]', parseTowns("Seattle and LA / Pittsburgh"), ["Seattle", "LA", "Pittsburgh"]);
//     doTest('parseTowns("Seattle and LA and Pittsburgh") is ["LA", "Seattle", "Pittsburgh"]', parseTowns("Seattle and LA and Pittsburgh"), ["Seattle", "LA", "Pittsburgh"]);
//     doTest('parseTowns("San Francisco, Los Angeles, Pittsburgh, Wellington, Montreal, Malme, Amsterdam, etc. We\'re spread all over."), ["San Francisco","Los Angeles","Pittsburgh","Wellington","Montreal","Malme","Amsterdam"]', parseTowns("San Francisco, Los Angeles, Pittsburgh, Wellington, Montreal, Malme, Amsterdam, etc. We're spread all over."), ["San Francisco", "Los Angeles", "Pittsburgh", "Wellington", "Montreal", "Malme", "Amsterdam"]);
//     doTest('parseTowns("We have several other group members from around the world to include, Australia, New Zealand, England, Japan other cities within the United States."), ["Australia","New Zealand","England","Japan", "United States"]', parseTowns("We have several other group members from around the world to include, Australia, New Zealand, England, Japan other cities within the United States."), ["Australia", "New Zealand", "England", "Japan", "United States"]);
//     doTest('parseTowns("West Coast U.S.A") => ["West Coast", "U.S.A"]', parseTowns("West Coast U.S.A"), ["West Coast", "U.S.A"]);
//     console.debug("All tests complete.");
// }
// testRun();



//const seeAll = () => R.map(R.compose(R.tap(console.log), R.map(toCanonicalName), parseTowns, R.tap(console.log)))(dummyData);
// const getSet = (data: string[]) => R.compose(R.sortBy((str: string) => str.toLowerCase()), R.uniq, R.map(toCanonicalName), R.flatten, R.map(parseTowns))(data);

const splitCityFromState = (str: string) => removeExpr(/,? *[A-Z].?[A-Z].*\b/, str);

const canonicalData: [string | Function, any[]][] = [
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

const toCanonicalName: any = (str: string, i: number = 0, j: number = 0) => {
    //console.log("toCanonical", i, j);
    if (i >= canonicalData.length) return str;
    const patterns = canonicalData[i][1];
    if (j >= patterns.length) return toCanonicalName(str, i + 1, 0);
    const pattern = patterns[j];
    const isMatch = typeof pattern == "string" ? str == pattern : RegExp(pattern).test(str);
    const canonical = canonicalData[i][0];
    //console.log("log:", str, isMatch, pattern, canonical)
    if (isMatch) {
        if (typeof canonical == "string") return canonical;
        return canonical(str);
    }
    return toCanonicalName(str, i, j + 1);

}
// // i >= canonicalData.length ? str :
// // j >= canonicalData[i].length ? toCanonicalName(str, i + 1, 0) :
// //     RegExp(<any>(canonicalData[i])[j]).test(str)? canonicalData[i][j] : toCanonicalName(str, i, j + 1);
// //writeAll(getSet(dummyData));
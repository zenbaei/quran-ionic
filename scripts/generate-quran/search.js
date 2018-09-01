module.exports = class Search {

    constructor(what, target) {
        this.what = what;
        this.target = target;
        this.search();
    }

    search() {
        //console.debug(`Search for [${this.what}] inside [${this.target}]`);
        let regex = new RegExp(this.what);
        this.match = regex.exec(this.target);
    }

    /**
     * The index of first character matching the search pattern.
     */
    first() {
        return this.match.index;
    }

    /**
     * The index of last character matching the search pattern.
     */
    last() {
        return this.first() + this.match[0].length - 1;
    }

    /**
     * Test whether there is a match.
     */
    test() {
        return this.match == null ? false : true;
    }

    /**
     * Returns the length of the matched string.
     */
    length() {
        return this.match[0].length;
    }

    /**
     * Retruns the matched string or empty string if there is no match.
     */
    group() {
        return this.match == null ? '' : this.match[0];
    }

    /** not tested */
    substring(source, search) {
        let from = search.first();// + 2;
        let to = search.length();// - 3;
        //console.debug(`Substring from [${from}] to [${to}] - source [${source}]`);
        return source.substr(from, to);
    }

}

export class Search {

    private match: RegExpExecArray;

    constructor(private what: string, private target: string) {
        this.search();
    }

    private search() {
        console.debug(`Search for [${this.what}] inside [${this.target}]`);
        let regex: RegExp = new RegExp(this.what);
        this.match = regex.exec(this.target);
    }

    /**
     * The index of first character matching the search pattern.
     */
    public first(): number {
        return this.match.index;
    }

    /**
     * The index of last character matching the search pattern.
     */
    public last(): number {
        return this.first() + this.match[0].length - 1;
    }

    /**
     * Test whether there is a match.
     */
    public test(): boolean {
        return this.match == null ? false : true;
    }

    /**
     * Returns the length of the matched string.
     */
    public length(): number {
        return this.match[0].length;
    }

    /**
     * Retruns the matched string or empty string if there is no match.
     */
    public group(): string {
        return this.match == null ? '' : this.match[0];
    }

    /** not tested */
    public static substring(source: string, search: Search): string {
        let from: number = search.first();// + 2;
        let to: number = search.length();// - 3;
        console.debug(`Substring from [${from}] to [${to}] - source [${source}]`);
        return source.substr(from, to);
    }

}
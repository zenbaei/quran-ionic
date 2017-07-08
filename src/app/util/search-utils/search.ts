export class Search {

    private match: RegExpExecArray;

    constructor(private pattern: string, private source: string) {
        this.search();
    }

    private search() {
        console.debug(`Search for [${this.pattern}] inside [${this.source}]`);
        let regex: RegExp = new RegExp(this.pattern);
        this.match = regex.exec(this.source);
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
     * Retruns the matched string.
     */
    public group(): string {
        return this.match[0];
    }

}
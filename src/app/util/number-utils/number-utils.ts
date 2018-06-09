
export class NumberUtils {

    /**
     * Tests value is inclusively between the 2 values.
     * 
     * @param value 
     * @param min 
     * @param max 
     */
    public static isBetween(value: number, min: number, max: number): boolean {
        //console.debug(`Is between: ${value} - min: ${min} - max: ${max}`)
        if (value >= min && value <= max) {
            return true;
        }
        return false;
    }

    public static toPrecision(value: number, precision: number): number {
        //console.debug(`To precision: ${value} - precision: ${precision}`);
        return Number(value.toPrecision(precision));
    }
}
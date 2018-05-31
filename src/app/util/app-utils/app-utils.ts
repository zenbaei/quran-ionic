import { ScreenOrientation } from '@ionic-native/screen-orientation';

export class AppUtils {

    private static readonly FIRST_PAGE = 1;
    private static readonly LAST_PAGE = 604;

    public static isValidPageNumber(pageNumber: number): boolean {
        if (!pageNumber || pageNumber < this.FIRST_PAGE || pageNumber > this.LAST_PAGE) {
            return false;
        }
        return true;
    }

    public static toBoolean(val: string): boolean {
        if (val === null) {
            return null;
        } else if (val === 'false') {
            return false;
        }
        return true;
    }

    /**
     * Must use mobile mode in browser or it'll give wrong results.
     * 
     * @param orientation 
     */
    public static isPortrait(orientation: ScreenOrientation): boolean {
        if (orientation.type === orientation.ORIENTATIONS.PORTRAIT ||
            orientation.type === orientation.ORIENTATIONS.PORTRAIT_PRIMARY ||
            orientation.type === orientation.ORIENTATIONS.PORTRAIT_SECONDARY) {
            console.debug(`Orientation is: Portrait`);
          return true;
        }
        console.debug(`Orientation is: Landscape`);
        return false;
      }

    public static isLandscape(): boolean {
        console.log(`Window orientation ${window.orientation}`);
        if (window.orientation === 'Landscape') {
            console.log(`Orientation is: Landscape`);
            return true;
        }
        console.log(`Orientation is: Portrait`);
        return false;
    }

    public static matchMediaIsPortrait(): boolean {
        if (window.matchMedia('screen and (orientation: portrait)')) {
            console.log(`Orientation is: Portrait`);
            return true;
        }
        console.log(`Orientation is: Landscape`);
        return false;
    }
}
import { ScreenOrientation } from '@ionic-native/screen-orientation';

export class AppUtils {

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
            //console.debug(`Orientation is: Portrait`);
          return true;
        }
        //console.debug(`Orientation is: Landscape`);
        return false;
      }
    
    public static isProtraitWindow(): boolean {
        console.log(`Window orientation ${window.orientation}`);
        if (window.orientation === 'Portrait') {
            console.log(`Orientation is: Portrait`);
            return true;
        }
        console.log(`Orientation is: Landscape`);
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
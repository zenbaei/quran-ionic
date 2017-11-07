import { Search } from "./search";

describe('Search', () => {

    let content: string = 'my name is islam';

    it('Given a content to search is provided When first method is called Then it should return first index of the matched string', () => {
        let search: Search = new Search('na', content);
        let first: number = search.first();
        expect(first).toEqual(3);
    })

    it('Given a content to search is provided When last method is called Then it should return last index of the matched string', () => {
        let search: Search = new Search('na', content);
        let last: number = search.last();
        expect(last).toEqual(4);
    })

    it(`Given a content to search is provided When substring is called with first and last methods 
       Then it should return the `, () => {        
        let search: Search = new Search('na', content);
        let first: number = search.first();
        let subString: string = content.substr(first, 'na'.length);
        expect(subString).toEqual('na');
    })

    it(`Given a content to search is provided When there is a search match Then test should return true `, () => {        
        let search: Search = new Search('na', content);
        expect(search.test()).toBeTruthy();
    })


    it(`Given a content to search is provided When there is no search match Then test should return true `, () => {        
        let search: Search = new Search('zen', content);
        expect(search.test()).toBeFalsy();
    })

    it(`Given a content to search is provided When length is called Then it should retrun the matching string length`, () => {        
        let search: Search = new Search('name', content);
        expect(search.length()).toEqual(4);
    })

    it(`Given a content to search is matched When group is called Then it should retrun the matching string`, () => {
        let search: Search = new Search('na..', content);
        expect(search.group()).toEqual('name');
    })

    it(`Given an arabic content with regex metacharacter is given When group is called Then it should retrun the matched string`, () => {
        let content: string = `اسلام 
ابراهيم زنباعي`;
        let textToSearch: string = `اسلام \nابراهيم`;
        let search: Search = new Search(textToSearch, content);
        expect(search.test()).toBeTruthy();
    })

});
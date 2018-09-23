var quranMarkup = require('./quran-markup');

const str = `<a data-content='we are moving'>islam</a> ibrahim zenbaei
don't <a data-content='we are moving'>be</a> mistaken
<a data-content='hey mr right'>hey</a> you <a data-content='hey mr left'>hey</a>`;

const expected = `<div style='align: right'><a data-content='we are moving'>islam</a></div> ibrahim <div style='align: left'>zenbaei</div>
<div style='align: right'>don't</div> <a data-content='we are moving'>be</a> <div style='align: left'>mistaken</div>
<div style='align: right'><a data-content='hey mr right'>hey</a></div> you <div style='align: left'><a data-content='hey mr left'>hey</a></div>`;

const str2 = `<a data-content`;
const expected2 = `<a data-content='وفّقنا للثّبات على الطريق الواضح الذي لا اعوجاج فيه وهو الإسلام' tabindex='0' role='button' class='fake-link tafsir' data-toggle='popover' data-placement='top'>ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ</a> ٦ صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ `
function testSurrondFirstAndLastWordInDiv() {
    var result = quranMarkup.surrondFirstAndLastWordInDiv(str);
    assertEquals(result, expected); //new line \n making it not identical!!!
}

function assertEquals(value, expected) {
    if (value != expected) {
        throw new Error(`Expected:\n ${expected} \nBut got:\n ${value}`);
    }
}

(function start() {
    testSurrondFirstAndLastWordInDiv();
})();
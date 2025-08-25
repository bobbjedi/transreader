const cheerio = require('cheerio');

const letters = [
  "ab","ac","ad","ae","af","ag","ah","ai","aj","ak","al","am","an","ao","ap","aq","ar","as","at","au","av","aw","ax","ay","az","aa",
  "be","bh","bi","bl","bo","br","bu","by","ba","bd","bv",
  "ca","ce","ch","ci","cl","co","cr","ct","cu","cy","cz","cd","cc","cs","cp","cn",
  "da","de","dh","di","do","dr","du","dw","dy","df","dn","dj","dz",
  "ea","eb","ec","ed","ee","ef","eg","eh","ei","ej","ek","el","em","en","eo","ep","eq","er","es","et","eu","ev","ew","ex","ey","ez",
  "fa","fe","fi","fl","fo","fr","fu","fy","fj",
  "ga","ge","gh","gi","gl","gn","go","gr","gu","gy","gd","gw",
  "ha","he","hi","ho","hu","hy",
  "ia","ib","ic","id","if","ig","ik","il","im","in","io","ip","ir","is","it","iv","ie","iq","ih","ij","iw","iz",
  "ja","je","ji","jo","ju",
  "ka","ke","kh","ki","kl","kn","ko","kr","ku","ky","kc","kv","ks","kw",
  "la","le","li","ll","lo","lu","ly","lh","lj","ls","lv",
  "ma","me","mh","mi","mn","mo","mu","my","mp","mr","mm","mb","mc","mw",
  "na","ne","ni","no","nt","nu","ny","ng",
  "oa","ob","oc","od","oe","of","og","oh","oi","ok","ol","om","on","oo","op","or","os","ot","ou","ov","ow","ox","oy","oz",
  "pa","pe","pf","ph","pi","pl","pn","po","pr","ps","pt","pu","py","pw","pc","pm","pd",
  "qu","qa",
  "ra","re","rh","ri","ro","ru","ry","rn","rw",
  "sa","sc","se","sg","sh","si","sj","sk","sl","sm","sn","so","sp","sq","st","su","sv","sw","sy","sf","sr","sz",
  "ta","te","th","ti","tm","to","tr","ts","tu","tw","ty","tz","tc","tb","tv",
  "ub","ud","ug","uh","ui","uk","ul","um","un","up","ur","us","ut","uv","ux","uz","uf","ua","uc","ue",
  "va","ve","vi","vo","vu","vy","vl","vr",
  "wa","we","wh","wi","wo","wr","wy","wu",
  "xa","xe","xi","xm","xy","xx",
  "ya","yc","ye","yi","yo","yt","yu","yl","yp",
  "za","ze","zi","zo","zu","zy","zh","zl","zw"
];

console.log(letters.length); // проверка количества элементов



// Массив букв/подстрок, которые были в меню
const sections = ["ha","he","hi"];

const dictionary = [];

async function fetchSection(section) {
  const url = `https://wooordhunt.ru/dic/list/en_ru/${section}`;
  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);

  $('#content p').each((i, el) => {
    const a = $(el).find('a');
    if (!a) return;
    const word = a.text().trim();
    let translation = $(el).text().trim();
    translation = translation.replace(word, '').replace(/^[-—\s]+/, '').trim();
    dictionary.push({ word, translation });
  });
}

async function main() {
  for (const section of sections) {
    console.log('Fetching section:', section);
    try {
      await fetchSection(section);
    } catch (e) {
      console.error('Error fetching', section, e);
    }
    await new Promise(r => setTimeout(r, 500)); // пауза между запросами
  }

  console.log('Done. Total words:', dictionary.length);
  console.log(dictionary);

  // fs.writeFileSync('dictionary.json', JSON.stringify(dictionary, null, 2));
}

main();

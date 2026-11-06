// Season stage outranks team/ranking preferences; explicit stars remain pinned.
const numberedSeasons=new Set(['MLB','NFL','NBA','NHL','College Football','College Basketball']);
const preseasonPattern=/\b(pre[\s-]?season|exhibition|spring training|friendly)\b/i;
const postseasonPattern=/\b(post[\s-]?season|play[\s-]?offs?|wild[\s-]?card|[AN]L[CD]S|world series|stanley cup|super bowl|MLS cup|conference (?:championship|tournament)|NCAA tournament|march madness|final four|sweet (?:16|sixteen)|elite (?:8|eight))\b/i;
export function seasonStage(game){
 const seasonText=game.seasonSlug||'';
 // Older cached briefings stored specific event notes in details.implications.
 const cachedNote=game.details?.implications||'';
 const note=game.stageNote??(/^Precise playoff|^Sample context/i.test(cachedNote)?'':cachedNote);
 if(game.preseason||preseasonPattern.test(seasonText+' '+note)||(numberedSeasons.has(game.league)&&Number(game.seasonType)===1))return 'preseason';
 if(game.postseason||postseasonPattern.test(seasonText+' '+note)||(numberedSeasons.has(game.league)&&Number(game.seasonType)===3))return 'postseason';
 return 'regular';
}
export function seasonImportance(game){return {postseason:0,regular:1,preseason:2}[seasonStage(game)]}
export function compareGames(a,b,{favorites,priority}){
 return Number(favorites.has(b.id))-Number(favorites.has(a.id))||seasonImportance(a)-seasonImportance(b)||priority(a)-priority(b)||Date.parse(a.start)-Date.parse(b.start);
}

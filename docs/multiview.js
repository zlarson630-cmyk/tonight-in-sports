import {compareGames,seasonStage} from './ranking.js';
// Base-plan channels plus ESPN+ events included through ESPN Unlimited.
// Other standalone services and paid add-ons remain excluded.
// Local affiliate carriage was checked separately for ZIP 61109.
export const channelAliases={
 ESPN:['ESPN'],'ESPN+':['ESPN+','ESPN PLUS'],ESPN2:['ESPN2','ESPN 2'],ESPNU:['ESPNU','ESPN U'],ESPNEWS:['ESPNEWS','ESPN NEWS'],
 FS1:['FS1','FOX SPORTS 1'],FS2:['FS2','FOX SPORTS 2'],BTN:['BTN','BIG TEN NETWORK'],
 'SEC Network':['SEC NETWORK','SECN','SEC ESPN NETWORK'],'ACC Network':['ACC NETWORK','ACCN','ACC ESPN NETWORK'],
 'CBS Sports Network':['CBS SPORTS NETWORK','CBSSN'],
 TBS:['TBS'],TNT:['TNT'],truTV:['TRUTV','TRU TV'],'NBA TV':['NBA TV','NBATV'],'NFL Network':['NFL NETWORK','NFL NET'],
 'NBC Sports Network':['NBCSN','NBC SPORTS NETWORK'],'TUDN':['TUDN'],'UniMas':['UNIMAS'],'Univision':['UNIVISION'],'Telemundo':['TELEMUNDO'],USA:['USA','USA NETWORK','USA NET'],ABC:['ABC','WTVO','CHANNEL 17'],CBS:['CBS','WIFR','23 WIFR'],NBC:['NBC','WREX','13 WREX'],FOX:['FOX','WQRF','FOX 39'],
 'Golf Channel':['GOLF CHANNEL','GOLF']
};
export const baseChannels=Object.keys(channelAliases);
const norm=s=>String(s).trim().toUpperCase().replace(/\s+/g,' ');
const lookup=new Map(Object.entries(channelAliases).flatMap(([channel,names])=>names.map(name=>[norm(name),channel])));
export function carriedChannels(game,channels=baseChannels){const allowed=new Set(channels);return [...new Set((game.network||'').split(/\s*[·,;|]\s*/).map(n=>lookup.get(norm(n))).filter(c=>c&&allowed.has(c)&&!(game.league==='NFL'&&['CBS','FOX'].includes(c)&&seasonStage(game)!=='postseason')))]}
export function centralMinutes(iso){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso));return Number(parts.find(x=>x.type==='hour').value)*60+Number(parts.find(x=>x.type==='minute').value)}
const durations={'MLB':210,'NFL':210,'NBA':165,'NHL':180,'AHL':180,'College Football':240,'College Basketball':150,'MLS':135,'Premier League':135};
// At most one game per linear channel; ESPN+ events are separate streams.
// Reassign earlier choices where a simulcast
// makes room for a lower-priority game without displacing a higher-priority one.
function assign(games,channels){const owners=new Map(),byGame=new Map();function visit(game,seen){for(const channel of carriedChannels(game,channels)){const stream=channel==='ESPN+'?`${channel}:${game.id}`:channel;if(seen.has(stream))continue;seen.add(stream);const owner=owners.get(stream);if(!owner||visit(owner,seen)){owners.set(stream,game);byGame.set(game.id,channel);return true}}return false}for(const game of games)if(!visit(game,new Set()))return null;return byGame}
export function recommendMultiview(games,{favorites=new Set(),priority=()=>0,channels=baseChannels,time='19:00',now=Date.now(),today=false}={}){
 const [h,m]=time.split(':').map(Number),target=h*60+m;if(!Number.isFinite(target))return [];
 const currentMinutes=centralMinutes(now),nearNow=today&&Math.abs(currentMinutes-target)<=15;
 const candidates=games.filter(g=>{const resumable=g.status==='interrupted'&&/delay|suspend/i.test((g.statusName||'')+' '+(g.clock||''));if(g.status==='final'||(g.status==='interrupted'&&!resumable)||g.terminal||!carriedChannels(g,channels).length)return false;const start=centralMinutes(g.start),estimatedEnd=start+(durations[g.league]||180);return (nearNow&&(g.status==='live'||(resumable&&start<=target)))||(start<=target&&target<estimatedEnd)}).sort((a,b)=>compareGames(a,b,{favorites,priority}));
 const selected=[];let assigned=new Map();for(const game of candidates){const next=assign([...selected,game],channels);if(next){selected.push(game);assigned=next}if(selected.length===4)break}
 return selected.map(game=>({game,channel:assigned.get(game.id),estimated:game.status!=='live'||!nearNow}));
}

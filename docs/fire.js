import {seasonImportance} from './ranking.js';
import {carriedChannels} from './multiview.js';
const limits={NBA:{period:4,seconds:300,margin:6},'College Basketball':{period:2,seconds:300,margin:6},NHL:{period:3,seconds:600,margin:1},AHL:{period:3,seconds:600,margin:1},NFL:{period:4,seconds:300,margin:8},'College Football':{period:4,seconds:300,margin:8}};
export function goodFinish(game,{now=Date.now(),live=false,visible=true,maxAge=120000}={}){
 if(!live||!visible||game.status!=='live'||game.terminal)return null;
 const age=now-Date.parse(game.scoreCheckedAt);if(!Number.isFinite(age)||age<0||age>=maxAge)return null;
 if(!Array.isArray(game.scores)||game.scores.length!==2||game.scores.some(x=>!Number.isFinite(x)))return null;
 const margin=Math.abs(game.scores[0]-game.scores[1]),period=game.realtime?.period,seconds=game.realtime?.seconds;
 let reason='',heat=2;
 const rule=limits[game.league];
 if(rule){if(!Number.isFinite(period)||margin>rule.margin)return null;const overtime=period>rule.period;if(!overtime&&(period!==rule.period||!Number.isFinite(seconds)||seconds>rule.seconds||seconds<0))return null;heat=overtime||seconds<=120?3:2;reason=overtime?'Overtime':['NHL','AHL'].includes(game.league)?'Final 10 minutes': 'Final 5 minutes';}
 else if(game.league==='MLB'){if(!Number.isFinite(period)||period<8||margin>2)return null;reason=period>9?'Extra innings':`${period}th inning`;heat=period>=9?3:2;}
 else if(['MLS','Premier League'].includes(game.league)){if(!Number.isFinite(seconds)||seconds<80*60||margin>1)return null;reason='80th minute onward';heat=seconds>=85*60?3:2;}
 else return null;
 return {game,margin,heat,reason,close:margin===0?'Tied':`${margin}-${['NBA','College Basketball','NFL','College Football'].includes(game.league)?'point':game.league==='MLB'?'run':'goal'} game`};
}
export function finishAlerts(games,options={}){
 return games.map(game=>goodFinish(game,options)).filter(Boolean).map(alert=>({...alert,channels:carriedChannels(alert.game,options.channels)})).sort((a,b)=>Number(!!b.channels.length)-Number(!!a.channels.length)||seasonImportance(a.game)-seasonImportance(b.game)||b.heat-a.heat||a.margin-b.margin||Number(options.favorites?.has(b.game.id)||false)-Number(options.favorites?.has(a.game.id)||false)).slice(0,4);
}

// Schedule result scores are stored from the named team's perspective.
// This also formats older cached results without another sports-data request.
export function meetingResult(teamName,result){
 const parts=String(result.score||'').split(/\s*[–—-]\s*/);
 const scoreline=parts.length===2?`${teamName} ${parts[0]} — ${result.opponent} ${parts[1]}`:`${teamName} vs ${result.opponent} · ${result.score||'Score unavailable'}`;
 const outcome=result.outcome==='W'?`${teamName} won`:result.outcome==='L'?`${result.opponent} won`:result.outcome==='D'?'Draw':'Result unavailable';
 return `${scoreline} · ${outcome}`;
}

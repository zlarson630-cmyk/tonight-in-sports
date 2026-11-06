// Public, read-only bridge to one fixed official schedule. No database or secrets.
const allowedOrigins = new Set(['https://zlarson630-cmyk.github.io', 'http://127.0.0.1:8766', 'http://localhost:8766']);
let snapshot = null;
let pending = null;
function extractSchedule(html){
 const start=html.indexOf('{"events":');if(start<0)throw new Error('Schedule unavailable');
 let depth=0,quoted=false,escaped=false;
 for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue}if(c==='"'){quoted=true;continue}if(c==='{'||c==='[')depth++;if(c==='}'||c===']'){depth--;if(depth===0){const data=JSON.parse(html.slice(start,i+1));if(!Array.isArray(data.events))throw new Error('Schedule unavailable');return data.events.map(e=>{const item={};for(const key of ['id','title','smTitle','time','score','isHomeGame','isFinal','ifNecessary','description','location'])item[key]=e[key];item.links={watch:e.links?.watch,audio:e.links?.audio};return item})}}}
 throw new Error('Schedule unavailable');
}
Deno.serve(async request => {
  const origin = request.headers.get('Origin');
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if(origin && allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin']=origin;
  if(origin && !allowedOrigins.has(origin)) return new Response(JSON.stringify({error:'Origin not allowed'}),{status:403,headers});
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info'}});
  if(request.method!=='GET') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
  try {
    if(!snapshot || Date.now()-snapshot.at>=60000){
      if(!pending)pending=(async()=>{
        const response=await fetch('https://icehogs.com/schedule/',{signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw new Error('Schedule unavailable');
        const html=await response.text();if(html.length>4000000)throw new Error('Schedule too large');
        snapshot={at:Date.now(),body:JSON.stringify({events:extractSchedule(html),source:'https://icehogs.com/schedule/'})};
      })().finally(()=>{pending=null});
      await pending;
    }
    return new Response(snapshot.body,{headers});
  }catch{return new Response(JSON.stringify({error:'Official IceHogs schedule is temporarily unavailable'}),{status:502,headers})}
});

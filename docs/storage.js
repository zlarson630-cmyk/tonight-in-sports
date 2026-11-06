const memory=new Map();
export function read(key,fallback=null){try{const value=localStorage.getItem(key);return value===null?(memory.get(key)??fallback):JSON.parse(value)}catch{return memory.get(key)??fallback}}
export function write(key,value){memory.set(key,value);try{localStorage.setItem(key,JSON.stringify(value))}catch{/* Browser storage can be unavailable; keep this session usable. */}}
export function cached(key,maxAge){const entry=read(key);return entry&&Date.now()-entry.savedAt<maxAge?entry.value:null}
export function saveCache(key,value){write(key,{savedAt:Date.now(),value})}

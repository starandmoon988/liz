/* Pure domain functions, shared by the browser and node:test. */
(function(root){
'use strict';
const TOKEN=/^[A-Za-z]+(?:[-'’][A-Za-z]+)*$/;
const UI=new Set('review reviewed learn learned learning words vocabulary today yesterday tomorrow next back home settings search start continue cancel done daily streak level progress pronunciation meaning definition example examples test quiz flashcards list import export delete edit select selected all none'.split(' '));
function normalize(s){return String(s||'').normalize('NFKC').replace(/’/g,"'").trim()}
function parseWords(text){const words=[],rejected=[],seen=new Set();for(const line of String(text).split(/\r?\n/)){const w=normalize(line);if(!w)continue;if(!TOKEN.test(w)||w.length>60){rejected.push(w);continue}const key=w.toLowerCase();if(!seen.has(key)){seen.add(key);words.push(key)}}return {words,rejected}}
function extract(data,file=0){
 let lines=data.lines;
 if(!lines?.length)lines=(data.blocks||[]).flatMap(b=>(b.paragraphs||[]).flatMap(p=>p.lines||[]));
 // Plain text has lost layout and confidence: require manual review of every row.
 if(!lines?.length)lines=String(data.text||'').split(/\r?\n/).map(text=>({text,words:[],plain:true}));
 const out=[];
 for(const line of lines){
  let words=line.words||[];
  if(!words.length){const lead=String(line.text||'').trim().match(/^(?:\d+[.)、]?\s*)?([A-Za-z]+(?:[-'’][A-Za-z]+)*)/);if(lead)words=[{text:lead[1],confidence:0,bbox:line.bbox}]}
  // Only the first lexical token in a visual row is eligible. Additional columns
  // require a separate crop, because a gloss and a second headword look alike.
  let first=words.find(w=>!/^\d+[.)]?$/.test(String(w.text||'').trim()));if(!first)continue;
  const text=normalize(first.text);if(!TOKEN.test(text)||text.length>60)continue;
  const confidence=Number.isFinite(Number(first.confidence))?Number(first.confidence):0;
  const reason=UI.has(text.toLowerCase())?'ui':confidence<85?'confidence':text.length===1?'short':'';
  out.push({word:text.toLowerCase(),source:text,file,confidence,box:first.bbox||line.bbox||null,reason,selected:!reason});
 }
 const unique=new Map();for(const row of out){const prior=unique.get(row.word);if(!prior||row.confidence>prior.confidence)unique.set(row.word,row)}return [...unique.values()];
}
function shuffle(xs,random=Math.random){const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeQuiz(records,mode){
 if(mode==='spell')return shuffle(records).map(r=>({word:r.word,answer:r.word,mode}));
 return shuffle(records).map(r=>{const pool=records.filter(x=>x.word!==r.word&&x.definition!==r.definition&&x.pos===r.pos);if(pool.length<3)pool.push(...records.filter(x=>x.word!==r.word&&x.definition!==r.definition));const defs=[...new Set(shuffle(pool).map(x=>x.definition))].slice(0,3);if(defs.length<1)return null;return {word:r.word,answer:r.definition,pos:r.pos,options:shuffle([r.definition,...defs]),mode}}).filter(Boolean);
}
function grade(answer,given){return normalize(answer).toLowerCase()===normalize(given).toLowerCase()}
function recordAnswer(progress,word,ok,now=Date.now()){
 const p=Object.hasOwn(progress,word)?progress[word]:{attempts:0,correct:0,lapses:0,streak:0};p.attempts++;p.correct+=Number(ok);p.lapses+=Number(!ok);p.streak=ok?p.streak+1:0;p.last=now;
 const days=ok?[1,3,7,14,30,60][Math.min(p.streak-1,5)]:0;p.due=now+(ok?days*86400000:600000);progress[word]=p;return p;
}
const api={parseWords,extract,shuffle,makeQuiz,grade,recordAnswer};if(typeof module!=='undefined')module.exports=api;else root.WordLabCore=api;
})(typeof window!=='undefined'?window:globalThis);

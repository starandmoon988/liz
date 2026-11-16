const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);scripts.forEach(s=>new vm.Script(s));
const elements={},storage={},spoken=[];let currentIds=new Set(),optionNodes=[],mainButtons=[];
function element(id){
 if(elements[id])return elements[id];
 const classes=new Set();let markup='';
 const e={id,tagName:'DIV',type:'',value:'',textContent:'',disabled:false,dataset:{},get innerHTML(){return markup},set innerHTML(v){markup=v;if(id==='main'){currentIds=new Set([...v.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));for(const m of v.matchAll(/id="([^"]+)"[^>]*class="([^"]+)"|class="([^"]+)"[^>]*id="([^"]+)"/g)){const target=element(m[1]||m[4]);target.classList.clear();for(const cl of (m[2]||m[3]).split(' '))target.classList.add(cl)}optionNodes=[...v.matchAll(/class="opt" id="(opt\d+)"/g)].map(x=>element(x[1]));mainButtons=[];}},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),clear:()=>classes.clear(),toggle(x,on){if(on)classes.add(x);else classes.delete(x)}},addEventListener(){},append(){},replaceChildren(){},focus(){doc.activeElement=e},closest(selector){return selector==='#main'&&(id==='spell'||id.startsWith('opt')||id==='submit'||id==='next')?element('main'):null},querySelector(sel){if(sel==='section.panel')return {remove(){}};if(sel==='.muted')return element('span-'+id);return null},insertAdjacentHTML(where,text){markup=where==='afterbegin'?text+markup:markup+text},getAttribute(){return ''},remove(){}};
 elements[id]=e;return e;
}
const doc={body:element('body'),activeElement:null,getElementById(id){if(['submit','next','spell','translation-status'].includes(id)&&!currentIds.has(id))return null;return element(id)},querySelector:()=>element('header'),querySelectorAll(sel){if(sel.includes('input[name=multi]'))return checked.map(value=>({value:String(value)}));if(sel.includes('button'))return mainButtons;if(sel.includes('.opt'))return optionNodes;return []},addEventListener(){}};let checked=[];
const ctx=vm.createContext({document:doc,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=String(v)},window:{},Date,Math,Map,Set,console,setTimeout,clearTimeout,AbortController,TextEncoder,alert(){},fetch:async(url)=>url.includes('dictionaryapi')?{ok:true,json:async()=>[{word:'bind',phonetic:'/baɪnd/',meanings:[{partOfSpeech:'verb',definitions:[{definition:'To tie together.',example:'Please bind the pages together.'}]}]}]}:{ok:true,json:async()=>[[['捆绑在一起。','To tie together.']]]}});
for(const s of scripts)vm.runInContext(s,ctx);
vm.runInContext('speak=w=>spoken.push(w)',vm.createContext({}));
ctx.spoken=spoken;vm.runInContext('speak=w=>spoken.push(w)',ctx);
const run=s=>vm.runInContext(s,ctx),get=s=>run(s);
function enter(target,extra={}){ctx.keyEvent={key:'Enter',target,preventDefault(){this.prevented=true},...extra};run('handleQuizEnter(keyEvent)')}
(async()=>{
 for(let level=1;level<=5;level++){
  run('practiceSet='+level+';activePracticePage=0;build(1)');assert.equal(get('quiz.length'),40);const meanings=Array.from(get('quiz.map(q=>q.w)'));
  run('build(2)');assert.equal(get('quiz.length'),10);assert(get('quiz.every(q=>q.type==="spell")'));
  run('build(3)');assert.equal(get('quiz.length'),10);const contexts=Array.from(get('quiz.map(q=>q.w)'));assert.equal(new Set([...meanings,...contexts]).size,50);
  for(const q of get('quiz')){if(q.type==='single'){assert.equal(new Set(q.opts).size,q.opts.length);assert(q.a>=0&&q.a<q.opts.length)}if(q.type==='multi')assert(q.a.length>0);}
 }
 run("practiceSet=3;const item=BASE_WORDS[0];const prior=exerciseContext(item,0);const nextVersion=exerciseContext(item,0);this.first=prior;this.second=nextVersion");
 const first=ctx.first,second=ctx.second;assert(first.opts.filter(x=>x!==first.opts[first.a]&&!second.opts.includes(x)).length>=2,'At least two distractors must change');
 run('practiceSet=1;build(1)');assert(spoken.length);run('choose(quiz[0].a)');const before=get('idx');enter(element('opt0'));assert.equal(get('locked'),true);assert.equal(get('idx'),before);const records=get('db.history.length');enter(element('opt0'));assert.equal(get('idx'),before+1);assert.equal(get('db.history.length'),records);enter(element('opt0'),{repeat:true});assert.equal(get('idx'),before+1);enter(element('opt0'),{isComposing:true});assert.equal(get('idx'),before+1);
 run('practiceSet=2;build(1)');const speechCount=spoken.length;run('choose(quiz[0].a);submit()');assert.equal(spoken.length,speechCount+1,'Reverse questions speak after submission');
 run('practiceSet=1;db.attempts.heal=1;db.errors.heal={word:"heal",misses:2,pending:2};');element('shot-text').value='bind\nissue';await run('generateShotQuiz()');assert.equal(get('stage'),1);assert.equal(get('quiz.length'),2);assert(get('WORDS.find(x=>x.w==="bind").cnDefinition').includes('捆绑'));assert(get('quiz.find(x=>x.w==="bind").optionTranslations.some(Boolean)'));
 run('build(2)');element('spell').value=get('quiz[0].a');element('spell').tagName='INPUT';enter(element('spell'));assert.equal(get('locked'),true);const at=get('idx');enter(element('spell'));assert.equal(get('idx'),at+1);
 run('build(3);results=quiz.map(()=>true);idx=quiz.length;finish()');assert.equal(get('stage'),4);assert(get('quiz.some(q=>q.w==="heal")'));assert(!get('quiz.some(q=>["bind","issue"].includes(q.w))'));
 run('screenshotBatch=BASE_WORDS.concat(BASE_WORDS);activePracticePage=0;stage=3;results=[true];finish()');assert.equal(get('activePracticePage'),1);assert.equal(get('stage'),1);
 assert(!html.includes('function startShotRound'));assert(html.includes('第5套'));
 console.log('PASS: all five 40/10/10 sets, full 50-word coverage, changing multiple distractors, bilingual dictionary definitions, Enter-submit/next, repeat and IME guards, autoplay/deferred speech, new-before-old review, multi-page batches.');
})().catch(e=>{console.error(e);process.exitCode=1});

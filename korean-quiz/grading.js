// Bounded local-correction grading: reviewed variants, not an unrestricted semantic grader.
function normalizeEdit(t){return t.normalize('NFC').replace(/\s+/g,'').replace(/[.!?。！？]/g,'')}
function acceptedEdits(q){
 const refs=[q.unchanged?q.translation:q.translation.replace(q.before,q.after)];
 const endings={e1:['단축되었다','단축됐습니다','단축되었습니다','줄었다','줄었습니다','줄어들었다','줄어들었습니다'],e2:[],e6:['계획하십시오','계획해 주세요','계획해 주십시오','계획해 주시기 바랍니다','계획하시기 바랍니다','계획하기 바랍니다','짜세요','짜십시오','짜 주세요','짜 주십시오','세우세요','세우십시오','세워 주세요','수립하세요','수립하십시오','수립해 주세요']};
 if(endings[q.id])for(const e of endings[q.id])refs.push(q.translation.replace(q.before,e));
 if(q.id==='e2')refs.push(q.translation.replace('후까지','이전까지'));
 if(q.id==='e4')refs.push('학생 세 명이 오늘 행사에 참가했다.');
 if(q.id==='e5')refs.push('해당 기관은 처리 시간을 단축했다.','해당 기관이 처리 시간을 단축하였다.','해당 기관은 처리 시간을 단축하였다.','해당 기관에서 처리 시간을 단축했다.');
 return new Set(refs.map(normalizeEdit));
}
function gradeCorrection(q,a){
 let patched=q.translation;
 if(!a.unchanged)for(const r of a.rows||[])patched=patched.replace(r.before,r.after);
 const correct=acceptedEdits(q).has(normalizeEdit(patched));
 let diagnosis=(correct&&!q.unchanged?'已修正原译问题。':'')+q.problem;
 if(!correct){
  if(a.unchanged&&!q.unchanged)diagnosis='选了“无需修改”，原译的问题仍保留。'+q.problem;
  else if(q.unchanged)diagnosis='原译成立；本次改动未通过本题局部改错规则。'+q.problem;
  else diagnosis='修订未通过本题局部改错规则。'+q.problem;
 }
 return {correct,diagnosis,patched,method:'reviewed-local-variants-v4'};
}
if(typeof module!=='undefined')module.exports={normalizeEdit,acceptedEdits,gradeCorrection};

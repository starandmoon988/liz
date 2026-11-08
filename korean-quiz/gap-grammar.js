const grammarDrills={
'G01-主谓与自动他动':['빈칸에 들어갈 조합으로 자연스러운 것은? “기관은 처리 시간___ 단축했다. 그 결과 처리 시간___ 단축됐다.”',['이 / 을','을 / 이','을 / 을','이 / 이'],1,'단축하다는 목적어 시간을을 취하고, 단축되다는 시간이를 주어로 취한다.'],
'G02-固有数词修饰形态':['빈칸을 바르게 채운 것은? “손님 ___ 명에게 사과 ___ 개씩 드렸다. 손님 중 가장 어린 사람은 ___ 살이다.”',['셋 / 하나 / 스물','세 / 하나 / 스무','세 / 한 / 스무','셋 / 한 / 스무'],2,'셋→세, 하나→한, 스물→스무：单位前的固有数词修饰形态要一起记。'],
e2:['“접수는 출발 2시간 전부터 시작하며, 출발 30분 전까지 마친다.”와 같은 뜻은?',['시작과 마감이 모두 출발 후이다.','출발 전 2시간이 시작점이고 전 30분이 마감점이다.','전부터와 전까지는 모두 같은 마감점이다.','출발 30분 뒤부터 접수한다.'],1,'부터标起点，까지标终点；两者都可与전组合，不能只认전而忽略起止关系。'],
e3:['“신청했다고 해서 승인된 것은 아니다.”에 맞는 설명은?',['신청과 승인은 반드시 동시에 끝난다.','신청자는 승인받을 수 없다.','신청 사실만으로 승인까지 받았다고 볼 수 없다.','승인을 받으면 신청을 할 수 없다.'],2,'-다고 해서 … 것은 아니다否定的是推断，不是断言某件事绝不可能。'],
c4:['日常会话中读出4点20分，哪项最自然？',['넷 시 스무 분','네 시 이십 분','사 시 스무 분','넷 시 이십 분'],1,'时刻的小时通常用固有数词修饰形，分钟用汉字数词。'],
r2c5:['“직원___ 절차___ 문의했다.”의 조사 조합으로 알맞은 것은?',['을 / 에게','에게 / 를','를 / 에게','에게 / 에'],1,'문의하다的询问对象是人时用에게，询问内容用을／를。'],
r2c2:['自然的主语与谓语组合是哪一项？',['신청자가 요건을 충족한다.','신청자를 요건이 충족한다.','신청자가 요건을 충족된다.','요건을 신청자가 충족된다.'],0,'충족하다接요건을；从条件被满足的视角可用요건이 충족되다。']
};
function hasGrammarDrill(parent){return !!grammarDrills[knowledgeId(parent)]}
function makeGrammarVariant(parent,attempt){const t=grammarDrills[knowledgeId(parent)],v=makeVariant(parent,attempt);v.id+='-grammar';v.kind='choice';v.format='choice';v.audio=undefined;v.transcript=undefined;v.supplementalGrammar=true;v.prompt=t[0];const shift=attempt%t[1].length;v.options=t[1].slice(shift).concat(t[1].slice(0,shift));v.correct=(t[2]-shift+t[1].length)%t[1].length;v.problem=t[3];v.examPoint='语法框架专项：'+parent.examPoint;v.caution='从结构与语义关系判断，不只记住某一条答案。';return v}
if(typeof module!=='undefined')module.exports={grammarDrills,hasGrammarDrill,makeGrammarVariant};

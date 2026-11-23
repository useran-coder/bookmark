const fs=require('fs'),acorn=require('acorn'),escope=require('eslint-scope');
const s=fs.readFileSync('/home/claude/sales/index.html','utf8');
const re=/<(script|style)([^>]*)>([\s\S]*?)<\/\1>/g;let m;const B=[];
while(m=re.exec(s)){B.push({tag:m[1],attrs:m[2],code:m[3],start:m.index});}
const decl=new Map(),parsed={};
function P(code){return acorn.parse(code,{ecmaVersion:2022,sourceType:'script',allowReturnOutsideFunction:true,ranges:true});}
B.forEach((b,bi)=>{if(b.tag!=='script'||/src=/.test(b.attrs))return;let ast;try{ast=P(b.code);}catch(e){return;}parsed[bi]=ast;
 ast.body.forEach(n=>{let names=[];if(n.type==='FunctionDeclaration'||n.type==='ClassDeclaration')names=[n.id.name];
  else if(n.type==='VariableDeclaration')n.declarations.forEach(d=>{if(d.id.type==='Identifier')names.push(d.id.name);});
  names.forEach(nm=>{if(!decl.has(nm))decl.set(nm,[]);decl.get(nm).push({bi,start:n.start,end:n.end});});});});
function free(ast){const sm=escope.analyze(ast,{ecmaVersion:2022,sourceType:'script'});const g=sm.globalScope;const own=new Set(g.variables.map(v=>v.name));
 const r=new Set();g.through.forEach(ref=>{if(!own.has(ref.identifier.name))r.add(ref.identifier.name);});
 // window.X
 require('acorn-walk').simple(ast,{MemberExpression(n){if(n.object.type==='Identifier'&&n.object.name==='window'&&!n.computed&&n.property.type==='Identifier')r.add(n.property.name);}});return r;}
module.exports={B,decl,parsed,free,P};

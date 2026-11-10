import { TAX } from '../config/tax.js';
const money = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number.isFinite(n)?n:0);
const periods = {weekly:52,biweekly:26,semimonthly:24,monthly:12};
function annualFederal(wages,status,step2,credits,step4a,step4b){
 const fed=TAX.federal, std=fed.standardDeduction[status], line1g=step2?0:fed.line1g[status], divisor=step2?2:1;
 const adjusted=Math.max(0,wages+step4a-step4b-line1g), taxable=adjusted-(std/divisor-line1g); if(taxable<=0)return 0;
 let tax=0,lower=0;for(const [top,rate] of fed.brackets[status]){const upper=top/divisor;if(taxable>lower)tax+=(Math.min(taxable,upper)-lower)*rate;if(taxable<=upper)break;lower=upper;}return Math.max(0,tax-credits);
}

export function initStateCalculators(){document.querySelectorAll('[data-state-calculator]').forEach(root=>{
 const $=(s)=>root.querySelector(s), form=$('form'), out=(k,v)=>{const e=$(`[data-out="${k}"]`);if(e)e.textContent=money(v)};
 const calculate=()=>{const v=(id)=>Number($(id).value)||0;const n=(id)=>$(id).value;const p=periods[n('#st-frequency')];let annual=(n('#st-pay-type')==='hourly'?v('#st-rate')*(v('#st-hours')+v('#st-ot')*1.5)*52:v('#st-pay'))+v('#st-tips');const numeric=['#st-pay','#st-rate','#st-hours','#st-ot','#st-tips','#st-state-rate','#st-local-rate','#st-401k','#st-health','#st-post','#st-extra','#st-credits','#st-step4a','#st-step4b','#st-ytd-ss','#st-ytd-med'];if(numeric.some(id=>v(id)<0)||v('#st-hours')+v('#st-ot')>168||v('#st-state-rate')>30||v('#st-local-rate')>20||v('#st-401k')>100){alert('Please enter valid, non-negative amounts and realistic percentages or hours.');return;}
 const gross=annual/p, k401=gross*Math.min(100,v('#st-401k'))/100,health=Math.min(gross-k401,v('#st-health')),taxable=Math.max(0,(gross-k401-health)*p),ficaWages=Math.max(0,(gross-health)*p);
 const fedAnnual=$('#st-exempt').checked?0:annualFederal(taxable,n('#st-status'),$('#st-step2').checked,v('#st-credits'),v('#st-step4a'),v('#st-step4b'));const federal=($('#st-exempt').checked?0:fedAnnual/p)+v('#st-extra'),ss=Math.max(0,Math.min(ficaWages,Math.max(0,184500-v('#st-ytd-ss')))*.062/p),medicare=ficaWages/p*.0145+Math.max(0,Math.min(ficaWages, v('#st-ytd-med')+ficaWages-200000))*.009/p, state=Math.max(0,gross-k401-health)*v('#st-state-rate')/100,local=Math.max(0,gross-k401-health)*v('#st-local-rate')/100,post=v('#st-post');
 const net=Math.max(0,gross-federal-ss-medicare-state-local-k401-health-post);
 out('gross',gross);out('federal',federal);out('ss',ss);out('medicare',medicare);out('state',state);out('local',local);out('pretax',k401+health);out('post',post);out('net',net);$('[data-state-net]').textContent=money(net);
 const parts={net,federal:Math.max(0,federal),fica:ss+medicare,state,local,deductions:k401+health+post};const total=Object.values(parts).reduce((a,b)=>a+b,0)||1;Object.entries(parts).forEach(([k,val])=>{const e=$(`[data-part="${k}"]`);if(e)e.style.width=`${Math.max(0,val/total*100)}%`;});
 };
 $('[data-calculate-state]').addEventListener('click',calculate);form.addEventListener('input',calculate);form.addEventListener('reset',()=>setTimeout(calculate,0));calculate();
 });}

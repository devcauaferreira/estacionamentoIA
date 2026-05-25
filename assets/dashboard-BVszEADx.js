import{s as w}from"./auth-C9HJbkKe.js";import{e as _,h as y}from"./styles-BQuejN9J.js";import{i as $,f as j}from"./layout-CHIie31U.js";const v=document.querySelector("[data-dashboard-cards]"),g=document.querySelector("[data-recentes]");function H(){const e=new Date;e.setHours(0,0,0,0);const t=new Date;return t.setHours(23,59,59,999),{inicio:e.toISOString(),fim:t.toISOString()}}async function n(e,t){let r=w.from(e).select("id",{count:"exact",head:!0});r=t(r);const{count:s,error:o}=await r;if(o)throw o;return s||0}function d(e,t,r,s){return`<article class="rounded-xl border p-5 shadow-sm ${s}">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium opacity-80">${e}</p>
        <p class="mt-2 text-3xl font-bold">${t}</p>
      </div>
      <div class="rounded-lg bg-white/20 p-3">${y(r,"h-7 w-7")}</div>
    </div>
  </article>`}async function S(){const{inicio:e,fim:t}=H(),[r,s,o,x]=await Promise.all([n("movimentacoes",a=>a.eq("status","aberta")),n("clientes",a=>a.eq("ativo",!0)),n("movimentacoes",a=>a.gte("data_hora_entrada",e).lte("data_hora_entrada",t)),n("movimentacoes",a=>a.gte("data_hora_saida",e).lte("data_hora_saida",t))]);v&&(v.innerHTML=[d("Veículos no pátio",r,"truck","border-purple-200 bg-purple-600 text-white"),d("Mensalistas ativos",s,"user-group","border-emerald-200 bg-emerald-600 text-white"),d("Entradas hoje",o,"calendar-days","border-amber-200 bg-amber-500 text-white"),d("Saídas hoje",x,"arrow-left-on-rectangle","border-sky-200 bg-sky-600 text-white")].join(""));const{data:c,error:l}=await w.from("movimentacoes").select("id, data_hora_entrada, data_hora_saida, status, veiculos(placa, marcas(nome), modelos(nome), clientes(nome))").order("data_hora_entrada",{ascending:!1}).limit(5);if(l)throw l;g&&(g.innerHTML=c.length?c.map(a=>{var i,m,u,b,h,f,p;return`<tr class="hover:bg-slate-50 dark:hover:bg-slate-900">
        <td class="table-cell font-semibold">${((i=a.veiculos)==null?void 0:i.placa)||"-"}</td>
        <td class="table-cell">${((u=(m=a.veiculos)==null?void 0:m.marcas)==null?void 0:u.nome)||"-"} ${((h=(b=a.veiculos)==null?void 0:b.modelos)==null?void 0:h.nome)||""}</td>
        <td class="table-cell">${((p=(f=a.veiculos)==null?void 0:f.clientes)==null?void 0:p.nome)||"Avulso"}</td>
        <td class="table-cell">${j(a.data_hora_entrada)}</td>
        <td class="table-cell"><span class="rounded-full px-2 py-1 text-xs font-semibold ${a.status==="aberta"?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-700"}">${a.status==="aberta"?"Aberta":"Encerrada"}</span></td>
      </tr>`}).join(""):'<tr><td class="table-cell text-center text-slate-500" colspan="5">Não há movimentações recentes.</td></tr>')}document.addEventListener("DOMContentLoaded",async()=>{await $();try{await S()}catch(e){_("Erro ao carregar dashboard",e.message)}});

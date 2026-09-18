const KEY="ZH_DOKAN_DATA_V1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"zh1":[],"zh2":[],"expenses":[]}');

const money=n=>Number(n||0).toLocaleString("en-US");
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll(".entryForm").forEach(form=>{
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const f=new FormData(form);
    const qty=Number(f.get("qty")), buy=Number(f.get("buy")), sell=Number(f.get("sell"));
    const discount=Number(f.get("discount")||0);
    data[form.dataset.shop].push({
      id:Date.now()+Math.random(),
      item:f.get("item"),type:f.get("type"),qty,buy,sell,discount
    });
    form.reset();
    form.querySelector('[name="discount"]').value=0;
    save();
  });
});

document.getElementById("expenseForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  data.expenses.push({id:Date.now()+Math.random(),type:f.get("type"),note:f.get("note"),amount:Number(f.get("amount"))});
  e.target.reset(); save();
});

function rowHtml(x,shop){
  const gross=x.qty*x.sell, discount=gross*x.discount/100, net=gross-discount, cost=x.qty*x.buy, profit=net-cost;
  return `<tr><td>${esc(x.item)}<small>${esc(x.type||"")}</small></td><td>${x.qty}</td><td>${money(cost)}</td><td>${money(net)}</td><td>${x.discount}% (${money(discount)})</td><td>${money(profit)}</td><td><button class="delete" onclick="removeItem('${shop}',${x.id})">سڕینەوە</button></td></tr>`;
}
function expenseRow(x){return `<tr><td>${esc(x.type)}</td><td>${esc(x.note||"")}</td><td>${money(x.amount)}</td><td><button class="delete" onclick="removeExpense(${x.id})">سڕینەوە</button></td></tr>`}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function removeItem(shop,id){data[shop]=data[shop].filter(x=>x.id!=id);save()}
function removeExpense(id){data.expenses=data.expenses.filter(x=>x.id!=id);save()}

function totals(shop){
  return data[shop].reduce((a,x)=>{
    const cost=x.qty*x.buy, gross=x.qty*x.sell, disc=gross*x.discount/100, net=gross-disc;
    a.sales+=net;a.purchase+=cost;a.profit+=net-cost; a.discount+=disc; return a;
  },{sales:0,purchase:0,profit:0,discount:0});
}

function render(){
  ["zh1","zh2"].forEach(shop=>{
    document.getElementById(shop+"Rows").innerHTML=data[shop].map(x=>rowHtml(x,shop)).join("");
  });
  document.getElementById("expenseRows").innerHTML=data.expenses.map(expenseRow).join("");
  const a=totals("zh1"),b=totals("zh2");
  const exp=data.expenses.reduce((s,x)=>s+x.amount,0);
  document.getElementById("sales1").textContent=money(a.sales);
  document.getElementById("sales2").textContent=money(b.sales);
  document.getElementById("purchases").textContent=money(a.purchase+b.purchase);
  document.getElementById("expenses").textContent=money(exp);
  document.getElementById("profit").textContent=money(a.profit+b.profit-exp);
  document.getElementById("summaryBox").innerHTML=`
    <div class="summaryLine"><span>قازانجی ZH 1</span><strong>${money(a.profit)}</strong></div>
    <div class="summaryLine"><span>قازانجی ZH 2</span><strong>${money(b.profit)}</strong></div>
    <div class="summaryLine"><span>کۆی داشکان</span><strong>${money(a.discount+b.discount)}</strong></div>
    <div class="summaryLine"><span>کۆی مەسروفات</span><strong>${money(exp)}</strong></div>
    <div class="summaryLine"><span>قازانجی دوای مەسروفات</span><strong>${money(a.profit+b.profit-exp)}</strong></div>`;
}
document.getElementById("clearData").addEventListener("click",()=>{
  if(confirm("دڵنیایت دەتەوێت هەموو داتا بسڕیتەوە؟")){data={zh1:[],zh2:[],expenses:[]};save()}
});
render();

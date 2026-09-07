(() => {
  "use strict";

  const initialMaterials = [
    { id: 1, name: "Cimento 42.5 · saco 50 kg", unit: "saco", qty: 20 },
    { id: 2, name: "Ferro 12 mm · barra 12 m", unit: "barra", qty: 12 },
    { id: 3, name: "Bloco de cimento 15 cm", unit: "un.", qty: 120 }
  ];

  const offers = [
    { id: 1, store: "Ferragem Maputo Centro", distance: "2,8 km", distanceN: 2.8, eta: "45–60 min", rating: 4.8, complete: true, materials: 18450, delivery: 650, platform: 380 },
    { id: 2, store: "Casa da Obra Matola", distance: "6,1 km", distanceN: 6.1, eta: "60–90 min", rating: 4.6, complete: true, materials: 17890, delivery: 900, platform: 376 },
    { id: 3, store: "Ferragens Baixa", distance: "3,5 km", distanceN: 3.5, eta: "50–70 min", rating: 4.7, complete: false, materials: 16120, delivery: 700, platform: 336 }
  ];

  const stockSeed = [
    { name: "Cimento 42.5 · 50 kg", price: 565, qty: 84 },
    { name: "Ferro 12 mm · 12 m", price: 410, qty: 52 },
    { name: "Bloco 15 cm", price: 32, qty: 620 },
    { name: "Tinta acrílica 20 L", price: 2850, qty: 7 }
  ];

  const partnersSeed = [
    { name: "Ferragem Maputo Centro", state: "Aprovada", zone: "Maputo", commission: "5,0%" },
    { name: "Casa da Obra Matola", state: "Aprovada", zone: "Matola", commission: "5,5%" },
    { name: "Ferragens Costa do Sol", state: "Pendente", zone: "Maputo", commission: "5,0%" },
    { name: "ConstruMais", state: "Pendente", zone: "Matola", commission: "5,5%" }
  ];

  const state = {
    role: localStorage.getItem("mobra-role") || "cliente",
    view: "inicio",
    materials: loadJson("mobra-materials", initialMaterials),
    selectedOffer: Number(localStorage.getItem("mobra-offer") || 1),
    sort: "recomendado",
    query: "",
    storeOrderState: "Novo",
    driverStatus: "Atribuída",
    stock: loadJson("mobra-stock", stockSeed),
    partners: loadJson("mobra-partners", partnersSeed)
  };

  const app = document.getElementById("app");
  const esc = (value) => String(value).replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const money = (value) => `${new Intl.NumberFormat("pt-MZ").format(value)} MT`;
  const icon = (name) => `<span class="icon" aria-hidden="true">${({home:"⌂",list:"≡",compare:"⇄",cart:"▣",order:"◎",stock:"▦",truck:"➜",admin:"◆",search:"⌕",bell:"◉",plus:"+",check:"✓"}[name] || "•")}</span>`;
  const badge = (text, tone="neutral") => `<span class="badge badge-${tone}">${esc(text)}</span>`;
  const kpi = (label, value, note) => `<div class="kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`;

  function loadJson(key, fallback) {
    try { const parsed = JSON.parse(localStorage.getItem(key) || "null"); return Array.isArray(parsed) ? parsed : structuredClone(fallback); }
    catch { return structuredClone(fallback); }
  }
  function persist() {
    localStorage.setItem("mobra-role", state.role);
    localStorage.setItem("mobra-materials", JSON.stringify(state.materials));
    localStorage.setItem("mobra-offer", String(state.selectedOffer));
    localStorage.setItem("mobra-stock", JSON.stringify(state.stock));
    localStorage.setItem("mobra-partners", JSON.stringify(state.partners));
  }
  function notify(message) {
    const old = document.querySelector(".toast"); if (old) old.remove();
    const div = document.createElement("div"); div.className = "toast"; div.innerHTML = `${icon("check")} ${esc(message)}`; document.body.append(div);
    setTimeout(() => div.remove(), 2600);
  }

  function navItems() {
    if (state.role === "cliente") return [["inicio","home","Início"],["lista","list","Lista"],["comparar","compare","Comparar"],["carrinho","cart","Carrinho"],["pedidos","order","Pedidos"]];
    if (state.role === "ferragem") return [["inicio","home","Resumo"],["lista","stock","Produtos"],["pedidos","order","Pedidos"]];
    if (state.role === "motorista") return [["inicio","home","Resumo"],["pedidos","truck","Entregas"]];
    return [["inicio","home","Painel"],["lista","admin","Ferragens"],["pedidos","order","Operações"]];
  }

  function page(title, subtitle, body) {
    return `<div class="page-title"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><span class="secure-note">● Ambiente piloto seguro</span></div>${body}`;
  }

  function shell(content) {
    const nav = navItems();
    return `<main class="app-shell">
      <aside class="sidebar">
        <div class="brand"><img class="brand-logo" src="assets/mobra-logo.jpg" alt="MObra Connect"><div><strong>MObra</strong><span>CONNECT</span></div></div>
        <div class="pilot-chip">PILOTO · PRÉVIA</div>
        <nav class="side-nav" aria-label="Navegação principal">${nav.map(([id,ic,label])=>`<button data-view="${id}" class="${state.view===id?"active":""}">${icon(ic)}<span>${label}</span></button>`).join("")}</nav>
        <div class="sidebar-bottom"><div class="support-box"><span>Precisa de apoio?</span><strong>+258 84 000 0000</strong><small>Suporte piloto</small></div><button class="secondary full" data-action="logout">Terminar sessão</button></div>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div class="mobile-brand"><img src="assets/mobra-logo.jpg" alt="MObra Connect"><strong>MObra Connect</strong></div>
          <label class="global-search">${icon("search")}<span class="sr-only">Pesquisar</span><input id="globalSearch" value="${esc(state.query)}" placeholder="Pesquisar produtos, pedidos ou ferragens"></label>
          <div class="top-actions"><button class="icon-btn" data-action="notifications" aria-label="Notificações">${icon("bell")}<span class="dot"></span></button>
          <select id="roleSelect" aria-label="Perfil de demonstração"><option value="cliente" ${state.role==="cliente"?"selected":""}>Cliente</option><option value="ferragem" ${state.role==="ferragem"?"selected":""}>Ferragem</option><option value="motorista" ${state.role==="motorista"?"selected":""}>Motorista</option><option value="admin" ${state.role==="admin"?"selected":""}>Administrador</option></select><button class="avatar" aria-label="Perfil">AM</button></div>
        </header>
        <div class="content">${content}</div>
        <footer class="preview-footer"><strong>MObra Connect — Prévia do piloto.</strong> Esta é apenas uma prévia e ainda está em construção. Dados, preços, pagamentos e ações aqui apresentados são simulados.</footer>
      </section>
      <nav class="mobile-nav" aria-label="Navegação móvel">${nav.slice(0,5).map(([id,ic,label])=>`<button data-view="${id}" class="${state.view===id?"active":""}">${icon(ic)}<span>${label}</span></button>`).join("")}</nav>
    </main>`;
  }

  function clientContent() {
    const selected = offers.find(x => x.id === state.selectedOffer) || offers[0];
    const total = selected.materials + selected.delivery + selected.platform;
    if (state.view === "lista") {
      return page("Lista de materiais", "Prepare o que precisa e compare ofertas de ferragens aprovadas.", `<div class="grid-2"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">MINHA LISTA</span><h2>Obra da Sommerschield</h2></div>${badge(`${state.materials.length} itens`,"info")}</div><div class="material-list">${state.materials.length ? state.materials.map(item=>`<div class="material-row"><div><strong>${esc(item.name)}</strong><span>Unidade: ${esc(item.unit)}</span></div><div class="qty-control"><button data-action="qty-minus" data-id="${item.id}" aria-label="Diminuir">−</button><b>${item.qty}</b><button data-action="qty-plus" data-id="${item.id}" aria-label="Aumentar">+</button></div><button class="remove" data-action="remove-material" data-id="${item.id}">Remover</button></div>`).join("") : `<div class="empty">A lista está vazia. Adicione o primeiro material.</div>`}</div><form class="add-form" id="materialForm"><input id="materialName" required maxlength="90" placeholder="Ex.: Areia fina, 1 m³"><input id="materialQty" type="number" min="1" max="9999" value="1"><button class="primary">${icon("plus")} Adicionar</button></form></section><aside class="panel soft"><span class="eyebrow">ENTREGA</span><h3>Onde deseja receber?</h3><div class="address-card"><strong>Av. Julius Nyerere, Maputo</strong><span>Casa 84 · Portão cinzento</span><button class="link" data-action="address">Alterar endereço</button></div><div class="mini-note">A comparação considera apenas ferragens aprovadas com stock suficiente e produtos compatíveis.</div><button class="primary full" data-view="comparar">Comparar propostas</button></aside></div>`);
    }
    if (state.view === "comparar") {
      let sorted = [...offers];
      if (state.sort === "preco") sorted.sort((a,b)=>(a.materials+a.delivery+a.platform)-(b.materials+b.delivery+b.platform));
      else if (state.sort === "avaliacao") sorted.sort((a,b)=>b.rating-a.rating);
      else if (state.sort === "proximidade") sorted.sort((a,b)=>a.distanceN-b.distanceN);
      else sorted.sort((a,b)=>Number(b.complete)-Number(a.complete));
      return page("Comparar propostas", "Valores transparentes, disponibilidade e prazo num só lugar.", `<div class="toolbar"><div>${badge("2 completas","success")}${badge("1 parcial","warning")}</div><label>Ordenar por <select id="sortSelect"><option value="recomendado" ${state.sort==="recomendado"?"selected":""}>Recomendado</option><option value="preco" ${state.sort==="preco"?"selected":""}>Menor total</option><option value="proximidade" ${state.sort==="proximidade"?"selected":""}>Proximidade</option><option value="avaliacao" ${state.sort==="avaliacao"?"selected":""}>Avaliação</option></select></label></div><div class="offer-grid">${sorted.map(offer=>{const t=offer.materials+offer.delivery+offer.platform;return `<article class="offer-card ${state.selectedOffer===offer.id?"selected":""}"><div class="offer-top"><div class="store-mark">${esc(offer.store[0])}</div><div><h3>${esc(offer.store)}</h3><span>★ ${offer.rating} · ${offer.distance} · ${offer.eta}</span></div></div><div class="offer-status">${offer.complete?badge("Lista completa","success"):badge("Faltam 2 itens","warning")}</div><div class="price-lines"><span>Materiais <b>${money(offer.materials)}</b></span><span>Entrega <b>${money(offer.delivery)}</b></span><span>Taxa da plataforma <b>${money(offer.platform)}</b></span></div><div class="offer-total"><span>Total</span><strong>${money(t)}</strong></div><button class="${state.selectedOffer===offer.id?"secondary":"primary"} full" data-action="select-offer" data-id="${offer.id}">${state.selectedOffer===offer.id?"Selecionada":"Escolher proposta"}</button></article>`}).join("")}</div><div class="sticky-next"><span>Proposta escolhida: <strong>${esc(selected.store)}</strong></span><button class="primary" data-view="carrinho">Continuar para o carrinho</button></div>`);
    }
    if (state.view === "carrinho") {
      return page("Carrinho", "Confirme os detalhes antes de criar o pedido.", `<div class="grid-checkout"><section class="panel"><div class="checkout-store"><div class="store-mark">${esc(selected.store[0])}</div><div><span class="eyebrow">FERRAGEM SELECIONADA</span><h2>${esc(selected.store)}</h2><span>Entrega estimada: ${selected.eta}</span></div></div>${state.materials.map(item=>`<div class="cart-line"><div><strong>${esc(item.name)}</strong><span>${item.qty} × ${esc(item.unit)}</span></div><b>Incluído</b></div>`).join("")}<label class="field"><span>Observações para a ferragem</span><textarea maxlength="250" placeholder="Ex.: confirmar marca antes da preparação"></textarea></label></section><aside class="panel order-summary"><h3>Resumo</h3><div><span>Materiais</span><b>${money(selected.materials)}</b></div><div><span>Entrega</span><b>${money(selected.delivery)}</b></div><div><span>Taxa da plataforma</span><b>${money(selected.platform)}</b></div><div class="grand"><span>Total</span><strong>${money(total)}</strong></div><label class="field"><span>Pagamento no piloto</span><select><option>Pagamento na entrega</option><option>Transferência — confirmação manual</option><option>Pagamento simulado</option></select></label><button class="primary full" data-action="checkout">Confirmar pedido</button><small>Não será efetuada qualquer cobrança real nesta prévia.</small></aside></div>`);
    }
    if (state.view === "pedidos") {
      const steps=["Pedido criado","Pagamento registado","Enviado à ferragem","Aceite","Em preparação","Pronto para entrega","Em transporte","Entregue"];
      return page("Os meus pedidos", "Acompanhe cada etapa desde a confirmação até à entrega.", `<section class="panel order-card"><div class="order-head"><div><span class="eyebrow">PEDIDO #MOB-2026-0184</span><h2>Entrega em preparação</h2><span>${esc(selected.store)} · ${money(total)}</span></div>${badge("Em preparação","warning")}</div><div class="timeline">${steps.map((step,i)=>`<div class="${i<=4?"done":""}"><span>${i<=4?"✓":i+1}</span><p><strong>${esc(step)}</strong><small>${i<=4?(i===4?"Agora":`Hoje · ${9+i}:1${i}`):"Pendente"}</small></p></div>`).join("")}</div><div class="order-actions"><button class="secondary" data-action="receipt">Ver recibo</button><button class="secondary" data-action="support">Pedir apoio</button></div></section>`);
    }
    const hint = state.query.trim()?`<div class="search-hint">Pesquisa ativa: “${esc(state.query)}” · Esta prévia usa dados simulados.</div>`:"";
    return page("Bom dia, Amélia 👋", "Encontre materiais, compare ferragens e acompanhe a sua obra num único lugar.", `${hint}<section class="hero-card"><div><span class="eyebrow orange">COMPRA MAIS INTELIGENTE</span><h2>Da lista de materiais à entrega, com transparência.</h2><p>Crie a sua lista, veja propostas compatíveis de ferragens aprovadas e escolha a melhor combinação de preço, distância e prazo.</p><div class="hero-actions"><button class="primary light" data-view="lista">${icon("plus")} Nova lista</button><button class="ghost-light" data-view="comparar">Ver propostas</button></div></div><div class="hero-stat"><span>Poupança estimada</span><strong>8,4%</strong><small>na melhor proposta simulada</small></div></section><div class="kpi-grid">${kpi("Lista ativa",`${state.materials.length} itens`,"Obra da Sommerschield")}${kpi("Ferragens disponíveis","8","na zona piloto")}${kpi("Pedido em curso","1","em preparação")}${kpi("Tempo médio","64 min","estimativa de entrega")}</div><div class="grid-2 dashboard-grid"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">CONTINUE DE ONDE PAROU</span><h2>Lista de materiais</h2></div><button class="link" data-view="lista">Abrir lista</button></div>${state.materials.slice(0,3).map(item=>`<div class="mini-line"><div class="cube"></div><div><strong>${esc(item.name)}</strong><span>${item.qty} ${esc(item.unit)}</span></div>${badge("Disponível","success")}</div>`).join("")}<button class="primary full top-gap" data-view="comparar">Comparar agora</button></section><section class="panel"><div class="panel-heading"><div><span class="eyebrow">PEDIDO ATIVO</span><h2>#MOB-2026-0184</h2></div>${badge("Em preparação","warning")}</div><div class="progress"><span style="width:58%"></span></div><div class="delivery-steps"><b>Ferragem a preparar os materiais</b><span>Próximo: pronto para entrega</span></div><div class="mini-order"><span>Ferragem</span><b>${esc(selected.store)}</b></div><div class="mini-order"><span>Total</span><b>${money(total)}</b></div><button class="secondary full top-gap" data-view="pedidos">Acompanhar pedido</button></section></div>`);
  }

  function storeContent() {
    if (state.view === "lista") return page("Produtos e stock", "Mantenha preço e disponibilidade atualizados para comparações confiáveis.", `<section class="panel"><div class="panel-heading"><h2>Catálogo publicado</h2><button class="primary" data-action="new-product">+ Adicionar produto</button></div><div class="table-wrap"><table><thead><tr><th>Produto</th><th>Preço</th><th>Stock</th><th>Estado</th><th></th></tr></thead><tbody>${state.stock.map((p,i)=>`<tr><td><strong>${esc(p.name)}</strong></td><td>${money(p.price)}</td><td><input class="stock-input" type="number" min="0" value="${p.qty}" data-stock-index="${i}"></td><td>${badge(p.qty<10?"Stock baixo":"Disponível",p.qty<10?"warning":"success")}</td><td><button class="link" data-action="save-stock">Guardar</button></td></tr>`).join("")}</tbody></table></div></section>`);
    if (state.view === "pedidos") return page("Pedidos recebidos", "Aceite, rejeite e atualize a preparação com rastreabilidade.", `<section class="panel order-card"><div class="order-head"><div><span class="eyebrow">PEDIDO #MOB-2026-0184</span><h2>Amélia M. · Sommerschield</h2><span>3 tipos de material · 152 unidades</span></div>${badge(state.storeOrderState,state.storeOrderState==="Novo"?"info":state.storeOrderState==="Rejeitado"?"danger":"warning")}</div><div class="summary-strip"><div><span>Total materiais</span><strong>18 450 MT</strong></div><div><span>Entrega solicitada</span><strong>Hoje</strong></div><div><span>Pagamento</span><strong>Registado</strong></div></div><div class="order-actions"><button class="secondary" data-action="reject-order">Rejeitar</button><button class="primary" data-action="advance-store-order">${state.storeOrderState==="Novo"?"Aceitar pedido":"Iniciar preparação"}</button></div></section>`);
    const low = state.stock.filter(p=>p.qty<100);
    return page("Painel da ferragem", "Controle vendas, pedidos, stock e preparação.", `<div class="kpi-grid">${kpi("Pedidos hoje","12","+3 vs. ontem")}${kpi("A preparar","5","2 prioritários")}${kpi("Stock baixo","4","requer atualização")}${kpi("Vendas do dia","94 820 MT","valor simulado")}</div><div class="grid-2 dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Pedidos recentes</h2>${badge("12 hoje","info")}</div>${[["#MOB-0184 · Amélia M.","Em preparação","18 450"],["#MOB-0183 · Carlos T.","Novo","7 980"],["#MOB-0182 · Eduardo S.","Pronto para entrega","22 100"]].map(x=>`<div class="mini-line"><div class="cube"></div><div><strong>${x[0]}</strong><span>${x[1]}</span></div><b>${x[2]} MT</b></div>`).join("")}</section><section class="panel"><div class="panel-heading"><h2>Alertas de stock</h2><button class="link" data-view="lista">Ver catálogo</button></div>${low.map(p=>`<div class="alert-line"><span>${esc(p.name)}</span>${badge(`${p.qty} un.`,p.qty<10?"danger":"warning")}</div>`).join("")}</section></div>`);
  }

  function driverContent() {
    const steps=["Atribuída","Recolhida","Em transporte","Entregue"], idx=steps.indexOf(state.driverStatus);
    const btn = state.driverStatus==="Atribuída"?"Confirmar recolha":state.driverStatus==="Recolhida"?"Iniciar transporte":state.driverStatus==="Em transporte"?"Confirmar entrega":"Entrega concluída";
    return page(state.view==="pedidos"?"Entrega atribuída":"Painel do motorista", "Recolha, transporte e confirmação de entrega num fluxo simples.", `<div class="driver-layout"><section class="panel"><div class="order-head"><div><span class="eyebrow">ENTREGA #DLV-0417</span><h2>Pedido #MOB-2026-0184</h2><span>Ferragem Maputo Centro → Sommerschield</span></div>${badge(state.driverStatus,state.driverStatus==="Entregue"?"success":"info")}</div><div class="route-box"><div class="route-node"><span>A</span><div><strong>Recolha</strong><p>Av. 24 de Julho, Maputo</p></div></div><div class="route-line"></div><div class="route-node"><span>B</span><div><strong>Entrega</strong><p>Av. Julius Nyerere, Sommerschield</p></div></div></div><div class="summary-strip"><div><span>Distância</span><strong>5,6 km</strong></div><div><span>Volumes</span><strong>18</strong></div><div><span>Contacto</span><strong>84 *** 120</strong></div></div><button class="primary full" data-action="advance-delivery" ${idx===steps.length-1?"disabled":""}>${btn}</button></section><aside class="panel soft"><span class="eyebrow">CONFIRMAÇÃO</span><h3>Código do recebedor</h3><div class="otp"><span>4</span><span>8</span><span>1</span><span>7</span></div><p class="muted">Use apenas quando chegar ao destino. Nesta prévia, o código é demonstrativo.</p></aside></div>`);
  }

  function adminContent() {
    if (state.view === "lista") return page("Gestão de ferragens", "Aprove parceiros antes de permitir publicação de produtos e receção de pedidos.", `<section class="panel"><div class="table-wrap"><table><thead><tr><th>Ferragem</th><th>Zona</th><th>Comissão</th><th>Estado</th><th>Ações</th></tr></thead><tbody>${state.partners.map((p,i)=>`<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.zone)}</td><td>${esc(p.commission)}</td><td>${badge(p.state,p.state==="Aprovada"?"success":"warning")}</td><td>${p.state==="Pendente"?`<button class="link" data-action="approve-partner" data-id="${i}">Aprovar</button>`:`<button class="link danger-text" data-action="suspend-partner">Suspender</button>`}</td></tr>`).join("")}</tbody></table></div></section>`);
    if (state.view === "pedidos") return page("Operações e auditoria", "Consulte pedidos, pagamentos, entregas e eventos críticos.", `<section class="panel"><div class="panel-heading"><h2>Atividade recente</h2>${badge("Auditável","info")}</div>${["Pedido #MOB-0184 passou para Em preparação","Pagamento #PAY-9281 confirmado manualmente","Ferragem ConstruMais submeteu documentos","Entrega #DLV-0416 confirmada pelo recebedor"].map((x,i)=>`<div class="audit-line"><span class="audit-dot"></span><div><strong>${esc(x)}</strong><span>Admin piloto · hoje, ${10+i}:2${i}</span></div><button class="link" data-action="audit-details">Detalhes</button></div>`).join("")}</section>`);
    return page("Painel administrativo", "Visão operacional do piloto: utilizadores, ferragens, pedidos, pagamentos e entregas.", `<div class="kpi-grid">${kpi("GMV do piloto","428 600 MT","dados simulados")}${kpi("Pedidos","57","49 concluídos")}${kpi("Ferragens","8","2 pendentes")}${kpi("Taxa de entrega","96,1%","últimos 7 dias")}</div><div class="grid-2 dashboard-grid"><section class="panel"><div class="panel-heading"><h2>Estado dos pedidos</h2>${badge("Operação estável","success")}</div><div class="bars">${[["Entregues",34,68],["Em preparação",9,42],["Em transporte",6,30],["Cancelados",3,16]].map(([label,count,width])=>`<div><span>${label}<b>${count}</b></span><i><em style="width:${width}%"></em></i></div>`).join("")}</div></section><section class="panel"><div class="panel-heading"><h2>Atenção necessária</h2>${badge("4 itens","warning")}</div><div class="alert-line"><span>2 ferragens aguardam aprovação</span><button class="link" data-view="lista">Rever</button></div><div class="alert-line"><span>1 pedido excedeu o prazo estimado</span><button class="link" data-action="investigate">Investigar</button></div><div class="alert-line"><span>1 produto com preço antigo</span><button class="link" data-action="notify-store">Notificar</button></div></section></div>`);
  }

  function render() {
    const content = state.role === "cliente" ? clientContent() : state.role === "ferragem" ? storeContent() : state.role === "motorista" ? driverContent() : adminContent();
    app.innerHTML = shell(content);
    bindEvents();
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", () => { state.view = el.dataset.view; render(); window.scrollTo({top:0,behavior:"smooth"}); }));
    const role = document.getElementById("roleSelect"); if (role) role.addEventListener("change", e => { state.role=e.target.value; state.view="inicio"; persist(); render(); });
    const search = document.getElementById("globalSearch"); if (search) search.addEventListener("input", e => { state.query=e.target.value; if(state.role==="cliente" && state.view==="inicio") { const caret=e.target.selectionStart; render(); const n=document.getElementById("globalSearch"); if(n){n.focus();n.setSelectionRange(caret,caret);} } });
    const sort = document.getElementById("sortSelect"); if (sort) sort.addEventListener("change", e => { state.sort=e.target.value; render(); });
    const form = document.getElementById("materialForm"); if(form) form.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("materialName").value.trim();const qty=Math.max(1,Number(document.getElementById("materialQty").value)||1);if(!name)return;state.materials.push({id:Date.now(),name,unit:"un.",qty});persist();render();notify("Material adicionado à lista.");});
    document.querySelectorAll("[data-stock-index]").forEach(input=>input.addEventListener("change",()=>{const i=Number(input.dataset.stockIndex);state.stock[i].qty=Math.max(0,Number(input.value)||0);persist();render();notify("Stock atualizado nesta prévia.");}));
    document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => action(el.dataset.action, el)));
  }

  function action(name, el) {
    if(name==="notifications") return notify("Não há novas notificações.");
    if(name==="logout") return notify("Sessão de demonstração encerrada.");
    if(name==="address") return notify("Alteração de endereço disponível na versão completa.");
    if(name==="qty-minus" || name==="qty-plus") { const id=Number(el.dataset.id); state.materials=state.materials.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty+(name==="qty-plus"?1:-1))}:x); persist(); return render(); }
    if(name==="remove-material") { const id=Number(el.dataset.id); state.materials=state.materials.filter(x=>x.id!==id); persist(); render(); return notify("Material removido."); }
    if(name==="select-offer") { state.selectedOffer=Number(el.dataset.id); persist(); render(); return notify("Proposta selecionada."); }
    if(name==="checkout") { state.view="pedidos"; render(); return notify("Pedido piloto criado com sucesso."); }
    if(name==="receipt") return notify("Recibo de demonstração preparado.");
    if(name==="support") return notify("O suporte foi sinalizado.");
    if(name==="new-product") return notify("Novo produto: funcionalidade demonstrativa.");
    if(name==="save-stock") return notify("Alteração guardada localmente nesta prévia.");
    if(name==="reject-order") { state.storeOrderState="Rejeitado"; render(); return notify("Pedido marcado como rejeitado."); }
    if(name==="advance-store-order") { state.storeOrderState=state.storeOrderState==="Novo"?"Aceite":"Em preparação"; render(); return notify(state.storeOrderState==="Aceite"?"Pedido aceite.":"Preparação iniciada."); }
    if(name==="advance-delivery") { const steps=["Atribuída","Recolhida","Em transporte","Entregue"],idx=steps.indexOf(state.driverStatus); if(idx<steps.length-1){state.driverStatus=steps[idx+1];render();return notify(`Entrega atualizada: ${state.driverStatus}.`);} }
    if(name==="approve-partner") { const i=Number(el.dataset.id); state.partners[i].state="Aprovada";persist();render();return notify("Ferragem aprovada para o piloto."); }
    if(name==="suspend-partner") return notify("Suspensão exige confirmação na versão completa.");
    if(name==="audit-details") return notify("Detalhes de auditoria abertos.");
    if(name==="investigate") return notify("Pedido sinalizado para investigação.");
    if(name==="notify-store") return notify("Ferragem notificada.");
  }

  render();
})();

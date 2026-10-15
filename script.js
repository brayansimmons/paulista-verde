/*
 * PAULISTA VERDE — JavaScript sem frameworks
 * Conceitos usados: variáveis, arrays, objetos, funções, if/else,
 * laços, eventos, armazenamento no navegador, GPS e requisições HTTP.
 *
 * IMPORTANTE: se configurar o Supabase em config.js, o mesmo catálogo
 * poderá ser visto em outros aparelhos. Sem configuração, é apenas local.
 */

// 1. Dados do projeto
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MESES_LONGOS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const CENTRO_PAULISTA = [-7.940, -34.873];
const CHAVE_LOCAL = "paulista-verde-cadastros-v2";

// Datas apenas indicativas. O clima e a variedade afetam a época real de colheita.
const ESPECIES = [
  { nome:"Mangueira", tipo:"frutifera", emoji:"🥭", meses:[10,11,12,1,2] },
  { nome:"Aceroleira", tipo:"frutifera", emoji:"🍒", meses:[9,10,11,12,1,2,3] },
  { nome:"Cajueiro", tipo:"frutifera", emoji:"🍎", meses:[8,9,10,11,12] },
  { nome:"Goiabeira", tipo:"frutifera", emoji:"🍈", meses:[1,2,3,4] },
  { nome:"Coqueiro", tipo:"frutifera", emoji:"🥥", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Bananeira", tipo:"frutifera", emoji:"🍌", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Pitangueira", tipo:"frutifera", emoji:"🍒", meses:[8,9,10,11] },
  { nome:"Mamoeiro", tipo:"frutifera", emoji:"🍈", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Limoeiro", tipo:"frutifera", emoji:"🍋", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Alface", tipo:"hortalica", emoji:"🥬", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Coentro", tipo:"hortalica", emoji:"🌿", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Couve", tipo:"hortalica", emoji:"🥬", meses:[1,2,3,4,5,6,7,8,9,10,11,12] },
  { nome:"Tomateiro", tipo:"hortalica", emoji:"🍅", meses:[4,5,6,7,8,9,10] },
  { nome:"Hortelã", tipo:"hortalica", emoji:"🌱", meses:[1,2,3,4,5,6,7,8,9,10,11,12] }
];

// Registros INVENTADOS somente para exemplificar o funcionamento do protótipo.
const EXEMPLOS = [
  { id:"demo1", especie:"Mangueira", tipo:"frutifera", bairro:"Centro", referencia:"Ponto fictício de demonstração", responsavel:"Equipe Paulista Verde", compartilhamento:"frutos", observacao:"Exemplo criado para testar o mapa. Não é um local verdadeiro de coleta.", latitude:-7.939, longitude:-34.874, meses:[10,11,12,1,2], criado_em:"2026-10-01T12:00:00Z", exemplo:true },
  { id:"demo2", especie:"Aceroleira", tipo:"frutifera", bairro:"Jardim Paulista", referencia:"Ponto fictício de demonstração", responsavel:"Equipe Paulista Verde", compartilhamento:"ambos", observacao:"Exemplo: o local não representa uma árvore cadastrada por morador.", latitude:-7.931, longitude:-34.881, meses:[9,10,11,12,1,2,3], criado_em:"2026-10-02T12:00:00Z", exemplo:true },
  { id:"demo3", especie:"Coentro", tipo:"hortalica", bairro:"Paratibe", referencia:"Ponto fictício de demonstração", responsavel:"Equipe Paulista Verde", compartilhamento:"mudas", observacao:"Exemplo de horta comunitária. Não colha sem verificar a autorização.", latitude:-7.949, longitude:-34.866, meses:[1,2,3,4,5,6,7,8,9,10,11,12], criado_em:"2026-10-03T12:00:00Z", exemplo:true },
  { id:"demo4", especie:"Cajueiro", tipo:"frutifera", bairro:"Maranguape I", referencia:"Ponto fictício de demonstração", responsavel:"Equipe Paulista Verde", compartilhamento:"informativo", observacao:"Exemplo fictício para testes do catálogo e da época de colheita.", latitude:-7.925, longitude:-34.869, meses:[8,9,10,11,12], criado_em:"2026-10-04T12:00:00Z", exemplo:true }
];

const $ = (id) => document.getElementById(id);
const config = window.PAULISTA_CONFIG || {};
const urlSupabase = String(config.supabaseUrl || "").trim().replace(/\/$/, "");
const chaveSupabase = String(config.supabaseKey || "").trim();
const modoOnline = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(urlSupabase) && chaveSupabase.length > 15;

let locais = lerCadastrosLocais();
let nuvem = [];
let usuario = null;
let pontoCadastro = null;
let escolhendoPonto = false;
let mapa = null;
let camadaPlantas = null;
let marcadorUsuario = null;
let marcadorCadastro = null;
let marcadoresPorId = new Map();
let carregandoOnline = false;
let avisoOnline = "";
let timeoutToast = null;

// 2. Funções básicas
function lerCadastrosLocais() {
  try {
    const conteudo = JSON.parse(localStorage.getItem(CHAVE_LOCAL) || "[]");
    return Array.isArray(conteudo) ? conteudo.filter((item) => item && item.id && item.especie) : [];
  } catch (erro) {
    return [];
  }
}
function guardarCadastrosLocais() {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(locais));
    return true;
  } catch (erro) {
    return false;
  }
}
function escaparHtml(valor) {
  return String(valor == null ? "" : valor).replace(/[&<>"']/g, (caractere) => {
    const tabela = { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" };
    return tabela[caractere];
  });
}
function acharEspecie(nome) { return ESPECIES.find((planta) => planta.nome === nome); }
function mesAtual() { return new Date().getMonth() + 1; }
function estaNaEpoca(planta) { return Array.isArray(planta.meses) && planta.meses.includes(mesAtual()); }
function dadosAtuais() { return modoOnline ? nuvem : [...locais, ...EXEMPLOS]; }
function distanciaKm(lat1, lon1, lat2, lon2) {
  // Fórmula de Haversine: distância aproximada entre coordenadas na Terra.
  const rad = (grau) => grau * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function kmDaPlanta(planta) {
  if (!usuario || !Number.isFinite(Number(planta.latitude)) || !Number.isFinite(Number(planta.longitude))) return null;
  return distanciaKm(usuario.latitude, usuario.longitude, Number(planta.latitude), Number(planta.longitude));
}
function textoDistancia(planta) {
  const km = kmDaPlanta(planta);
  if (km === null) return "";
  return km < 1 ? ` • cerca de ${Math.round(km * 1000)} m` : ` • cerca de ${km.toFixed(1).replace('.', ',')} km`;
}
function textoCompartilha(valor) {
  const opcoes = { frutos:"Frutos / alimentos", mudas:"Mudas / sementes", ambos:"Frutos e mudas", informativo:"Somente informativo" };
  return opcoes[valor] || "Compartilhamento a combinar";
}
function toast(texto) {
  const elemento = $("mensagem");
  elemento.textContent = texto;
  elemento.hidden = false;
  clearTimeout(timeoutToast);
  timeoutToast = setTimeout(() => { elemento.hidden = true; }, 4500);
}
function feedback(texto, erro=false) {
  const el = $("feedbackCadastro");
  el.textContent = texto;
  el.className = `feedback ${erro ? "erro" : "ok"}`;
}

// 3. Montar a lista e filtrar os resultados
function atualizarTela() {
  const busca = $("busca").value.trim().toLocaleLowerCase("pt-BR");
  const tipo = $("filtroTipo").value;
  const epoca = $("filtroEpoca").value;
  const ordem = $("filtroOrdem").value;
  const resultado = dadosAtuais().filter((planta) => {
    const texto = `${planta.especie} ${planta.bairro} ${planta.referencia || ""}`.toLocaleLowerCase("pt-BR");
    return texto.includes(busca) && (tipo === "todos" || planta.tipo === tipo) && (epoca !== "agora" || estaNaEpoca(planta));
  });

  if (ordem === "nome") {
    resultado.sort((a,b) => a.especie.localeCompare(b.especie, "pt-BR"));
  } else if (ordem === "perto" && usuario) {
    resultado.sort((a,b) => (kmDaPlanta(a) ?? Infinity) - (kmDaPlanta(b) ?? Infinity));
  } else {
    resultado.sort((a,b) => new Date(b.criado_em) - new Date(a.criado_em));
  }

  $("numeroResultados").textContent = `${resultado.length} ${resultado.length === 1 ? "local encontrado" : "locais encontrados"}`;
  $("resultadoSubtitulo").textContent = usuario ? "Distâncias aproximadas da sua posição" : "Use o GPS para ver as distâncias";
  $("semResultados").hidden = resultado.length > 0 || carregandoOnline;
  const lista = $("listaPlantas");
  lista.innerHTML = "";
  for (const planta of resultado) {
    const especie = acharEspecie(planta.especie);
    const emoji = especie?.emoji || (planta.tipo === "hortalica" ? "🌿" : "🌳");
    const status = estaNaEpoca(planta) ? "🟢 Possível colheita neste mês" : (planta.meses?.length ? "🌤️ Fora da época estimada" : "📅 Época não informada");
    const cartao = document.createElement("article");
    cartao.className = "planta-item";
    cartao.innerHTML = `
      <div class="planta-emoji ${planta.tipo === "hortalica" ? "horta" : ""}" aria-hidden="true">${emoji}</div>
      <div class="planta-conteudo">
        <div class="planta-titulo"><h3>${escaparHtml(planta.especie)}</h3>${planta.exemplo ? '<span class="selo demo">EXEMPLO FICTÍCIO</span>' : '<span class="selo">CADASTRADO</span>'}</div>
        <p class="planta-desc">📍 ${escaparHtml(planta.bairro)}${escaparHtml(textoDistancia(planta))}</p>
        <div class="planta-status">${status}</div>
        <p class="planta-desc">🤝 ${escaparHtml(textoCompartilha(planta.compartilhamento))}</p>
        ${planta.referencia ? `<p class="planta-desc">${escaparHtml(planta.referencia)}</p>` : ""}
        ${planta.observacao ? `<p class="planta-desc">${escaparHtml(planta.observacao)}</p>` : ""}
        <div class="planta-acoes"><button type="button" data-acao="mapa">Ver no mapa ↗</button>${modoOnline && !planta.exemplo ? '<button type="button" data-acao="compartilhar">Compartilhar</button>' : ''}${!modoOnline && !planta.exemplo ? '<button type="button" class="excluir" data-acao="excluir">Excluir meu cadastro</button>' : ''}</div>
      </div>`;
    for (const btn of cartao.querySelectorAll("button")) btn.dataset.id = planta.id;
    lista.appendChild(cartao);
  }
  desenharPontos(resultado);
  if (modoOnline) {
    $("statusDados").textContent = avisoOnline || (carregandoOnline ? "Carregando cadastros..." : "🌐 Cadastros compartilhados");
    $("notaDemonstracao").textContent = "ℹ️ Cadastros enviados para a nuvem podem ser vistos por qualquer visitante. Compartilhe apenas informações públicas e autorizadas.";
  } else {
    $("statusDados").textContent = "💻 Demonstração neste navegador";
    $("notaDemonstracao").textContent = "ℹ️ Os pontos com a marca EXEMPLO FICTÍCIO não são locais reais. Os novos cadastros ficam salvos somente neste navegador até que o banco de dados seja configurado.";
  }
}

// 4. Mapa gratuito com Leaflet + OpenStreetMap
function criarMapa() {
  if (!window.L) { $("avisoMapa").hidden = false; return; }
  mapa = L.map("mapa", { scrollWheelZoom:false }).setView(CENTRO_PAULISTA, 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom:19
  }).addTo(mapa);
  camadaPlantas = L.layerGroup().addTo(mapa);
  mapa.on("click", function (evento) {
    if (escolhendoPonto) {
      pontoCadastro = { latitude:Number(evento.latlng.lat.toFixed(3)), longitude:Number(evento.latlng.lng.toFixed(3)) };
      escolhendoPonto = false;
      $("btnMarcarMapa").textContent = "📍 Marcar no mapa";
      atualizarPontoCadastro();
      toast("Ponto aproximado escolhido para o cadastro.");
    }
  });
}
function desenharPontos(plantas) {
  if (!mapa || !camadaPlantas) return;
  camadaPlantas.clearLayers();
  marcadoresPorId.clear();
  for (const planta of plantas) {
    const lat = Number(planta.latitude), lng = Number(planta.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const cor = planta.tipo === "hortalica" ? "#e6a63d" : "#208c57";
    const marcador = L.circleMarker([lat,lng], { radius:11, color:"#fff", weight:3, fillColor:cor, fillOpacity:.95 });
    const popup = document.createElement("div");
    const titulo = document.createElement("strong");
    titulo.textContent = `${acharEspecie(planta.especie)?.emoji || "🌱"} ${planta.especie}`;
    const texto = document.createElement("p");
    texto.textContent = `${planta.bairro} • ${textoCompartilha(planta.compartilhamento)}`;
    const aviso = document.createElement("small");
    aviso.textContent = planta.exemplo ? "Atenção: exemplo fictício, não visitar para colher." : "Posição aproximada. Respeite as autorizações locais.";
    popup.append(titulo,texto,aviso);
    marcador.bindPopup(popup);
    marcador.addTo(camadaPlantas);
    marcadoresPorId.set(planta.id, marcador);
  }
}
function mostrarNoMapa(id) {
  const planta = dadosAtuais().find((p) => p.id === id);
  if (!planta) return;
  if (!mapa) { toast("Para usar o mapa, conecte-se à internet."); return; }
  mapa.setView([Number(planta.latitude),Number(planta.longitude)], 15);
  marcadoresPorId.get(id)?.openPopup();
  $("mapa").scrollIntoView({ behavior:"smooth", block:"center" });
}
function atualizarPontoCadastro() {
  if (mapa && marcadorCadastro) { mapa.removeLayer(marcadorCadastro); marcadorCadastro = null; }
  if (!pontoCadastro) {
    $("localSelecionado").textContent = "Nenhum ponto selecionado.";
    return;
  }
  $("localSelecionado").textContent = `✓ Ponto aproximado: ${pontoCadastro.latitude.toFixed(3)}, ${pontoCadastro.longitude.toFixed(3)} — não é uma localização exata.`;
  if (mapa) {
    marcadorCadastro = L.marker([pontoCadastro.latitude,pontoCadastro.longitude]).addTo(mapa).bindPopup("Ponto aproximado escolhido para o cadastro");
    mapa.setView([pontoCadastro.latitude,pontoCadastro.longitude], 14);
  }
}

// 5. GPS — só funciona se a pessoa conceder permissão (HTTPS ou localhost)
function pedirGps(usarNoCadastro) {
  if (!navigator.geolocation) { toast("Este navegador não possui suporte a GPS."); return; }
  toast("Solicitando permissão de localização ao navegador...");
  navigator.geolocation.getCurrentPosition(
    function (posicao) {
      usuario = {latitude:posicao.coords.latitude,longitude:posicao.coords.longitude};
      if (mapa) {
        if (marcadorUsuario) mapa.removeLayer(marcadorUsuario);
        marcadorUsuario = L.circleMarker([usuario.latitude,usuario.longitude], {radius:9, color:"white", weight:3, fillColor:"#3778f6", fillOpacity:1}).addTo(mapa).bindPopup("Sua localização atual (não publicada)");
        mapa.setView([usuario.latitude,usuario.longitude], 13);
      }
      if (usarNoCadastro) {
        // Arredondar a 3 casas reduz a precisão dos dados publicados (~100 m).
        pontoCadastro = {latitude:Number(usuario.latitude.toFixed(3)),longitude:Number(usuario.longitude.toFixed(3))};
        atualizarPontoCadastro();
        $("localSelecionado").textContent += " Confirme que o ponto pode ser divulgado antes de salvar.";
      }
      atualizarTela();
      toast("Localização autorizada. Distâncias aproximadas atualizadas.");
    },
    function (erro) {
      if (erro.code === 1) toast("Permissão negada. Você pode continuar usando o mapa sem GPS.");
      else toast("Não foi possível obter sua localização. Use HTTPS/localhost ou marque no mapa.");
    },
    {enableHighAccuracy:false,timeout:15000,maximumAge:60000}
  );
}

// 6. Cadastro de espécies, época de colheita e armazenamento
function prepararFormulario() {
  const select = $("especie");
  for (const especie of ESPECIES) {
    const opcao = document.createElement("option");
    opcao.value = especie.nome;
    opcao.textContent = `${especie.emoji} ${especie.nome}`;
    select.appendChild(opcao);
  }
  const outra = document.createElement("option");
  outra.value = "outra";
  outra.textContent = "🌱 Outra espécie";
  select.appendChild(outra);

  const mesesContainer = $("mesesCheckboxes");
  for (let indice = 0; indice < MESES.length; indice++) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(indice + 1);
    checkbox.name = "meses";
    label.append(checkbox,document.createTextNode(MESES[indice]));
    mesesContainer.appendChild(label);
  }
  select.addEventListener("change", function () {
    const outraSelecionada = select.value === "outra";
    $("campoOutraEspecie").hidden = !outraSelecionada;
    const info = acharEspecie(select.value);
    if (info) $("tipoPlanta").value = info.tipo;
    for (const checkbox of document.querySelectorAll('input[name="meses"]')) checkbox.checked = info ? info.meses.includes(Number(checkbox.value)) : false;
  });
}
function camposMeses() {
  return Array.from(document.querySelectorAll('input[name="meses"]:checked')).map((item) => Number(item.value));
}
function validarFormulario() {
  const pessoa = $("nomePessoa").value.trim();
  const bairro = $("bairro").value.trim();
  const escolha = $("especie").value;
  const especie = escolha === "outra" ? $("outraEspecie").value.trim() : escolha;
  if (pessoa.length < 2 || bairro.length < 2 || especie.length < 2) return "Preencha seu nome, o bairro e a espécie (mínimo de 2 caracteres).";
  if (!pontoCadastro) return "Escolha um ponto aproximado pelo GPS ou marcando no mapa.";
  if (!$("autoriza").checked) return "É necessário confirmar a permissão para cadastrar o local.";
  const textoCompleto = `${bairro} ${$("referencia").value} ${$("observacao").value}`;
  if (/\b(?:rua|avenida|travessa)\b.{0,60}\b(?:n[º°.]?|número)\s*\d+/i.test(textoCompleto)) {
    return "Por segurança, retire números de endereço residencial. Use somente referências públicas.";
  }
  return "";
}
function dadosFormulario() {
  const escolha = $("especie").value;
  return {
    especie: escolha === "outra" ? $("outraEspecie").value.trim() : escolha,
    tipo: $("tipoPlanta").value,
    bairro: $("bairro").value.trim(),
    referencia: $("referencia").value.trim(),
    responsavel: $("nomePessoa").value.trim(),
    compartilhamento: $("compartilhamento").value,
    observacao: $("observacao").value.trim(),
    meses: camposMeses(),
    latitude:pontoCadastro.latitude,
    longitude:pontoCadastro.longitude
  };
}
async function registrarPlanta(evento) {
  evento.preventDefault();
  const erro = validarFormulario();
  if (erro) { feedback(erro,true); toast(erro); return; }
  const dados = dadosFormulario();
  const botao = $("btnCadastrar");
  botao.disabled = true;
  botao.textContent = "Salvando cadastro...";
  try {
    if (modoOnline) {
      // Sem Supabase Auth, o banco aceita apenas leitura e novo cadastro público.
      // Edição/exclusão remotas exigiriam autenticação (não incluídas neste MVP).
      await requisicaoSupabase("POST", "plantas", dados);
      await carregarNuvem();
      feedback("Cadastro compartilhado com sucesso! Ele já pode aparecer para outros visitantes.");
    } else {
      dados.id = "local-" + Date.now() + "-" + Math.floor(Math.random()*100000);
      dados.criado_em = new Date().toISOString();
      locais.unshift(dados);
      if (!guardarCadastrosLocais()) throw new Error("Seu navegador bloqueou o armazenamento local.");
      atualizarTela();
      feedback("Planta cadastrada neste navegador! Para publicar para toda a comunidade, configure o banco de dados no arquivo config.js.");
    }
    $("formCadastro").reset();
    $("campoOutraEspecie").hidden = true;
    pontoCadastro = null;
    atualizarPontoCadastro();
    toast("Planta cadastrada com sucesso! 🌱");
  } catch (erro) {
    feedback("Não foi possível cadastrar: " + erro.message,true);
  } finally {
    botao.disabled = false;
    botao.innerHTML = 'Cadastrar planta <span aria-hidden="true">→</span>';
  }
}

// 7. Banco de dados opcional (Supabase REST API)
async function requisicaoSupabase(metodo, caminho, corpo) {
  const url = `${urlSupabase}/rest/v1/${caminho}`;
  const opcoes = {
    method:metodo,
    headers:{ "apikey":chaveSupabase, "Content-Type":"application/json", "Prefer":"return=minimal" }
  };
  if (corpo) opcoes.body = JSON.stringify(corpo);
  const resposta = await fetch(url,opcoes);
  if (!resposta.ok) {
    // Não exibir mensagens internas do banco diretamente para visitantes.
    throw new Error(`Servidor respondeu ${resposta.status}. Confira a configuração, a tabela e as permissões do banco.`);
  }
  return metodo === "GET" ? resposta.json() : null;
}
async function carregarNuvem() {
  if (!modoOnline) return;
  carregandoOnline = true;
  avisoOnline = "";
  atualizarTela();
  try {
    const colunas = "id,especie,tipo,bairro,referencia,responsavel,compartilhamento,observacao,latitude,longitude,meses,criado_em";
    const caminho = `plantas?select=${colunas}&order=criado_em.desc&limit=300`;
    nuvem = await requisicaoSupabase("GET", caminho);
  } catch (erro) {
    avisoOnline = "⚠️ Falha na conexão com o banco";
    toast("Não foi possível acessar os cadastros compartilhados. Verifique a configuração.");
  } finally {
    carregandoOnline = false;
    atualizarTela();
  }
}

// 8. Safra do mês
function montarSafra() {
  const atual = mesAtual();
  $("mesAtual").textContent = `📆 ${MESES_LONGOS[atual - 1].charAt(0).toUpperCase() + MESES_LONGOS[atual - 1].slice(1)}`;
  const elegiveis = ESPECIES.filter((especie) => especie.tipo === "frutifera" && especie.meses.includes(atual)).slice(0,6);
  const caixa = $("listaEstacao");
  caixa.innerHTML = "";
  for (const especie of elegiveis) {
    const card = document.createElement("article");
    card.className = "safra-card";
    card.innerHTML = `<span aria-hidden="true">${especie.emoji}</span><div><strong>${escaparHtml(especie.nome)}</strong><small>Época estimada</small></div>`;
    caixa.appendChild(card);
  }
}

// 9. Compartilhar e excluir
async function compartilharPlanta(id) {
  const planta = dadosAtuais().find((item) => item.id === id);
  if (!planta || !modoOnline) return;
  const link = new URL(window.location.href);
  link.searchParams.set("planta",id);
  link.hash = "explorar";
  const mensagem = `Veja ${planta.especie} no Paulista Verde (${planta.bairro}). Os locais são aproximados; combine qualquer coleta com autorização.`;
  try {
    if (navigator.share) await navigator.share({title:"Paulista Verde",text:mensagem,url:link.toString()});
    else if (navigator.clipboard) { await navigator.clipboard.writeText(`${mensagem} ${link}`); toast("Link da planta copiado!"); }
    else { window.prompt("Copie o link:",link.toString()); }
  } catch (erro) {
    // Cancelar a caixa de compartilhar não é um erro de cadastro.
    if (erro.name !== "AbortError") toast("Não foi possível compartilhar no momento.");
  }
}
function excluirCadastro(id) {
  if (modoOnline || !id.startsWith("local-")) return;
  if (!confirm("Excluir este cadastro salvo neste navegador?")) return;
  locais = locais.filter((item) => item.id !== id);
  guardarCadastrosLocais();
  atualizarTela();
  toast("Cadastro local excluído.");
}

// 10. Ligar os botões aos eventos
function ligarEventos() {
  for (const id of ["busca","filtroTipo","filtroEpoca","filtroOrdem"]) {
    $(id).addEventListener(id === "busca" ? "input" : "change",atualizarTela);
  }
  $("btnMinhaLocalizacao").addEventListener("click", () => pedirGps(false));
  $("btnUsarGpsCadastro").addEventListener("click", () => pedirGps(true));
  $("btnMarcarMapa").addEventListener("click",function () {
    if (!mapa) { toast("O mapa precisa de internet. Tente usar o botão de GPS."); return; }
    escolhendoPonto = !escolhendoPonto;
    this.textContent = escolhendoPonto ? "✓ Clique no mapa acima" : "📍 Marcar no mapa";
    $("mapa").scrollIntoView({behavior:"smooth",block:"center"});
    toast(escolhendoPonto ? "Clique sobre uma região no mapa para escolher o ponto aproximado." : "Seleção cancelada.");
  });
  $("btnLimparPonto").addEventListener("click",function () {
    pontoCadastro = null; escolhendoPonto = false;
    $("btnMarcarMapa").textContent = "📍 Marcar no mapa";
    atualizarPontoCadastro();
  });
  $("formCadastro").addEventListener("submit",registrarPlanta);
  $("listaPlantas").addEventListener("click",function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    const id = botao.dataset.id;
    if (botao.dataset.acao === "mapa") mostrarNoMapa(id);
    if (botao.dataset.acao === "compartilhar") compartilharPlanta(id);
    if (botao.dataset.acao === "excluir") excluirCadastro(id);
  });
}

// 11. Iniciar o projeto
async function iniciar() {
  $("anoAtual").textContent = new Date().getFullYear();
  prepararFormulario();
  montarSafra();
  criarMapa();
  ligarEventos();
  atualizarTela();
  if (modoOnline) await carregarNuvem();
  const destaque = new URLSearchParams(window.location.search).get("planta");
  if (destaque && dadosAtuais().some((item) => item.id === destaque)) mostrarNoMapa(destaque);
}
iniciar();

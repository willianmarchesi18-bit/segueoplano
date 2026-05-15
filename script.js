const botoes = document.querySelectorAll(".menu-inferior button");
const telas = document.querySelectorAll(".tela");

botoes[0].addEventListener("click", () => mostrarTela("rotina"));
botoes[1].addEventListener("click", () => mostrarTela("mes"));
botoes[2].addEventListener("click", () => mostrarTela("anotacoes"));

function mostrarTela(id) {
  telas.forEach((tela) => tela.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

/* ROTINA */

const formRotina = document.getElementById("form-rotina");
const inputRotina = document.getElementById("input-rotina");
const listaRotina = document.getElementById("lista-rotina");

let rotinas = JSON.parse(localStorage.getItem("rotinas")) || [];

renderizarRotinas();

formRotina.addEventListener("submit", (event) => {
  event.preventDefault();

  const texto = inputRotina.value.trim();
  if (texto === "") return;

  rotinas.push({
    texto: texto,
    concluida: false
  });

  inputRotina.value = "";
  salvarRotinas();
});

function salvarRotinas() {
  localStorage.setItem("rotinas", JSON.stringify(rotinas));
  renderizarRotinas();
}

function renderizarRotinas() {
  listaRotina.innerHTML = "";

  rotinas.forEach((rotina, index) => {
    const li = document.createElement("li");

    li.setAttribute("draggable", "true");
    li.setAttribute("data-index", index);

    li.innerHTML = `
      <div class="lado-esquerdo">
        <span class="arrastar">☰</span>
        <input type="checkbox" ${rotina.concluida ? "checked" : ""}>
        <span class="${rotina.concluida ? "concluida" : ""}">
          ${rotina.texto}
        </span>
      </div>

      <button class="excluir">X</button>
    `;

    li.querySelector("input").addEventListener("change", (event) => {
      rotinas[index].concluida = event.target.checked;
      salvarRotinas();
    });

    li.querySelector(".excluir").addEventListener("click", () => {
      rotinas.splice(index, 1);
      salvarRotinas();
    });

    li.addEventListener("dragstart", () => {
      li.classList.add("arrastando");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("arrastando");
      atualizarOrdemRotinas();
    });

    listaRotina.appendChild(li);
  });
}

listaRotina.addEventListener("dragover", (event) => {
  event.preventDefault();

  const itemArrastando = document.querySelector(".arrastando");
  const itemAbaixo = pegarItemAbaixo(listaRotina, event.clientY);

  if (!itemArrastando) return;

  if (itemAbaixo == null) {
    listaRotina.appendChild(itemArrastando);
  } else {
    listaRotina.insertBefore(itemArrastando, itemAbaixo);
  }
});

function pegarItemAbaixo(container, y) {
  const itens = [...container.querySelectorAll("li:not(.arrastando)")];

  return itens.reduce((maisProximo, item) => {
    const box = item.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > maisProximo.offset) {
      return { offset: offset, element: item };
    }

    return maisProximo;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function atualizarOrdemRotinas() {
  const itens = listaRotina.querySelectorAll("li");
  const novaOrdem = [];

  itens.forEach((item) => {
    const indexAntigo = item.getAttribute("data-index");
    novaOrdem.push(rotinas[indexAntigo]);
  });

  rotinas = novaOrdem;
  salvarRotinas();
}

/* CALENDÁRIO E CONTAS */

const tituloCalendario = document.getElementById("titulo-calendario");
const calendario = document.getElementById("calendario");
const btnMesAnterior = document.getElementById("mes-anterior");
const btnMesProximo = document.getElementById("mes-proximo");

const formConta = document.getElementById("form-conta");
const nomeConta = document.getElementById("nome-conta");
const valorConta = document.getElementById("valor-conta");
const dataConta = document.getElementById("data-conta");
const listaContas = document.getElementById("lista-contas");

let hoje = new Date();
let mesAtual = hoje.getMonth();
let anoAtual = hoje.getFullYear();

let contas = JSON.parse(localStorage.getItem("contas")) || [];

preencherDataAtual();
criarCalendario();
renderizarContas();

function preencherDataAtual() {
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  dataConta.value = `${ano}-${mes}-${dia}`;
}

function criarCalendario() {
  calendario.innerHTML = "";

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  tituloCalendario.textContent = `${nomesMeses[mesAtual]} de ${anoAtual}`;

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  diasSemana.forEach((dia) => {
    const div = document.createElement("div");
    div.classList.add("dia-semana");
    div.textContent = dia;
    calendario.appendChild(div);
  });

  for (let i = 0; i < primeiroDia; i++) {
    calendario.appendChild(document.createElement("div"));
  }

  for (let dia = 1; dia <= ultimoDia; dia++) {
    const div = document.createElement("div");
    div.classList.add("dia-calendario");

    const dataDoDia = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    div.textContent = dia;

    const dataComparacao = new Date(anoAtual, mesAtual, dia);
    const hojeLimpo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    if (dataComparacao < hojeLimpo) {
      div.classList.add("dia-passado");
    }

    if (
      dia === hoje.getDate() &&
      mesAtual === hoje.getMonth() &&
      anoAtual === hoje.getFullYear()
    ) {
      div.classList.add("dia-hoje");
    }

    const existeContaNesseDia = contas.some((conta) => conta.data === dataDoDia);

    if (existeContaNesseDia) {
      const bolinha = document.createElement("span");
      bolinha.classList.add("bolinha-verde");
      div.appendChild(bolinha);
    }

   div.addEventListener("click", () => {

  document.querySelectorAll(".dia-calendario").forEach((dia) => {
    dia.classList.remove("dia-selecionado");
  });

  div.classList.add("dia-selecionado");

  dataConta.value = dataDoDia;

  destacarContasDoDia(dataDoDia);
});

    calendario.appendChild(div);
  }
}

btnMesAnterior.addEventListener("click", () => {
  mesAtual--;

  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }

  criarCalendario();
});

btnMesProximo.addEventListener("click", () => {
  mesAtual++;

  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }

  criarCalendario();
});

formConta.addEventListener("submit", (event) => {
  event.preventDefault();

  const nome = nomeConta.value.trim();
  const valor = valorConta.value.trim();
  const data = dataConta.value;

  if (nome === "" || valor === "" || data === "") return;

 contas.push({
  nome: nome,
  valor: valor,
  data: data,
  paga: false
});

  salvarContas();

  nomeConta.value = "";
  valorConta.value = "";
  preencherDataAtual();
});

function salvarContas() {
  localStorage.setItem("contas", JSON.stringify(contas));
  renderizarContas();
  criarCalendario();
}

function renderizarContas() {
  listaContas.innerHTML = "";

  contas.forEach((conta, index) => {
    const li = document.createElement("li");

    li.setAttribute("data-conta", conta.data);

  li.innerHTML = `
  <div class="lado-esquerdo">

    <button class="btn-pago ${conta.paga ? "pago" : ""}">
      ✓
    </button>

    <span class="texto-conta ${conta.paga ? "conta-paga" : ""}">
      ${conta.nome} - R$ ${conta.valor} - ${formatarData(conta.data)}
    </span>

  </div>

  <button class="excluir">X</button>
`;

    li.querySelector(".btn-pago").addEventListener("click", () => {
    contas[index].paga = !contas[index].paga;
    salvarContas();
    });

    li.querySelector(".excluir").addEventListener("click", () => {
      contas.splice(index, 1);
      salvarContas();
    });

    listaContas.appendChild(li);
  });
}

function formatarData(data) {
  const partes = data.split("-");
  const mes = partes[1];
  const dia = partes[2];

  return `${dia}/${mes}`;
}

function destacarContasDoDia(dataSelecionada) {
  renderizarContas();

  const itens = Array.from(listaContas.querySelectorAll("li"));

  const contasDoDia = itens.filter((item) => {
    return item.getAttribute("data-conta") === dataSelecionada;
  });

  if (contasDoDia.length === 0) return;

  contasDoDia.forEach((item) => {
    item.classList.add("conta-destacada");
    listaContas.prepend(item);
  });
}

/* ANOTAÇÕES */

const btnAnotacao = document.getElementById("btn-anotacao");
const btnLista = document.getElementById("btn-lista");

const formAnotacao = document.getElementById("form-anotacao");
const inputAnotacao = document.getElementById("input-anotacao");

const formLista = document.getElementById("form-lista");
const inputItemLista = document.getElementById("input-item-lista");
const btnAdicionarItem = document.getElementById("btn-adicionar-item");
const previewLista = document.getElementById("preview-lista");

const listaAnotacoes = document.getElementById("lista-anotacoes");

let anotacoes = JSON.parse(localStorage.getItem("anotacoes")) || [];
let itensListaTemporaria = [];

renderizarAnotacoes();

btnAnotacao.addEventListener("click", () => {
  formAnotacao.classList.remove("escondido");
  formLista.classList.add("escondido");

  btnAnotacao.classList.add("tipo-ativo");
  btnLista.classList.remove("tipo-ativo");
});

btnLista.addEventListener("click", () => {
  formLista.classList.remove("escondido");
  formAnotacao.classList.add("escondido");

  btnLista.classList.add("tipo-ativo");
  btnAnotacao.classList.remove("tipo-ativo");
});

formAnotacao.addEventListener("submit", (event) => {
  event.preventDefault();

  const texto = inputAnotacao.value.trim();

  if (texto === "") return;

  anotacoes.unshift({
    tipo: "anotacao",
    texto: texto
  });

  inputAnotacao.value = "";
  salvarAnotacoes();
});

btnAdicionarItem.addEventListener("click", () => {
  adicionarItemTemporario();
});

inputItemLista.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    adicionarItemTemporario();
  }
});

function adicionarItemTemporario() {
  const item = inputItemLista.value.trim();

  if (item === "") return;

  itensListaTemporaria.push({
    texto: item,
    concluido: false
  });

  inputItemLista.value = "";
  renderizarPreviewLista();
}

formLista.addEventListener("submit", (event) => {
  event.preventDefault();

  if (itensListaTemporaria.length === 0) return;

  anotacoes.unshift({
    tipo: "lista",
    itens: itensListaTemporaria
  });

  itensListaTemporaria = [];
  renderizarPreviewLista();
  salvarAnotacoes();
});

function renderizarPreviewLista() {
  previewLista.innerHTML = "";

  itensListaTemporaria.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${item.texto}</span>
      <button type="button" class="excluir">X</button>
    `;

    li.querySelector(".excluir").addEventListener("click", () => {
      itensListaTemporaria.splice(index, 1);
      renderizarPreviewLista();
    });

    previewLista.appendChild(li);
  });
}

function salvarAnotacoes() {
  localStorage.setItem("anotacoes", JSON.stringify(anotacoes));
  renderizarAnotacoes();
}

function renderizarAnotacoes() {
  listaAnotacoes.innerHTML = "";

  anotacoes.forEach((anotacao, index) => {
    const bloco = document.createElement("div");

    bloco.classList.add("bloco-anotacao");

    if (anotacao.tipo === "lista") {
      bloco.innerHTML = `
        <div>
          <strong>Lista</strong>

          <ul>
            ${anotacao.itens.map((item, itemIndex) => `
              <li class="item-lista ${item.concluido ? "item-concluido" : ""}" 
                  data-anotacao="${index}" 
                  data-item="${itemIndex}">
                ${item.texto}
              </li>
            `).join("")}
          </ul>
        </div>

        <button class="excluir-anotacao">X</button>
      `;
    } else {
      bloco.innerHTML = `
        <div>
          <strong>Anotação</strong>
          <p>${anotacao.texto}</p>
        </div>

        <button class="excluir-anotacao">X</button>
      `;
    }

    bloco.querySelector(".excluir-anotacao").addEventListener("click", () => {
      anotacoes.splice(index, 1);
      salvarAnotacoes();
    });

    const itensLista = bloco.querySelectorAll(".item-lista");

    itensLista.forEach((itemElemento) => {
      itemElemento.addEventListener("click", () => {
        const anotacaoIndex = itemElemento.getAttribute("data-anotacao");
        const itemIndex = itemElemento.getAttribute("data-item");

        anotacoes[anotacaoIndex].itens[itemIndex].concluido =
          !anotacoes[anotacaoIndex].itens[itemIndex].concluido;

        salvarAnotacoes();
      });
    });

    listaAnotacoes.appendChild(bloco);
  });
}

const avisoPwa = document.getElementById("aviso-pwa");

const appInstalado = window.matchMedia('(display-mode: standalone)').matches;

if (!appInstalado) {

  setTimeout(() => {
    avisoPwa.classList.remove("escondido");
  }, 2000);

  setTimeout(() => {
    avisoPwa.classList.add("escondido");
  }, 7000);

}

const campos = document.querySelectorAll("input, textarea");

campos.forEach((campo) => {
  campo.addEventListener("focus", () => {

    setTimeout(() => {
      campo.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 300);

  });
});
const entradaValor = document.getElementById('entrada');
const btnAdicionar = document.getElementById('adicionar');
const radioReceita = document.getElementById('tipo-receita');
const radioDespesa = document.getElementById('tipo-despesa');
const nomeInput = document.getElementById('nome');
const data = document.getElementById('data');
const corpoTabela = document.getElementById('corpo-tabela');
const displayLucro = document.getElementById('lucro');
const displayDespesas = document.getElementById('despesas');
const displayTotal = document.getElementById('total');
const displayNumTransacoes = document.getElementById('numTransacoes')
const areaDatalist = document.getElementById('area')
const dataList = document.getElementById('opcoes-area')


let indiceEditando = null;
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];


function salvarTransacoes() {
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

function atualizarResumo() {
    let receita = 0;
    let despesa = 0;
    let numTransacoes = 0

    for (let i = 0; i < transacoes.length; i++) {
        let transacao = transacoes[i];
        if (transacao.tipo === 'receita') {
            receita += transacao.valor;
        } else if (transacao.tipo === 'despesa') {
            despesa += transacao.valor;
        }
    }

    let total = receita - despesa;

    displayLucro.textContent = "R$ " + receita.toFixed(2);
    displayDespesas.textContent = "R$ " + despesa.toFixed(2);
    displayTotal.textContent = "R$ " + total.toFixed(2);
    displayNumTransacoes.textContent = transacoes.length
}

function adicionarDataList() {
    const valor = areaDatalist.value.trim();

    if (valor === '') {
        return;
    }

    const opcoes = dataList.querySelectorAll('option');

    for (let i = 0; i < opcoes.length; i++) {
        if (opcoes[i].value.toLowerCase() === valor.toLowerCase()) {
            return;
        }
    }

    const novaOpcao = document.createElement('option');
    novaOpcao.value = valor;

    dataList.appendChild(novaOpcao);
}

function renderizarLista() {
    corpoTabela.innerHTML = '';

    for (let i = 0; i < transacoes.length; i++) {
        let transacao = transacoes[i];


        const tr = document.createElement('tr');
        tr.id = `item-${i + 1}`;

        let corTexto = transacao.tipo === 'receita' ? '#629148' : '#ff5040';


        tr.innerHTML = `
            <td>${transacao.area}</td>
            <td>${transacao.nome}</td>
            <td style="color: ${corTexto}; font-weight: bold;">R$ ${transacao.valor.toFixed(2).replace('.', ',')}</td>
            <td>${transacao.data.split('/').reverse().join('/')}</td>
            <td id="acoes-${i + 1}">
                <button id="editar-${i + 1}" class="editar" onclick="editarTransacao(${i})"><img style="width: 25px; height: 25px;" src="/lapis.png" alt="Editar"></button>
                <button id="remover-${i + 1}" class="remover" onclick="removerTransacao(${i})"><img style="width: 25px; height: 25px;" src="/lixeira.png" alt="Remover"></button>
            </td>
        `;


        corpoTabela.appendChild(tr);
    }
}




function adicionarTransacao() {
    const valor = parseFloat(entradaValor.value);
    let tipo = '';
    if (radioReceita.checked) {
        tipo = 'receita';
    } else if (radioDespesa.checked) {
        tipo = 'despesa';
    }
    const nomeTexto = nomeInput.value;
    if (isNaN(valor) || valor <= 0 || !tipo || !nomeTexto || !data.value || !areaDatalist.value) {
        alert('Por favor, preencha todos os campos corretamente!');
        return;
    }

    if (data.value > new Date().toISOString().split('T')[0]) {
        alert('A data não pode ser futura!');
        return;
    }
    const transacao = {
        valor: valor,
        tipo: tipo,
        nome: nomeTexto,
        data: data.value.replace(/-/g, '/'),
        area: areaDatalist.value
    };
    if (indiceEditando !== null) {
        transacoes[indiceEditando] = transacao;
        indiceEditando = null;
    } else {
        transacoes.push(transacao); 
    }
    salvarTransacoes();
    adicionarDataList()


    entradaValor.value = '';
    radioReceita.checked = false;
    radioDespesa.checked = false;
    nomeInput.value = '';
    data.value = '';
    areaDatalist.value = '';

    renderizarLista();
    atualizarResumo();

}

function removerTransacao(i) {
    transacoes.splice(i, 1)
    salvarTransacoes();
    renderizarLista();
    atualizarResumo()

}

function editarTransacao(i) {
    const transacao = transacoes[i];
    areaDatalist.value = transacao.area;
    nomeInput.value = transacao.nome;
    entradaValor.value = transacao.valor;
    data.value = transacao.data.replace(/\//g, '-');

    if (transacao.tipo === 'receita') {
        radioReceita.checked = true;
    } else {
        radioDespesa.checked = true;
    }

    indiceEditando = i;
}

btnAdicionar.addEventListener('click', adicionarTransacao);

const btnGraficos = document.getElementById('graficos');

btnGraficos.addEventListener('click', function() {
    window.location.href = 'dashboards.html';
});

renderizarLista();
atualizarResumo();

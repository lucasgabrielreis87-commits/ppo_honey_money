let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];
const displayLucro = document.getElementById('receita');
const displayDespesas = document.getElementById('despesas');
const displayTotal = document.getElementById('total');
const displayNumTransacoes = document.getElementById('numTransacoes');
const selectFiltro = document.getElementById('filtroPeriodo');
const btnVoltar = document.getElementById('voltar');
const displayMaiorReceita = document.getElementById('maiorReceita');
const displayMaiorDespesa = document.getElementById('maiorDespesa');
const displayMaiorCategoria = document.getElementById('maiorCategoria');
const displayMediaGastos = document.getElementById('mediaGastos');
const displayDiferencaMes = document.getElementById('diferencaMes');
const canvasCategorias = document.getElementById('canvas-categorias');
let graficoCategorias;
const canvasDespesasReceitas = document.getElementById('canvas-despesasxreceitas');
let graficoDespesasReceitas;
const canvasEvolucaoSaldo = document.getElementById('canvas-evolucao-saldo');
let graficoEvolucaoSaldo;

function atualizarResumo(lista) {

    let receita = 0;
    let despesa = 0;

    for (let i = 0; i < lista.length; i++) {

        let transacao = lista[i];

        if (transacao.tipo === 'receita') {
            receita += transacao.valor;

        } else if (transacao.tipo === 'despesa') {
            despesa += transacao.valor;
        }
    }

    let total = receita - despesa;

    displayLucro.textContent =
        "R$ " + receita.toFixed(2);

    displayDespesas.textContent =
        "R$ " + despesa.toFixed(2);

    displayTotal.textContent =
        "R$ " + total.toFixed(2);

    displayNumTransacoes.textContent =
        lista.length;
}

function filtrarPeriodo() {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const filtro = selectFiltro.value;

    if (filtro === 'tudo') {

        return transacoes;
    } if (filtro === 'mes') {

        return transacoes.filter(transacao => {

            const [ano, mes] =
                transacao.data.split('/').map(Number);

            return ano === anoAtual &&
                mes === mesAtual;
        });
    }

    if (filtro === 'mesAnterior') {

        let mesAnterior = mesAtual - 1;
        let anoAnterior = anoAtual;

        if (mesAnterior === 0) {
            mesAnterior = 12;
            anoAnterior--;
        }

        return transacoes.filter(transacao => {

            const [ano, mes] = transacao.data.split('/').map(Number);
            return ano === anoAnterior &&
                mes === mesAnterior;
        });
    }

    if (filtro === 'ano') {

        return transacoes.filter(transacao => {

            const [ano] = transacao.data.split('/').map(Number);
            return ano === anoAtual;
        });
    }
    return transacoes;
}

function atualizarMaiorReceita(lista) {
    let maior = null;

    for (let i = 0; i < lista.length; i++) {

        if (lista[i].tipo === 'receita') {

            if (
                maior === null ||
                lista[i].valor > maior.valor
            ) {

                maior = lista[i];
            }
        }
    }


    if (maior === null) {
        displayMaiorReceita.textContent =
            "R$ 00,00";
    } else {
        displayMaiorReceita.innerHTML =
            maior.nome +
            "<br> R$ " +
            maior.valor.toFixed(2);
    }
}

function atualizarMaiorDespesa(lista) {

    let maior = null;

    for (let i = 0; i < lista.length; i++) {

        if (lista[i].tipo === 'despesa') {

            if (
                maior === null ||
                lista[i].valor > maior.valor
            ) {

                maior = lista[i];
            }
        }
    }

    if (maior === null) {
        displayMaiorDespesa.textContent =
            "R$ 00,00";

    } else {
        displayMaiorDespesa.innerHTML =
            maior.nome +
            "<br> R$ " +
            maior.valor.toFixed(2);
    }
}

function atualizarMaiorCategoria(lista) {

    let categorias = {};


    for (let i = 0; i < lista.length; i++) {

        let transacao = lista[i];

        if (transacao.tipo === 'despesa') {

            let categoria = transacao.area;

            if (categorias[categoria] === undefined) {

                categorias[categoria] = 0;
            }

            categorias[categoria] += transacao.valor;
        }
    }


    let maiorCategoria = null;
    let maiorValor = 0;


    for (let categoria in categorias) {

        if (categorias[categoria] > maiorValor) {

            maiorValor = categorias[categoria];

            maiorCategoria = categoria;
        }
    }


    if (maiorCategoria === null) {

        displayMaiorCategoria.textContent =
            "Nenhuma";

    } else {

        displayMaiorCategoria.innerHTML =
            maiorCategoria +
            "<br> R$ " +
            maiorValor.toFixed(2);
    }
}

function atualizarMediaGastos(lista) {

    let totalDespesas = 0;


    for (let i = 0; i < lista.length; i++) {

        if (lista[i].tipo === 'despesa') {

            totalDespesas += lista[i].valor;
        }
    }


    if (lista.length === 0) {

        displayMediaGastos.textContent =
            "R$ 0,00";

        return;
    }


    const hoje = new Date();

    const filtro = selectFiltro.value;

    let dias;

    if (filtro === 'mes') {

        dias = hoje.getDate();
    }

    else if (filtro === 'mesAnterior') {

        dias = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            0
        ).getDate();
    }

    else if (filtro === 'ano') {

        const inicioAno =
            new Date(hoje.getFullYear(), 0, 1);

        const diferenca =
            hoje - inicioAno;

        dias =
            Math.floor(
                diferenca /
                (1000 * 60 * 60 * 24)
            ) + 1;
    }

    else {

        if (lista.length === 0) {

            dias = 1;

        } else {

            let datas = lista.map(transacao => {

                const [ano, mes, dia] =
                    transacao.data
                        .split('/')
                        .map(Number);

                return new Date(
                    ano,
                    mes - 1,
                    dia
                );
            });


            let menorData =
                Math.min(...datas);

            let maiorData =
                Math.max(...datas);


            dias =
                Math.floor(
                    (maiorData - menorData) /
                    (1000 * 60 * 60 * 24)
                ) + 1;
        }
    }


    const media =
        totalDespesas / dias;


    displayMediaGastos.textContent =
        "R$ " + media.toFixed(2);
}

function calcularSaldo(lista) {

    let receita = 0;
    let despesa = 0;


    for (let i = 0; i < lista.length; i++) {

        if (lista[i].tipo === 'receita') {

            receita += lista[i].valor;
        }

        if (lista[i].tipo === 'despesa') {

            despesa += lista[i].valor;
        }
    }


    return receita - despesa;
}

function filtrarPeriodoAnterior() {

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const filtro = selectFiltro.value;

    if (filtro === 'mes') {

        let mes = mesAtual - 1;
        let ano = anoAtual;

        if (mes === 0) {

            mes = 12;
            ano--;
        }

        return transacoes.filter(transacao => {

            const [anoTransacao, mesTransacao] =
                transacao.data
                    .split('/')
                    .map(Number);

            return anoTransacao === ano &&
                mesTransacao === mes;
        });
    }

    if (filtro === 'mesAnterior') {
        let mes = mesAtual - 2;
        let ano = anoAtual;

        if (mes <= 0) {

            mes += 12;
            ano--;
        }

        return transacoes.filter(transacao => {

            const [anoTransacao, mesTransacao] =
                transacao.data
                    .split('/')
                    .map(Number);

            return anoTransacao === ano &&
                mesTransacao === mes;
        });
    }

    if (filtro === 'ano') {

        return transacoes.filter(transacao => {

            const [anoTransacao] =
                transacao.data
                    .split('/')
                    .map(Number);

            return anoTransacao === anoAtual - 1;
        });
    }

    let mes = mesAtual - 1;
    let ano = anoAtual;

    if (mes === 0) {

        mes = 12;
        ano--;
    }

    return transacoes.filter(transacao => {

        const [anoTransacao, mesTransacao] =
            transacao.data
                .split('/')
                .map(Number);

        return anoTransacao === ano &&
            mesTransacao === mes;
    });
}

function atualizarDiferenca(lista) {

    const saldoAtual = calcularSaldo(lista);
    const listaAnterior = filtrarPeriodoAnterior();
    const saldoAnterior = calcularSaldo(listaAnterior);
    const diferenca = saldoAtual - saldoAnterior;

    let porcentagem = 0;

    if (saldoAnterior !== 0) {
        porcentagem = (diferenca / Math.abs(saldoAnterior)) * 100;
    }

    if (diferenca > 0) {

        displayDiferencaMes.innerHTML =
            "+ R$ " +
            diferenca.toFixed(2).replace('.', ',') +
            " (+" +
            porcentagem.toFixed(2).replace('.', ',') +
            "%)";

        displayDiferencaMes.style.color = "#629148";

    }else if (diferenca < 0) {

        displayDiferencaMes.innerHTML =
            "- R$ " +
            Math.abs(diferenca).toFixed(2).replace('.', ',') +
            " (" +
            porcentagem.toFixed(2).replace('.', ',') +
            "%)";

        displayDiferencaMes.style.color = "#ff5040";

    } else {

        displayDiferencaMes.textContent =
            "R$ 0,00 (0,00%)";

        displayDiferencaMes.style.color = "";
    }
}

function atualizarGraficoCategorias(lista) {

    let categorias = {};
    
    for (let i = 0; i < lista.length; i++) {

        let transacao = lista[i];

        if (transacao.tipo === 'despesa') {

            let categoria = transacao.area;

            if (categorias[categoria] === undefined) {
                categorias[categoria] = 0;
            }

            categorias[categoria] += transacao.valor;
        }
    }


    if (graficoCategorias) {
        graficoCategorias.destroy();
    }


    graficoCategorias = new Chart(canvasCategorias, {

        type: 'doughnut',

        data: {

            labels: Object.keys(categorias),

            datasets: [{
                data: Object.values(categorias),
                backgroundColor: [
                    '#F4C95D',
                    '#E9A23B',
                    '#D98E04',
                    '#C97B2A',
                    '#B85C38',
                    '#A66A3F',
                    '#8C6A43',
                    '#D6B36A'
                ],

                borderColor: '#f8edd4',
                borderWidth: 0,
                hoverOffset: 15,
                hoverBorderWidth: 3,
                hoverBorderColor: '#705429',

            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,
            layout: {
                padding: 20
            },

            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },

            plugins: {

                legend: {
                    position: 'right',

                    labels: {
                        font: {
                            family: "Nunito",
                            size: 20,
                            weight: "500"
                        },

                        color: "#705429",

                        usePointStyle: true,
                        pointStyle: 'rectRounded'
                    }
                },

                tooltip: {

                    backgroundColor: '#f8edd4',

                    titleColor: '#705429',

                    bodyColor: '#705429',

                    borderColor: '#d6b878',

                    borderWidth: 1,

                    titleFont: {
                        family: 'Nunito',
                        size: 21,
                        weight: '700'
                    },

                    bodyFont: {
                        family: 'Nunito',
                        size: 18,
                        weight: '500'
                    },

                    padding: 10,

                    callbacks: {

                        label: function (context) {

                            const valor = context.raw;

                            const total = context.dataset.data.reduce(
                                (soma, valor) => soma + valor,
                                0
                            );

                            const porcentagem = (valor / total) * 100;

                            return [
                                ' R$ ' + valor.toFixed(2).replace('.', ','),
                                ' ' + porcentagem.toFixed(1).replace('.', ',') + '% das despesas'
                            ];
                        }
                    }
                }
            }
        }
    });
}

function atualizarGraficoDespesasReceitas(lista) {

    let dados = {};

    const filtro = selectFiltro.value;

    for (let i = 0; i < lista.length; i++) {

        let transacao = lista[i];
        console.log(transacao.data);
        const [ano, mes, dia] =
            transacao.data.split('/').map(Number);

        let chave;

        if (
            filtro === 'mes' ||
            filtro === 'mesAnterior'
        ) {

            chave = String(dia).padStart(2, '0');

        }

        else if (filtro === 'ano') {

            chave = String(mes).padStart(2, '0');

        }

        else {

            chave =
                ano + '-' +
                String(mes).padStart(2, '0');
        }

        if (dados[chave] === undefined) {

            dados[chave] = {
                receita: 0,
                despesa: 0
            };
        }


        if (transacao.tipo === 'receita') {

            dados[chave].receita += transacao.valor;

        }

        else if (transacao.tipo === 'despesa') {

            dados[chave].despesa += transacao.valor;
        }
    }


    const chaves = Object.keys(dados).sort();

    let labels = [];

    if (
        filtro === 'mes' ||
        filtro === 'mesAnterior'
    ) {

        labels = chaves.map(dia => {

            return dia;
        });

    }

    else if (filtro === 'ano') {

        const nomesMeses = [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez'
        ];

        labels = chaves.map(mes => {

            return nomesMeses[Number(mes) - 1];
        });

    }

    else {

        labels = chaves.map(data => {

            const [ano, mes] = data.split('-');

            return mes + '/' + ano;
        });
    }

    const receitas = chaves.map(chave => {

        return dados[chave].receita;
    });


    const despesas = chaves.map(chave => {

        return dados[chave].despesa;
    });

    if (graficoDespesasReceitas) {

        graficoDespesasReceitas.destroy();
    }

    graficoDespesasReceitas = new Chart(
        canvasDespesasReceitas,
        {

            type: 'bar',

            data: {

                labels: labels,

                datasets: [

                    {
                        label: 'Receitas',
                        data: receitas,
                        backgroundColor: '#629148',
                        borderRadius: 10,
                        maxBarThickness: 70

                    },

                    {
                        label: 'Despesas',
                        data: despesas,
                        backgroundColor: '#ff8a7d',
                        borderRadius: 10,
                        maxBarThickness: 70

                    }

                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                layout: {
                    padding: 20
                },

                interaction: {
                    mode: 'index',
                    intersect: false
                },


                scales: {

                    x: {

                        grid: {
                            display: false
                        },

                        ticks: {

                            font: {
                                family: 'Nunito',
                                size: 16,
                                weight: '500'
                            },

                            color: '#705429'
                        }
                    },


                    y: {

                        beginAtZero: true,

                        grid: {
                            color: '#e8d9b9'
                        },

                        ticks: {

                            font: {
                                family: 'Nunito',
                                size: 16
                            },

                            color: '#705429',

                            callback: function (valor) {

                                return 'R$ ' +
                                    valor.toLocaleString(
                                        'pt-BR'
                                    );
                            }
                        }
                    }
                },


                plugins: {

                    legend: {

                        position: 'top',

                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            color: '#705429',

                            font: {
                                family: 'Nunito',
                                size: 20,
                                weight: '500'
                            }
                        }
                    },


                    tooltip: {
                        backgroundColor: '#f8edd4',
                        titleColor: '#705429',
                        bodyColor: '#705429',
                        borderColor: '#d6b878',
                        borderWidth: 1,
                        padding: 10,
                        titleFont: {

                            family: 'Nunito',

                            size: 21,

                            weight: '700'
                        },

                        bodyFont: {

                            family: 'Nunito',

                            size: 18
                        },

                        callbacks: {

                            label: function (context) {

                                return ' ' +
                                    context.dataset.label +
                                    ': R$ ' +
                                    context.raw
                                        .toFixed(2)
                                        .replace('.', ',');
                            }
                        }
                    }
                }
            }
        }
    );
}

function atualizarGraficoEvolucaoSaldo(lista) {

    let dados = {};

    const filtro = selectFiltro.value;

    for (let i = 0; i < lista.length; i++) {

        const transacao = lista[i];

        const [ano, mes, dia] =
            transacao.data.split('/').map(Number);

        let chave;

        if (
            filtro === 'mes' ||
            filtro === 'mesAnterior'
        ) {

            chave =
                String(dia).padStart(2, '0');

        }

        else if (filtro === 'ano') {

            chave =
                String(mes).padStart(2, '0');

        }

        else {

            chave =
                ano + '-' +
                String(mes).padStart(2, '0');
        }


        if (dados[chave] === undefined) {

            dados[chave] = 0;
        }


        if (transacao.tipo === 'receita') {

            dados[chave] += transacao.valor;
        }

        else if (transacao.tipo === 'despesa') {

            dados[chave] -= transacao.valor;
        }
    }

    const chaves = Object.keys(dados).sort();

    let saldo = 0;

    const saldos = chaves.map(chave => {

        saldo += dados[chave];

        return saldo;
    });

    let labels = [];


    if (
        filtro === 'mes' ||
        filtro === 'mesAnterior'
    ) {

        labels = chaves.map(dia => {

            return dia;
        });

    }

    else if (filtro === 'ano') {

        const nomesMeses = [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez'
        ];

        labels = chaves.map(mes => {

            return nomesMeses[
                Number(mes) - 1
            ];
        });

    }

    else {

        labels = chaves.map(data => {

            const [ano, mes] =
                data.split('-');

            return mes + '/' + ano;
        });
    }

    if (graficoEvolucaoSaldo) {

        graficoEvolucaoSaldo.destroy();
    }

    graficoEvolucaoSaldo = new Chart(
        canvasEvolucaoSaldo,
        {

            type: 'line',

            data: {

                labels: labels,

                datasets: [{
                    label: 'Saldo',
                    data: saldos,
                    borderColor: '#D98E04',
                    backgroundColor: 'rgba(217, 142, 4, 0.15)',
                    borderWidth: 3,
                    tension: 0,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 10,
                    pointBackgroundColor: '#D98E04',
                    pointBorderColor: '#f8edd4',
                    pointBorderWidth: 0
                }]
            },


            options: {

                responsive: true,
                maintainAspectRatio: false,

                layout: {
                    padding: 20
                },


                interaction: {

                    mode: 'index',
                    intersect: false
                },


                scales: {

                    x: {

                        grid: {

                            display: false
                        },

                        ticks: {

                            font: {
                                family: 'Nunito',
                                size: 16,
                                weight: '500'
                            },

                            color: '#705429'
                        }
                    },


                    y: {

                        beginAtZero: false,

                        grid: {

                            color: '#e8d9b9'
                        },

                        ticks: {

                            font: {
                                family: 'Nunito',
                                size: 16
                            },

                            color: '#705429',

                            callback: function (valor) {

                                return 'R$ ' +
                                    valor.toLocaleString(
                                        'pt-BR'
                                    );
                            }
                        }
                    }
                },


                plugins: {

                    legend: {

                        position: 'top',

                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line',
                            color: '#705429',

                            font: {
                                family: 'Nunito',
                                size: 20,
                                weight: '500'
                            }
                        }
                    },


                    tooltip: {
                        backgroundColor: '#f8edd4',
                        titleColor: '#705429',
                        bodyColor: '#705429',
                        borderColor: '#d6b878',
                        borderWidth: 1,
                        padding: 10,

                        titleFont: {
                            family: 'Nunito',
                            size: 21,
                            weight: '700'
                        },

                        bodyFont: {
                            family: 'Nunito',
                            size: 18
                        },

                        callbacks: {

                            label: function (context) {

                                return ' Saldo: R$ ' +

                                    context.raw
                                        .toFixed(2)
                                        .replace('.', ',');
                            }
                        }
                    }
                }
            }
        }
    );
}


function atualizarDashboard() {

    const transacoesFiltradas =
        filtrarPeriodo();


    atualizarResumo(transacoesFiltradas);
    atualizarMaiorReceita(transacoesFiltradas);
    atualizarMaiorDespesa(transacoesFiltradas);
    atualizarMaiorCategoria(transacoesFiltradas);
    atualizarMediaGastos(transacoesFiltradas);
    atualizarDiferenca(transacoesFiltradas);
    atualizarGraficoCategorias(transacoesFiltradas);
    atualizarGraficoDespesasReceitas(transacoesFiltradas);
    atualizarGraficoEvolucaoSaldo(transacoesFiltradas);
}

selectFiltro.addEventListener(
    'change',
    function () {

        atualizarDashboard();
    }
);

window.addEventListener(
    'storage',
    function (evento) {

        if (evento.key === 'transacoes') {

            transacoes =
                JSON.parse(evento.newValue) || [];

            atualizarDashboard();
        }
    }
);

btnVoltar.addEventListener(
    'click',
    function () {

        window.location.href =
            'index.html';
    }
);
atualizarDashboard();
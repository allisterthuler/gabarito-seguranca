const SUPABASE_URL = "https://ibhicdhnhpgoejrdctnp.supabase.co";
const SUPABASE_KEY = "sb_publishable_J1UhgQqfBIP-MQ2OiwFaNg_J7aLGPtC";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const perguntas = {
    GSL: [
        "Manuseia os produtos corretamente?",
        "Mantém a postura correta durante as atividades?",
        "Se necessário realiza trabalho em locais altos de maneira segura?",
        "Utiliza as ferramentas adequadas para realizar seu trabalho?",
        "Utiliza todos os EPIs (Luvas, cinta, óculos e bota)?",
        "Manuseia a paleteira e o carrinho corretamente?",
        "Mantém a distância de segurança da empilhadeira?",
        "Acessa de forma segura o estoque da loja?"
    ],

    GSR_CARRO: [
        "Respeitou a preferência no cruzamento e reduziu a velocidade?",
        "Manteve a distância de segurança do veículo da frente?",
        "Sinalizou e fez todas as conversões corretamente?",
        "Realizou as ultrapassagens corretamente?",
        "Transportou todo material dentro do porta malas?",
        "Todos os passageiros utilizavam cinto de segurança?",
        "Respeitou a sinalização de trânsito?",
        "Manteve a concentração na direção sem uso de celular enquanto dirigia?",
        "Estacionou de maneira adequada?"
    ],

    GSR_MOTO: [
        "Manteve o correto posicionamento na via?",
        "Respeitou a preferência e reduziu a velocidade nos cruzamentos?",
        "Manteve a distância de segurança dos veículos?",
        "Sinalizou e fez todas as conversões corretamente?",
        "Saiu com velocidade adequada e cruzamento e semáforos?",
        "Utilizou todos os EPIs durante a execução das atividades?",
        "Transportou material de maneira segura?",
        "Mantém a postura correta na moto?",
        "Estacionou de maneira adequada?",
        "Caminhou sem falar ou digitar no celular?",
        "Respeitou a preferência no cruzamento e reduziu a velocidade?"
    ],

    GSR_PE: [
        "Caminhou sem falar ou digitar no celular?",
        "Utilizou todos os EPIs?",
        "Utilizou a faixa de pedestres para atravessar a rua?",
        "Evitou carregar peso em excesso?",
        "O trecho percorrido era sem buracos nas calçadas?",
        "Durante o percurso havia faixas de pedestres?"
    ]
};

const tipoSelect = document.getElementById("tipoAvaliacao");
const perguntasContainer = document.getElementById("perguntasContainer");
const placaContainer = document.getElementById("placaContainer");
const placaLabel = document.getElementById("placaLabel");
const mensagem = document.getElementById("mensagem");

tipoSelect.addEventListener("change", carregarPerguntas);

function carregarPerguntas() {

    perguntasContainer.innerHTML = "";

    const tipo = tipoSelect.value;

    placaContainer.classList.add("oculto");

    if (tipo === "GSR_CARRO") {
        placaContainer.classList.remove("oculto");
        placaLabel.textContent = "Placa do Veículo *";
    }

    if (tipo === "GSR_MOTO") {
        placaContainer.classList.remove("oculto");
        placaLabel.textContent = "Placa da Moto *";
    }

    if (!tipo) return;

    perguntas[tipo].forEach((texto, index) => {

        const numero = index + 1;

        perguntasContainer.innerHTML += `
            <div class="pergunta">

                <div class="pergunta-titulo">
                    ${numero}. ${texto}
                </div>

                <div class="opcoes">

                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_sim"
                            name="${tipo}_${numero}"
                            value="true"
                        >
                        <label for="${tipo}_${numero}_sim">
                            Sim
                        </label>
                    </div>

                    <div class="opcao">
                        <input
                            type="radio"
                            id="${tipo}_${numero}_nao"
                            name="${tipo}_${numero}"
                            value="false"
                        >
                        <label for="${tipo}_${numero}_nao">
                            Não
                        </label>
                    </div>

                </div>

            </div>
        `;
    });
}

document
.getElementById("avaliacaoForm")
.addEventListener("submit", salvarAvaliacao);

async function salvarAvaliacao(e) {

    e.preventDefault();

    mensagem.innerHTML = "";
    mensagem.className = "";

    const idAvaliador =
        document.getElementById("idAvaliador").value.trim();

    const idAvaliado =
        document.getElementById("idAvaliado").value.trim();

    const tipo =
        document.getElementById("tipoAvaliacao").value;

    const placa =
        document.getElementById("placaVeiculo").value.trim();

    const comentario =
        document.getElementById("comentario").value.trim();

    if (!idAvaliador || !idAvaliado || !tipo) {
        mostrarErro("Preencha todos os campos obrigatórios.");
        return;
    }

    if (
        (tipo === "GSR_CARRO" || tipo === "GSR_MOTO")
        && !placa
    ) {
        mostrarErro("Informe a placa.");
        return;
    }

    const respostas = {};

    for (let i = 1; i <= perguntas[tipo].length; i++) {

        const resposta = document.querySelector(
            `input[name="${tipo}_${i}"]:checked`
        );

        if (!resposta) {
            mostrarErro(
                "Responda todas as perguntas."
            );
            return;
        }

        respostas[i] = resposta.value === "true";
    }

    const registro = {
        id_avaliador: idAvaliador,
        id_avaliado: idAvaliado,
        tipo_avaliacao: tipo,
        placa_veiculo: placa || null,
        comentario: comentario || null
    };

    for(let i=1;i<=8;i++){
        registro[`gsl_q${i}`] = null;
    }

    for(let i=1;i<=9;i++){
        registro[`carro_q${i}`] = null;
    }

    for(let i=1;i<=11;i++){
        registro[`moto_q${i}`] = null;
    }

    for(let i=1;i<=6;i++){
        registro[`pe_q${i}`] = null;
    }

    if(tipo === "GSL"){
        for(let i=1;i<=8;i++){
            registro[`gsl_q${i}`] = respostas[i];
        }
    }

    if(tipo === "GSR_CARRO"){
        for(let i=1;i<=9;i++){
            registro[`carro_q${i}`] = respostas[i];
        }
    }

    if(tipo === "GSR_MOTO"){
        for(let i=1;i<=11;i++){
            registro[`moto_q${i}`] = respostas[i];
        }
    }

    if(tipo === "GSR_PE"){
        for(let i=1;i<=6;i++){
            registro[`pe_q${i}`] = respostas[i];
        }
    }

    const { error } = await supabaseClient
        .from("avaliacoes")
        .insert([registro]);

    if(error){

        console.error(error);

        mostrarErro(
            "Erro ao salvar avaliação."
        );

        return;
    }

    mostrarSucesso(
        "Avaliação enviada com sucesso!"
    );

    document
        .getElementById("avaliacaoForm")
        .reset();

    perguntasContainer.innerHTML = "";

    placaContainer.classList.add("oculto");
}

function mostrarErro(texto){
    mensagem.className = "erro";
    mensagem.innerHTML = texto;
}

function mostrarSucesso(texto){
    mensagem.className = "sucesso";
    mensagem.innerHTML = texto;
}
document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 🔌 SUPABASE
    // =========================
    const SUPABASE_URL = "https://ibhicdhnhpgoejrdctnp.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_J1UhgQqfBIP-MQ2OiwFaNg_J7aLGPtC";

    const supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

    // =========================
    // 📦 QUESTIONÁRIOS (JSON)
    // =========================
    const QUESTIONARIOS = {
        GSL: [
            "Manuseia produtos corretamente?",
            "Mantém a postura correta durante as atividades?",
	    "Se necessário realiza trabalho em locais altos de maneira segura?",
	    "O funcionário utiliza as ferramentas adequadas para realizar seu trabalho?",
            "Usa todos os EPIs corretamente?",
	    "Manuseia a paleteira e o carrinho corretamente?",
	    "Mantém a distância de segurança da empilhadeira?",
            "Acessa de forma segura o estoque da loja?"
        ],

        CARRO: [
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

        MOTO: [
            "Manteve o correto posicionamento na via?",
            "Respeitou a preferência e reduziu a velocidade nos cruzamentos?",
            "Manteve a distância de segurança dos veículos?",
            "Sinalizou e fez todas a conversões corretamente?",
            "Saiu com velocidade adequada e cruzamento e semáforos?",
            "Utilizou todos os EPIs durante a execução das atividades?",
            "Transportou material de maneira segura?",
            "Mantém a postura correta na moto?",
            "Estacionou de maneira adequada?",
            "Caminhou sem falar ou digitar no celular?",
            "Respeitou a preferência no cruzamento e reduziu a velocidade?"
        ],

        APE: [
            "Caminhou sem falar ou digitar no celular?",
            "Utilizou todos os EPIs?",
            "Utilizou a faixa de pedestres para atravessar a rua?",
            "Evitou carregar peso em excesso?",
            "O trecho percorrido era sem buracos nas calçadas?",
            "Durante o percurso havia faixas de pedestres?"
        ]
    };

    // =========================
    // 🎯 ELEMENTOS DO DOM
    // =========================
    const form = document.getElementById("form");
    const select = document.getElementById("questionario");
    const perguntasDiv = document.getElementById("perguntas");
    const placaInput = document.getElementById("placa");

    // =========================
    // 📌 EVENTO: TROCAR QUESTIONÁRIO
    // =========================
    select.addEventListener("change", () => {

        const tipo = select.value;

        perguntasDiv.innerHTML = "";

        if (!tipo) return;

        const perguntas = QUESTIONARIOS[tipo];

        if (!perguntas) return;

        // mostrar/ocultar placa
        if (tipo === "CARRO" || tipo === "MOTO") {
            placaInput.style.display = "block";
        } else {
            placaInput.style.display = "none";
        }

        // gerar perguntas
        perguntas.forEach((texto, index) => {

            const div = document.createElement("div");
            div.className = "pergunta";

            div.innerHTML = `
                <p>${index + 1}. ${texto}</p>

                <label>
                    <input type="radio" name="q${index}" value="Sim" required>
                    Sim
                </label>

                <label>
                    <input type="radio" name="q${index}" value="Não" required>
                    Não
                </label>
            `;

            perguntasDiv.appendChild(div);
        });
    });

    // =========================
    // 📌 EVENTO: SUBMIT
    // =========================
    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const tipo = select.value;

        if (!tipo) {
            alert("Selecione um questionário.");
            return;
        }

        const perguntas = QUESTIONARIOS[tipo];

        // valida respostas
        const respostas = perguntas.map((p, i) => {
            const r = document.querySelector(`input[name="q${i}"]:checked`);

            if (!r) {
                alert(`Responda a pergunta ${i + 1}`);
                throw new Error("Pergunta não respondida");
            }

            return {
                pergunta: p,
                resposta: r.value
            };
        });

        // salvar avaliação
        const { data: avaliacao, error: insertError } = await supabase
            .from("avaliacoes")
            .insert([{
                id_avaliador: document.getElementById("idAvaliador").value,
                id_funcionario: document.getElementById("idFuncionario").value,
                questionario: tipo,
                placa: placaInput.value,
                comentarios: document.getElementById("comentarios").value,
            }])
            .select()
            .single();

        if (insertError) {
            console.error(insertError);
            alert("Erro ao salvar avaliação.");
            return;
        }

        // salvar respostas
        const respostasInsert = respostas.map(r => ({
            avaliacao_id: avaliacao.id,
            pergunta: r.pergunta,
            resposta: r.resposta
        }));

        const { error: errResp } = await supabase
            .from("avaliacao_respostas")
            .insert(respostasInsert);

        if (errResp) {
            console.error(errResp);
            alert("Erro ao salvar respostas.");
            return;
        }

        alert("Avaliação enviada com sucesso!");

        form.reset();
        perguntasDiv.innerHTML = "";
        placaInput.style.display = "none";
    });

});
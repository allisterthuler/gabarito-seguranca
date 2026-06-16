const QUESTIONARIOS = {
    GSL: [
        "O funcionário manuseia os produtos corretamente?",
        "O funcionário mantém a postura correta durante as atividades?",
        "Se necessário realiza trabalho em locais altos de maneira segura?",
        "O funcionário utiliza as ferramentas adequadas para realizar seu trabalho?",
        "Utiliza todos os EPIs (Luvas, cinta, óculos e bota)?",
        "Manuseia a paleteira e o carrinho corretamente?",
        "O funcionário mantém a distância de segurança da empilhadeira?",
        "O funcionário acessa de forma segura o estoque da loja?"
    ],

    GSR_CARRO: [
        "Respeitou a preferência no cruzamento e reduziu a velocidade?",
        "Manteve a distância de segurança do veículo da frente?",
        "Sinalizou e fez todas as conversões corretamente?",
        "Realizou ultrapassagens corretamente?",
        "Transportou todo material no porta-malas?",
        "Todos os passageiros usavam cinto de segurança?",
        "Respeitou a sinalização de trânsito?",
        "Não usou celular enquanto dirigia?",
        "Estacionou de maneira adequada?",
        "Condições do veículo com problemas?"
    ],

    GSR_MOTO: [
        "Manteve correto posicionamento na via?",
        "Respeitou preferência nos cruzamentos?",
        "Manteve distância de segurança?",
        "Sinalizou corretamente?",
        "Velocidade adequada em cruzamentos?",
        "Usou todos os EPIs?",
        "Transportou material com segurança?",
        "Postura correta na moto?",
        "Estacionou corretamente?",
        "Não usou celular ao caminhar/dirigir?",
        "Respeitou sinalização?",
        "Condições do veículo com problemas?"
    ],

    GSR_APE: [
        "Caminhou sem usar celular?",
        "Usou EPIs corretamente?",
        "Usou faixa de pedestres?",
        "Evitou carregar peso excessivo?",
        "Calçadas estavam em boas condições?",
        "Havia faixa de pedestres no trajeto?"
    ]
};
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const questionario = questionarioSelect.value;

    if (!questionario) {
        alert("Selecione um questionário.");
        return;
    }

    const perguntas = QUESTIONARIOS[questionario];

    // valida perguntas
    for (let i = 0; i < perguntas.length; i++) {
        const resposta = document.querySelector(
            `input[name="pergunta_${i}"]:checked`
        );

        if (!resposta) {
            alert(`Responda a pergunta ${i + 1}.`);
            return;
        }
    }

    const fotoInput = document.getElementById("foto");

    if (fotoInput.files.length === 0) {
        alert("Anexe uma foto.");
        return;
    }

    try {

        // 📸 UPLOAD FOTO
        const foto = fotoInput.files[0];
        const nomeArquivo = `${Date.now()}_${foto.name}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from("evidencias")
            .upload(nomeArquivo, foto);

        if (uploadError) throw uploadError;

        const { data: fotoPublica } = supabaseClient
            .storage
            .from("evidencias")
            .getPublicUrl(nomeArquivo);

        // 📋 1. CRIA AVALIAÇÃO (CABEÇALHO)
        const { data: avaliacao, error: erroAvaliacao } = await supabaseClient
            .from("avaliacoes")
            .insert([{
                id_avaliador: document.getElementById("idAvaliador").value,
                id_funcionario: document.getElementById("idFuncionario").value,
                questionario: questionario,
                placa: document.getElementById("placa").value,
                comentarios: document.getElementById("comentarios").value,
                foto_url: fotoPublica.publicUrl
            }])
            .select()
            .single();

        if (erroAvaliacao) throw erroAvaliacao;

        // 📊 2. SALVA RESPOSTAS (NOVO MODELO)
        const respostasInsert = perguntas.map((pergunta, index) => {
            return {
                avaliacao_id: avaliacao.id,
                pergunta: pergunta,
                resposta: document.querySelector(
                    `input[name="pergunta_${index}"]:checked`
                ).value
            };
        });

        const { error: erroRespostas } = await supabaseClient
            .from("avaliacao_respostas")
            .insert(respostasInsert);

        if (erroRespostas) throw erroRespostas;

        // 🎉 SUCESSO
        alert("Avaliação enviada com sucesso!");

        form.reset();
        perguntasContainer.innerHTML = "";
        placaContainer.classList.add("oculto");

    } catch (erro) {
        console.error("ERRO:", erro);
        alert("Erro ao enviar. Veja o console.");
    }
});
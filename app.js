const SUPABASE_URL = "https://ibhicdhnhpgoejrdctnp.supabase.co";
const SUPABASE_ANON_KEY = "SUA_CHAVE_AQUI";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// 📦 BANCO DE PERGUNTAS (JSON LIMPO)
const QUESTIONARIOS = {
    GSL: [
        "Manuseia produtos corretamente?",
        "Mantém postura correta?",
        "Trabalha em altura com segurança?",
        "Usa ferramentas adequadas?",
        "Usa EPIs corretamente?"
    ],

    CARRO: [
        "Respeita sinalização?",
        "Mantém distância segura?",
        "Usa cinto?",
        "Usa celular ao dirigir?",
        "Estaciona corretamente?"
    ],

    MOTO: [
        "Posicionamento correto?",
        "Usa EPIs?",
        "Sinaliza corretamente?",
        "Respeita velocidade?",
        "Mantém distância segura?"
    ],

    APE: [
        "Usa faixa de pedestre?",
        "Evita celular ao caminhar?",
        "Usa EPIs?",
        "Ambiente seguro?"
    ]
};

// 📌 ELEMENTOS
const form = document.getElementById("form");
const select = document.getElementById("questionario");
const perguntasDiv = document.getElementById("perguntas");
const placa = document.getElementById("placa");

// 📌 MOSTRAR PERGUNTAS
select.addEventListener("change", () => {

    const tipo = select.value;
    perguntasDiv.innerHTML = "";

    if (!tipo) return;

    const perguntas = QUESTIONARIOS[tipo];

    if (tipo === "CARRO" || tipo === "MOTO") {
        placa.style.display = "block";
    } else {
        placa.style.display = "none";
    }

    perguntas.forEach((p, i) => {

        const div = document.createElement("div");
        div.className = "pergunta";

        div.innerHTML = `
            <p>${p}</p>

            <label><input type="radio" name="q${i}" value="Sim" required> Sim</label>
            <label><input type="radio" name="q${i}" value="Não" required> Não</label>
        `;

        perguntasDiv.appendChild(div);
    });
});

// 📌 SUBMIT
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = select.value;
    const perguntas = QUESTIONARIOS[tipo];

    if (!tipo) return;

    // valida respostas
    const respostas = perguntas.map((p, i) => {
        return {
            pergunta: p,
            resposta: document.querySelector(`input[name="q${i}"]:checked`).value
        };
    });

    // upload foto
    const foto = document.getElementById("foto").files[0];
    const nome = Date.now() + "_" + foto.name;

    await supabase.storage
        .from("evidencias")
        .upload(nome, foto);

    const { data } = supabase.storage
        .from("evidencias")
        .getPublicUrl(nome);

    // salvar avaliação
    const { data: av } = await supabase
        .from("avaliacoes")
        .insert([{
            id_avaliador: document.getElementById("idAvaliador").value,
            id_funcionario: document.getElementById("idFuncionario").value,
            questionario: tipo,
            placa: document.getElementById("placa").value,
            comentarios: document.getElementById("comentarios").value,
            foto_url: data.publicUrl
        }])
        .select()
        .single();

    // salvar respostas
    await supabase.from("avaliacao_respostas").insert(
        respostas.map(r => ({
            avaliacao_id: av.id,
            pergunta: r.pergunta,
            resposta: r.resposta
        }))
    );

    alert("Enviado com sucesso!");

    form.reset();
    perguntasDiv.innerHTML = "";
});
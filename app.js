const SUPABASE_URL = "https://ibhicdhnhpgoejrdctnp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaGljZGhuaHBnb2VqcmRjdG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzgxMzcsImV4cCI6MjA5NzExNDEzN30.lMCFSlPv3xEeRFOdeuJiYE1WfAj2LEC_CX68MzXabrs";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
const questionarioSelect = document.getElementById("questionario");
const perguntasContainer = document.getElementById("perguntasContainer");
const placaContainer = document.getElementById("placaContainer");
const form = document.getElementById("avaliacaoForm");

questionarioSelect.addEventListener("change", () => {

    const questionario = questionarioSelect.value;

    perguntasContainer.innerHTML = "";

    if (
        questionario === "GSR_CARRO" ||
        questionario === "GSR_MOTO"
    ) {
        placaContainer.classList.remove("oculto");
    } else {
        placaContainer.classList.add("oculto");
    }

    if (!questionario) return;

    const perguntas = QUESTIONARIOS[questionario];

    perguntas.forEach((textoPergunta, index) => {

        const perguntaDiv = document.createElement("div");
        perguntaDiv.className = "pergunta";

        perguntaDiv.innerHTML = `
            <p>${index + 1}. ${textoPergunta}</p>

            <div class="opcoes">

                <label>
                    <input
                        type="radio"
                        name="pergunta_${index}"
                        value="Sim"
                        required
                    >
                    Sim
                </label>

                <label>
                    <input
                        type="radio"
                        name="pergunta_${index}"
                        value="Não"
                        required
                    >
                    Não
                </label>

            </div>
        `;

        perguntasContainer.appendChild(perguntaDiv);

    });

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const questionario = questionarioSelect.value;

    if (!questionario) {
        alert("Selecione um questionário.");
        return;
    }

    const perguntas = QUESTIONARIOS[questionario];

    for (let i = 0; i < perguntas.length; i++) {

        const resposta = document.querySelector(
            `input[name="pergunta_${i}"]:checked`
        );

        if (!resposta) {
            alert(`Responda a pergunta ${i + 1}.`);
            return;
        }
    }

    if (
        (questionario === "GSR_CARRO" ||
        questionario === "GSR_MOTO") &&
        document.getElementById("placa").value.trim() === ""
    ) {
        alert("Informe a placa.");
        return;
    }

    const fotoInput = document.getElementById("foto");

    if (fotoInput.files.length === 0) {
        alert("Anexe uma foto.");
        return;
    }

    try {

        const respostas = {};

        for (let i = 0; i < perguntas.length; i++) {

            respostas[`q${i + 1}`] =
                document.querySelector(
                    `input[name="pergunta_${i}"]:checked`
                ).value;
        }

        const foto = fotoInput.files[0];

        const nomeArquivo =
            `${Date.now()}_${foto.name}`;

        const { error: uploadError } =
            await supabaseClient.storage
                .from("evidencias")
                .upload(nomeArquivo, foto);

        if (uploadError) {
            throw uploadError;
        }

        const { data: fotoPublica } =
            supabaseClient.storage
                .from("evidencias")
                .getPublicUrl(nomeArquivo);

        const { error: insertError } =
            await supabaseClient
                .from("avaliacoes")
                .insert([
                    {
                        id_avaliador:
                            document.getElementById("idAvaliador").value,

                        id_funcionario:
                            document.getElementById("idFuncionario").value,

                        questionario:
                            questionario,

                        placa:
                            document.getElementById("placa").value,

                        comentarios:
                            document.getElementById("comentarios").value,

                        foto_url:
                            fotoPublica.publicUrl,

                        respostas:
                            respostas,

                        dispositivo:
                            navigator.userAgent,

                        versao_app:
                            "1.0"
                    }
                ]);

        if (insertError) {
            throw insertError;
        }

        alert("Avaliação enviada com sucesso!");

        form.reset();

        perguntasContainer.innerHTML = "";

        placaContainer.classList.add("oculto");

    }
    catch (erro) {

        console.error("ERRO COMPLETO:", erro);
	console.error("MENSAGEM:", erro.message);
	console.error("DETALHES:", erro);;

        alert(
            "Erro ao enviar. Abra o Console (F12) e me envie a mensagem em vermelho."
        );
    }

});
/* =========================================================
   COLEGIO NOCTURNO DE CARIARI - LISTENING EXAM
   QUIZ LOGIC + GOOGLE SHEETS
   ========================================================= */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2qTBUwWN5_zsBrGhslaw4asYc0EiY-TohO-DfRrU7aBFg42Zu0xmOkpT0yfmV5O6l/exec";


/* ---------------------------------------------------------
   1. AUDIO CONTROLLER (reusable class)
--------------------------------------------------------- */
class AudioController {
    constructor(audioId, buttonId, counterId, maxPlays = 4){
        this.audio = document.getElementById(audioId);
        this.button = document.getElementById(buttonId);
        this.counter = document.getElementById(counterId);
        this.maxPlays = maxPlays;
        this.plays = 0;
        this.button.addEventListener("click", () => this.play());
    }
    play(){
        if(this.plays >= this.maxPlays) return;
        this.audio.currentTime = 0;
        this.audio.play();
        this.plays++;
        this.updateUI();
    }
    updateUI(){
        const remaining = this.maxPlays - this.plays;
        this.counter.textContent = "Remaining plays: " + remaining;
        if(this.plays >= this.maxPlays){
            this.button.disabled = true;
            this.button.textContent = "No More Plays";
        }
    }
}

// Crear los 9 controladores de audio
new AudioController("audio1", "playBtn1", "counter1");
new AudioController("audio2", "playBtn2", "counter2");
new AudioController("audio3", "playBtn3", "counter3");
new AudioController("audio4", "playBtn4", "counter4");
new AudioController("audio5", "playBtn5", "counter5");
new AudioController("audio6", "playBtn6", "counter6");
new AudioController("audio7", "playBtn7", "counter7");
new AudioController("audio8", "playBtn8", "counter8");
new AudioController("audio9", "playBtn9", "counter9");


/* ---------------------------------------------------------
   2. ANSWER KEY & EXPLANATIONS
--------------------------------------------------------- */
const answers = {
    // ---- Audio 1: A Healthy Lifestyle ----
    q1: { correct: "b", explanation: "The man chose healthy food because he is trying to take care of his diet — he wants to eat healthy food, not because he dislikes burgers." },
    q2: { correct: "b", explanation: "The doctor's main advice was to lead a healthy life, which is why the man is changing his eating habits." },
    q3: { correct: "a", explanation: "The man tries to limit bread and rice. Fruits and vegetables are encouraged, not avoided." },

    // ---- Audio 2: Staying Healthy ----
    q4: { correct: "a", explanation: "The doctor recommends fresh fruits, vegetables, and whole grains as the best choices for a healthy diet." },
    q5: { correct: "b", explanation: "Caffeine, sugar, and fatty foods are the things to avoid. Fruits, exercise, and water are all healthy." },
    q6: { correct: "c", explanation: "The doctor explains that drinking less than one serving of alcohol per day can actually have some benefits." },

    // ---- Audio 3: Stress ----
    q7: { correct: "b", explanation: "Students are feeling stressed because they have exams coming up soon, not because of travel, teachers, or vacation." },
    q8: { correct: "c", explanation: "The recommended amount of sleep for students is eight to nine hours per day." },
    q9: { correct: "c", explanation: "Students should eat nutritious food to manage stress and stay healthy — not sugar, fast food, or only fruits." },
    q10: { correct: "b", explanation: "The two good types of exercise mentioned are running and walking fast." },

    // ---- Audio 4: AI ----
    q11: { correct: "c", explanation: "People use AI in daily activities like phones and videos — not only in schools, computers, or jobs." },
    q12: { correct: "a", explanation: "AI helps students by giving quick information and explanations, not by replacing teachers." },
    q13: { correct: "c", explanation: "A negative effect is that students may stop thinking for themselves when they rely too much on AI." },
    q14: { correct: "c", explanation: "Some people worry that AI could replace some jobs in the future." },
    q15: { correct: "b", explanation: "The main idea of the talk is that AI is useful but must be used carefully." },

    // ---- Matching: Audios 5-9 ----
    q16: { correct: "d", explanation: "Elizabeth → D. She talks about how social media has both positive and negative effects on social interaction." },
    q17: { correct: "c", explanation: "Ruth → C. She mentions that social media lets young people express themselves and connect, but can create unrealistic perceptions of others' lives." },
    q18: { correct: "a", explanation: "Brian → A. He discusses how social media helps teenagers communicate and share ideas, but anonymity and online content can negatively influence them." },
    q19: { correct: "e", explanation: "Daniel → E. He focuses on how social media helps learning but can distract students from studying." },
    q20: { correct: "b", explanation: "Sofia → B. She says social media is entertaining but can affect health and habits." }
};


/* ---------------------------------------------------------
   3. QUIZ SUBMISSION HANDLER
--------------------------------------------------------- */
function checkAnswers(event){
    event.preventDefault();

    const nombre = document.getElementById("studentName").value.trim();
    if(!nombre){
        alert("Por favor escribe tu nombre antes de enviar las respuestas.");
        document.getElementById("studentName").focus();
        return;
    }

    let score = 0;
    const total = Object.keys(answers).length;  // 20 preguntas

    for(const key in answers){
        const radio = document.querySelector('input[name="' + key + '"]:checked');
        const select = document.querySelector('select[name="' + key + '"]');
        const selectedValue = radio ? radio.value : (select ? select.value : "");

        const fb = document.getElementById("fb" + key.substring(1));
        const correctAnswer = answers[key].correct;
        const correctDisplay = correctAnswer.toUpperCase();
        const explanation = answers[key].explanation;
        fb.style.display = "block";

        if(!selectedValue){
            fb.className = "feedback incorrect";
            fb.innerHTML = "<strong>No answer selected</strong>Correct answer: <b>" + correctDisplay + "</b>. " + explanation;
        } else if(selectedValue === correctAnswer){
            score++;
            fb.className = "feedback correct";
            fb.innerHTML = "<strong>✓ Correct!</strong>" + explanation;
        } else {
            fb.className = "feedback incorrect";
            fb.innerHTML = "<strong>✗ Incorrect.</strong>The correct answer is <b>" + correctDisplay + "</b>. " + explanation;
        }
    }

    // ============================================================
    // SISTEMA DE NOTAS:
    // - El examen tiene 20 puntos posibles
    // - La nota va de 0 a 100 (20 puntos × 5 = 100)
    // - El examen vale 10% del semestre
    // - Por eso: el porcentaje = nota × 10 / 100
    // ============================================================
    const nota = score * 5;                              // Nota sobre 100
    const porcentaje = (nota * 10 / 100).toFixed(1);  // % que vale del 10%

    displayResult(score, total, nota, porcentaje);

    // Guardar en Google Sheets
    guardarEnGoogleSheets({
        nombre: nombre,
        puntaje: score + "/" + total + " — Nota: " + nota + "/100 (" + porcentaje + "% )"
    });

    document.getElementById("fb1").scrollIntoView({ behavior: "smooth", block: "center" });
}

function displayResult(score, total, nota, porcentajeSemestre){
    const resultEl = document.getElementById("result");
    // Aprobado con 70 o más (criterio típico en CR; cambia el número si tu colegio usa otro)
    const passed = nota >= 70;

    resultEl.innerHTML =
        "Puntos: " + score + " / " + total + "<br>" +
        "Nota: <strong>" + nota + " / 100</strong><br>" +
        "Vale: " + porcentajeSemestre + "% ";

    resultEl.style.background = passed ? "var(--success-bg)" : "var(--error-bg)";
    resultEl.style.color = passed ? "var(--success-dark)" : "var(--error)";
}


/* ---------------------------------------------------------
   4. ENVIAR DATOS A GOOGLE SHEETS
--------------------------------------------------------- */
function guardarEnGoogleSheets(datos){
    const statusEl = document.getElementById("saveStatus");

    if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PEGA_AQUI")){
        statusEl.className = "save-status error";
        statusEl.textContent = "⚠ La URL de Google Sheets no está configurada en script.js";
        return;
    }

    statusEl.className = "save-status saving";
    statusEl.textContent = "💾 Guardando resultados...";

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(result => {
        if(result.success){
            statusEl.className = "save-status saved";
            statusEl.textContent = "✓ Resultados guardados correctamente. ¡Buen trabajo, " + datos.nombre + "!";
        } else {
            throw new Error(result.error || "Error desconocido");
        }
    })
    .catch(err => {
        console.error("Error guardando:", err);
        statusEl.className = "save-status error";
        statusEl.textContent = "⚠ No se pudieron guardar los resultados. Revisa tu conexión.";
    });
}


/* ---------------------------------------------------------
   5. EVENT LISTENER
--------------------------------------------------------- */
document.getElementById("quizForm").addEventListener("submit", checkAnswers);

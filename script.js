/* =========================================================
   COLEGIO NOCTURNO DE CARIARI - LISTENING EXAM
   QUIZ LOGIC + GOOGLE SHEETS
   (Sin feedback visible para el estudiante)
   ========================================================= */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2qTBUwWN5_zsBrGhslaw4asYc0EiY-TohO-DfRrU7aBFg42Zu0xmOkpT0yfmV5O6l/exec";


/* ---------------------------------------------------------
   1. AUDIO CONTROLLER
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
   2. ANSWER KEY (solo para calificar internamente)
--------------------------------------------------------- */
const answers = {
    q1: "b",
    q2: "b",
    q3: "a",
    q4: "a",
    q5: "b",
    q6: "c",
    q7: "b",
    q8: "c",
    q9: "c",
    q10: "b",
    q11: "c",
    q12: "a",
    q13: "c",
    q14: "c",
    q15: "b",
    q16: "d",
    q17: "c",
    q18: "a",
    q19: "e",
    q20: "b"
};


/* ---------------------------------------------------------
   3. QUIZ SUBMISSION HANDLER
   - Calificación interna (silenciosa)
   - No muestra feedback ni puntaje al estudiante
   - Solo guarda en Google Sheets para el profesor
--------------------------------------------------------- */
function checkAnswers(event){
    event.preventDefault();

    const nombre = document.getElementById("studentName").value.trim();
    if(!nombre){
        alert("Por favor escribe tu nombre antes de enviar las respuestas.");
        document.getElementById("studentName").focus();
        return;
    }

    // Calificar internamente (el estudiante NO ve el puntaje)
    let score = 0;
    const total = Object.keys(answers).length;

    for(const key in answers){
        const radio = document.querySelector('input[name="' + key + '"]:checked');
        const select = document.querySelector('select[name="' + key + '"]');
        const selectedValue = radio ? radio.value : (select ? select.value : "");

        if(selectedValue === answers[key]){
            score++;
        }
    }

    // Calcular nota (0-100) y porcentaje (0-10%)
    const nota = score * 5;
    const porcentaje = (nota * 10 / 100).toFixed(1);

    // Enviar al profesor por Google Sheets
    guardarEnGoogleSheets({
        nombre: nombre,
        puntaje: score + "/" + total + " — Nota: " + nota + "/100 (" + porcentaje + "% )"
    });

    // Bloquear el formulario para que no envíen dos veces
    bloquearExamen();
}


/* ---------------------------------------------------------
   4. BLOQUEAR EL EXAMEN DESPUÉS DE ENVIAR
--------------------------------------------------------- */
function bloquearExamen(){
    // Deshabilitar todas las preguntas y selects
    document.querySelectorAll('input[type="radio"], select.match-select').forEach(el => {
        el.disabled = true;
    });

    // Deshabilitar todos los botones de play
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.disabled = true;
    });

    // Cambiar el botón Check Answers
    const submitBtn = document.querySelector(".submit-btn");
    if(submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = "Exam Submitted";
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
    }

    // Deshabilitar el campo de nombre
    const nameInput = document.getElementById("studentName");
    if(nameInput) nameInput.disabled = true;
}


/* ---------------------------------------------------------
   5. ENVIAR DATOS A GOOGLE SHEETS
--------------------------------------------------------- */
function guardarEnGoogleSheets(datos){
    const statusEl = document.getElementById("saveStatus");

    if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PEGA_AQUI")){
        statusEl.className = "save-status error";
        statusEl.textContent = "⚠ Error de configuración. Avisa al profesor.";
        return;
    }

    statusEl.className = "save-status saving";
    statusEl.textContent = "💾 Submitting your exam...";

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(result => {
        if(result.success){
            statusEl.className = "save-status saved";
            statusEl.innerHTML = "✓ Your exam has been submitted successfully.<br>Thank you, <strong>" + datos.nombre + "</strong>!";
            // Scroll al mensaje
            statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            throw new Error(result.error || "Error desconocido");
        }
    })
    .catch(err => {
        console.error("Error guardando:", err);
        statusEl.className = "save-status error";
        statusEl.textContent = "⚠ Could not submit. Please check your internet and try again.";
    });
}


/* ---------------------------------------------------------
   6. EVENT LISTENER
--------------------------------------------------------- */
document.getElementById("quizForm").addEventListener("submit", checkAnswers);

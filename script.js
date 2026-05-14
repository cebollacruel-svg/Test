/* =========================================================
   MEP LISTENING PRACTICE - QUIZ LOGIC + GOOGLE SHEETS
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
    reset(){
        this.plays = 0;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.button.disabled = false;
        this.button.textContent = "Play Audio";
        this.counter.textContent = "Remaining plays: " + this.maxPlays;
    }
}

const audio1Controller = new AudioController("audio1", "playBtn1", "counter1");
const audio2Controller = new AudioController("audio2", "playBtn2", "counter2");
const audio3Controller = new AudioController("audio3", "playBtn3", "counter3");


/* ---------------------------------------------------------
   2. ANSWER KEY & EXPLANATIONS
--------------------------------------------------------- */
const answers = {
    // ---- Part 1: Managing Money ----
    q1: { correct: "b", explanation: "The speaker says: 'I'm afraid I'm not going to tell you how to get rich quick, but I will tell you some simple things you can do that will help you save more money.'" },
    q2: { correct: "c", explanation: "The speaker clearly says: 'So I'm going to give you five tips. Simple but important advice to make sure you manage your money successfully.'" },
    q3: { correct: "a", explanation: "The speaker says: 'Now the first point, and perhaps the most important one, is about how much you spend. It's really important that you don't overspend.'" },
    q4: { correct: "b", explanation: "The speaker gives this exact example: 'Maybe just buy one cup of coffee a day instead of two. These small changes can make a difference.'" },
    q5: { correct: "b", explanation: "The speaker says: 'It's important that your salary is appropriate for your job.'" },
    q6: { correct: "b", explanation: "The speaker advises: 'Find out how your salary compares to other people doing the same kind of job in two or three other companies.'" },
    q7: { correct: "c", explanation: "The speaker is very clear: 'Everyone needs a budget. It doesn't matter how much money you earn.'" },
    q8: { correct: "b", explanation: "The speaker stresses: 'Make sure you have a budget AND make sure you use it. Don't just write it and forget about it.'" },

    // ---- Part 2: Movies ----
    q9:  { correct: "a", explanation: "Sue mentions she enjoys science fiction and action films." },
    q10: { correct: "b", explanation: "Sue says she doesn't like horror movies." },
    q11: { correct: "b", explanation: "Bob says horror is his favorite." },
    q12: { correct: "b", explanation: "Bob clearly says he does NOT like westerns." },
    q13: { correct: "a", explanation: "Andrew says action movies are his favorite type." },
    q14: { correct: "a", explanation: "Andrew also says he likes comedies." },
    q15: { correct: "b", explanation: "Tina says she loves westerns." },
    q16: { correct: "b", explanation: "Tina clearly states she does NOT like horror movies." },

    // ---- Part 3: Kloze-Zone Matching ----
    q17: { correct: "3", explanation: "Speaker 1 talks about window displays needing more innovation: 'I'd like to see more innovation in the window displays because it's what makes you go into a store when you're walking down the High Street.' → Topic 3" },
    q18: { correct: "6", explanation: "Speaker 2 talks about special offers, promotional events, and quiet months: 'I think we should organise some kind of promotional event in months like November and February.' → Topic 6" },
    q19: { correct: "4", explanation: "Speaker 3 says marketing should target men: 'I think they should aim their campaigns at guys, too... Perhaps they need more engaging marketing campaigns for guys?' → Topic 4" },
    q20: { correct: "1", explanation: "Speaker 4 mentions fitting room issues and praises the mobile app: 'I think they need to employ more staff in the store. But I love their mobile app.' → Topic 1" },
    q21: { correct: "2", explanation: "Speaker 5 works in Berlin and complains about long hours: 'A couple of my colleagues left last month because of the long working hours.' → Topic 2" },
    q22: { correct: "5", explanation: "Speaker 6 is the store manager talking about staff turnover and brand awareness: 'Staff turnover is pretty high... I think we need to improve brand awareness.' → Topic 5" }
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
    const total = Object.keys(answers).length;

    for(const key in answers){
        // Detectar si es radio (multiple choice) o select (matching)
        const radio = document.querySelector('input[name="' + key + '"]:checked');
        const select = document.querySelector('select[name="' + key + '"]');
        const selectedValue = radio ? radio.value : (select ? select.value : "");

        const fb = document.getElementById("fb" + key.substring(1));
        const correctAnswer = answers[key].correct;
        const correctDisplay = isNaN(correctAnswer) ? correctAnswer.toUpperCase() : correctAnswer;
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

    const percent = Math.round((score / total) * 100);
    displayResult(score, total, percent);

    guardarEnGoogleSheets({
        nombre: nombre,
        puntaje: score + "/" + total + " (" + percent + "%)"
    });

    document.getElementById("fb1").scrollIntoView({ behavior: "smooth", block: "center" });
}

function displayResult(score, total, percent){
    const resultEl = document.getElementById("result");
    const passed = percent >= 60;
    resultEl.innerHTML = "Final Score: " + score + " / " + total + " (" + percent + "%)";
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
   5. RESET
--------------------------------------------------------- */
function resetQuiz(){
    if(!confirm("¿Seguro que quieres reiniciar el test? Se borrarán todas las respuestas.")) return;
    audio1Controller.reset();
    audio2Controller.reset();
    audio3Controller.reset();
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('select.match-select').forEach(s => s.value = "");
    document.getElementById("studentName").value = "";
    document.querySelectorAll('.feedback').forEach(fb => {
        fb.style.display = "none";
        fb.className = "feedback";
        fb.innerHTML = "";
    });
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").style.background = "";
    document.getElementById("saveStatus").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------------------------------------------------------
   6. EVENT LISTENERS
--------------------------------------------------------- */
document.getElementById("quizForm").addEventListener("submit", checkAnswers);
document.getElementById("resetBtn").addEventListener("click", resetQuiz);

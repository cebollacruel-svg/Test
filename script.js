/* =========================================================
   MEP LISTENING PRACTICE 
   =========================================================
   This file controls:
   - Audio playback with a 4-play limit per audio
   - Answer checking with per-question feedback
   - Reset functionality to start over
   ========================================================= */

/* ---------------------------------------------------------
   1. AUDIO CONTROLLER
   ---------------------------------------------------------
   A reusable class so we don't repeat code for each audio.
   Each instance manages its own play counter and button.
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

// Instantiate one controller per audio (4-play limit each)
const audio1Controller = new AudioController("audio1", "playBtn1", "counter1");
const audio2Controller = new AudioController("audio2", "playBtn2", "counter2");


/* ---------------------------------------------------------
   2. ANSWER KEY & EXPLANATIONS
   ---------------------------------------------------------
   For each question:
     - correct: the right option letter (a, b, c)
     - explanation: WHY it is the correct answer

   To change a correct answer, just edit the "correct" value.
   To change feedback text, edit the "explanation".
--------------------------------------------------------- */
const answers = {
    // ---- Part 1: Budgeting ----
    q1: {
        correct: "b",
        explanation: "The speaker clearly defines: 'A budget is a plan for money. A budget helps us use money well.'"
    },
    q2: {
        correct: "b",
        explanation: "The speaker says: 'Anna gets $50 this week. This is her money. $50 is Anna's income.'"
    },
    q3: {
        correct: "a",
        explanation: "The speaker defines: 'A need is something important. You must have it.' A want is the extra/nice thing, not a need."
    },
    q4: {
        correct: "b",
        explanation: "The speaker says: 'Anna saves $10 every week. After one month, she has $40. After two months, she has $80.'"
    },

    // ---- Part 2: Movies ----
    q5: {
        correct: "a",
        explanation: "Sue mentions she enjoys science fiction and action films. Listen for her listing those two genres together."
    },
    q6: {
        correct: "b",
        explanation: "Sue says she doesn't like horror movies - they scare her or she finds them unpleasant."
    },
    q7: {
        correct: "b",
        explanation: "Bob says horror is his favorite. Listen for words like 'best', 'favorite', or 'love' connected to horror."
    },
    q8: {
        correct: "b",
        explanation: "Bob clearly says he does NOT like westerns. Listen for a negative statement about westerns."
    },
    q9: {
        correct: "a",
        explanation: "Andrew says action movies are his favorite type. Listen for him naming action as the top choice."
    },
    q10: {
        correct: "a",
        explanation: "Andrew also says he likes comedies - he mentions enjoying them in addition to action films."
    },
    q11: {
        correct: "b",
        explanation: "Tina says she loves westerns. Listen for her enthusiastic statement about that genre."
    },
    q12: {
        correct: "b",
        explanation: "Tina clearly states she does NOT like horror movies. Listen for her negative reaction to that genre."
    }
};


/* ---------------------------------------------------------
   3. QUIZ SUBMISSION HANDLER
--------------------------------------------------------- */
function checkAnswers(event){
    event.preventDefault();

    let score = 0;
    const total = Object.keys(answers).length;

    for(const key in answers){
        const selected = document.querySelector('input[name="' + key + '"]:checked');
        const fb = document.getElementById("fb" + key.substring(1));
        const correctLetter = answers[key].correct.toUpperCase();
        const explanation = answers[key].explanation;

        fb.style.display = "block";

        if(!selected){
            fb.className = "feedback incorrect";
            fb.innerHTML =
                "<strong>No answer selected</strong>" +
                "Correct answer: <b>" + correctLetter + "</b>. " + explanation;
        } else if(selected.value === answers[key].correct){
            score++;
            fb.className = "feedback correct";
            fb.innerHTML =
                "<strong>✓ Correct!</strong>" + explanation;
        } else {
            fb.className = "feedback incorrect";
            fb.innerHTML =
                "<strong>✗ Incorrect.</strong>" +
                "The correct answer is <b>" + correctLetter + "</b>. " + explanation;
        }
    }

    displayResult(score, total);
    document.getElementById("fb1").scrollIntoView({ behavior: "smooth", block: "center" });
}

function displayResult(score, total){
    const resultEl = document.getElementById("result");
    const percent = Math.round((score / total) * 100);
    const passed = percent >= 60;

    resultEl.innerHTML = "Final Score: " + score + " / " + total + " (" + percent + "%)";
    resultEl.style.background = passed ? "var(--success-bg)" : "var(--error-bg)";
    resultEl.style.color = passed ? "var(--success-dark)" : "var(--error)";
}


/* ---------------------------------------------------------
   4. RESET FUNCTIONALITY
--------------------------------------------------------- */
function resetQuiz(){
    if(!confirm("Are you sure you want to reset the test? All answers and play counts will be erased.")) return;

    // Reset audio controllers
    audio1Controller.reset();
    audio2Controller.reset();

    // Clear radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);

    // Hide feedback boxes
    document.querySelectorAll('.feedback').forEach(fb => {
        fb.style.display = "none";
        fb.className = "feedback";
        fb.innerHTML = "";
    });

    // Clear final result
    const resultEl = document.getElementById("result");
    resultEl.innerHTML = "";
    resultEl.style.background = "";

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------------------------------------------------------
   5. EVENT LISTENERS
--------------------------------------------------------- */
document.getElementById("quizForm").addEventListener("submit", checkAnswers);
document.getElementById("resetBtn").addEventListener("click", resetQuiz);

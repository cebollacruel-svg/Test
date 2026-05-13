/* =========================================================
   MEP LISTENING PRACTICE - QUIZ LOGIC
   ========================================================= */

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


/* ---------------------------------------------------------
   2. ANSWER KEY & EXPLANATIONS
--------------------------------------------------------- */
const answers = {
    // ---- Part 1: Managing Money ----
    q1: {
        correct: "b",
        explanation: "The speaker says: 'I'm afraid I'm not going to tell you how to get rich quick, but I will tell you some simple things you can do that will help you save more money.' The talk is about simple money-saving advice, not getting rich quickly."
    },
    q2: {
        correct: "c",
        explanation: "The speaker clearly says: 'So I'm going to give you five tips. Simple but important advice to make sure you manage your money successfully.'"
    },
    q3: {
        correct: "a",
        explanation: "The speaker says: 'Now the first point, and perhaps the most important one, is about how much you spend. It's really important that you don't overspend.' The example given is: if you earn $2,000, don't spend $2,500."
    },
    q4: {
        correct: "b",
        explanation: "The speaker gives this exact example: 'Maybe just buy one cup of coffee a day instead of two. These small changes can make a difference.'"
    },
    q5: {
        correct: "b",
        explanation: "The speaker says: 'It's important that your salary is appropriate for your job.' He wants you to make sure you're not being paid too little for the work you do."
    },
    q6: {
        correct: "b",
        explanation: "The speaker advises: 'Find out how your salary compares to other people doing the same kind of job in two or three other companies.'"
    },
    q7: {
        correct: "c",
        explanation: "The speaker is very clear: 'Everyone needs a budget. It doesn't matter how much money you earn.' Even people with high incomes need a plan."
    },
    q8: {
        correct: "b",
        explanation: "The speaker stresses: 'Make sure you have a budget AND make sure you use it. Don't just write it and forget about it.' Creating a budget is useless if you don't actually follow it day to day."
    },

    // ---- Part 2: Movies ----
    q9:  { correct: "a", explanation: "Sue mentions she enjoys science fiction and action films. Listen for her listing those two genres together." },
    q10: { correct: "b", explanation: "Sue says she doesn't like horror movies - they scare her or she finds them unpleasant." },
    q11: { correct: "b", explanation: "Bob says horror is his favorite. Listen for words like 'best', 'favorite', or 'love' connected to horror." },
    q12: { correct: "b", explanation: "Bob clearly says he does NOT like westerns. Listen for a negative statement about westerns." },
    q13: { correct: "a", explanation: "Andrew says action movies are his favorite type. Listen for him naming action as the top choice." },
    q14: { correct: "a", explanation: "Andrew also says he likes comedies - he mentions enjoying them in addition to action films." },
    q15: { correct: "b", explanation: "Tina says she loves westerns. Listen for her enthusiastic statement about that genre." },
    q16: { correct: "b", explanation: "Tina clearly states she does NOT like horror movies. Listen for her negative reaction to that genre." }
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
            fb.innerHTML = "<strong>No answer selected</strong>Correct answer: <b>" + correctLetter + "</b>. " + explanation;
        } else if(selected.value === answers[key].correct){
            score++;
            fb.className = "feedback correct";
            fb.innerHTML = "<strong>✓ Correct!</strong>" + explanation;
        } else {
            fb.className = "feedback incorrect";
            fb.innerHTML = "<strong>✗ Incorrect.</strong>The correct answer is <b>" + correctLetter + "</b>. " + explanation;
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
    audio1Controller.reset();
    audio2Controller.reset();
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('.feedback').forEach(fb => {
        fb.style.display = "none";
        fb.className = "feedback";
        fb.innerHTML = "";
    });
    const resultEl = document.getElementById("result");
    resultEl.innerHTML = "";
    resultEl.style.background = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ---------------------------------------------------------
   5. EVENT LISTENERS
--------------------------------------------------------- */
document.getElementById("quizForm").addEventListener("submit", checkAnswers);
document.getElementById("resetBtn").addEventListener("click", resetQuiz);

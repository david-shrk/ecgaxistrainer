/**
 * @file Main file that calculates the mouseposition and ecg-angle.
 * @author David Schaack
 * 
 */


import { drawEcg } from './ecgDrawing.js'
import { mouseAngle } from './circleCalculations.js';
import { calculateEcg, lagetyp } from './ecgCalculations.js';


// Variables
let mouseDown = false;
let angle = 45;
let answersCorrect = 0;
let answersWrong = 0;
let sideBySide = false;
let dpr = window.devicePixelRatio;
let firstMove = true;

// Main document elements
const line = document.getElementById('line');
const lineright = document.getElementById('lineright');
const bigCircle = document.getElementById('bigCircle');
const containerDivs = document.querySelectorAll("div.containerInner");
const split = document.querySelector('div.split');
const ecg = document.getElementById('ecg');
const cabrera = document.getElementById('cabrera');
const quiz = document.getElementById('quiz');
const about = document.getElementById('about');
const displayAnswersCorrect = document.getElementById('answersCorrect');
const displayAnswersWrong = document.getElementById('answersWrong');
const displayLagetyp = document.getElementById('lagetyp');
const labelCorrect = document.getElementById('correct');
const labelWrong = document.getElementById('wrong');

// Canvas
const ecgCanvas = document.getElementById('ecgCanvas');
const ctxEcg = ecgCanvas.getContext('2d');
const gridCanvas = document.getElementById('gridCanvas');
const ctxGrid = gridCanvas.getContext('2d');

// Cabrera-circle elements
const uelt = document.getElementById('uelt');
const lt = document.getElementById('lt');
const it = document.getElementById('it');
const st = document.getElementById('st');
const rt = document.getElementById('rt');
const uert = document.getElementById('uert');
const nwt = document.getElementById('nwt');
const circleParts = [lt, it, st, rt, uert, uelt, nwt];

// Navigation Buttons
const buttonCabrera = document.getElementById('button_cabrera');
const buttonQuiz = document.getElementById('button_quiz');
const buttonAbout = document.getElementById('button_about');

buttonQuiz.addEventListener('click', switchToQuiz);
buttonCabrera.addEventListener('click', switchToCabrera);
buttonAbout.addEventListener('click', switchToAbout);

// Quiz Buttons 
const buttonIt = document.getElementById('button_it');
const buttonLt = document.getElementById('button_lt');
const buttonUelt = document.getElementById('button_uelt');
const buttonSt = document.getElementById('button_st');
const buttonRt = document.getElementById('button_rt');
const buttonUert = document.getElementById('button_uert');

buttonIt.addEventListener('click', () => {
    checkAnswer('Indifferenztyp')
});
buttonLt.addEventListener('click', () => {
    checkAnswer('Linkstyp')
});
buttonUelt.addEventListener('click', () => {
    checkAnswer('Ueberdrehter Linkstyp')
});
buttonSt.addEventListener('click', () => {
    checkAnswer('Steiltyp')
});
buttonRt.addEventListener('click', () => {
    checkAnswer('Rechtstyp')
});
buttonUert.addEventListener('click', () => {
    checkAnswer('Ueberdrehter Rechtstyp')
});


// Event-listeners
lineright.addEventListener('mousedown', (e) => {
    mouseDown = true;
}, true);

document.addEventListener('mouseup', () => {
    mouseDown = false;
}, true);

document.addEventListener('mousemove', (event) => {
    if (mouseDown) {
        if (firstMove) {
            deleteRotationAnimation();
            firstMove = false;
        }
        angle = mouseAngle(event, bigCircle);
        update(angle)
    }

}, true);

bigCircle.addEventListener('wheel', (event) => {
    event.preventDefault();
    let newAngle = angle - (event.deltaY / 25);
    if (newAngle > 360) {
        newAngle -= 360;
    } else if (newAngle < 0) {
        newAngle += 360;
    }
    angle = newAngle;
    update(angle);
})

window.addEventListener('resize', resizeDivs);
window.addEventListener('resize', resizeEcg);

window.onload = function () {
    resizeDivs();
    resizeEcg();
    buttonCabrera.style.color = 'var(--activeButton)';
}


// Event-listeners for touchscreens
lineright.addEventListener('touchstart', (e) => {
    mouseDown = true;
}, true);

document.addEventListener('touchend', () => {
    mouseDown = false;
}, true);

document.addEventListener('touchmove', (event) => {
    if (mouseDown) {
        event.preventDefault();
        if (firstMove) {
            deleteRotationAnimation();
            firstMove = false;
        }
        angle = (mouseAngle(event, bigCircle));
        update(angle);
    }

}, { passive: false });



// Functions

function deleteRotationAnimation() {
    lineright.style.backgroundImage = 'none';
    lineright.style.animationIterationCount = 0;
}

function switchToQuiz() {
    labelCorrect.classList.remove('animateCorrect');
    labelWrong.classList.remove('animateWrong');
    quiz.style.display = 'flex';
    cabrera.style.display = 'none';
    ecg.style.display = '';
    about.style.display = 'none';
    newEcg();
    buttonCabrera.style.color = '';
    buttonQuiz.style.color = 'var(--activeButton)';
    buttonAbout.style.color = '';
    split.style.padding = '';
    window.dispatchEvent(new Event('resize'));
}

function switchToCabrera() {
    quiz.style.display = 'none';
    cabrera.style.display = '';
    ecg.style.display = '';
    about.style.display = 'none';
    buttonCabrera.style.color = 'var(--activeButton)';
    buttonQuiz.style.color = '';
    buttonAbout.style.color = '';
    split.style.padding = '';
    window.dispatchEvent(new Event('resize'));
}

function switchToAbout() {
    quiz.style.display = 'none';
    cabrera.style.display = 'none';
    ecg.style.display = 'none';
    about.style.display = 'block';
    buttonCabrera.style.color = '';
    buttonQuiz.style.color = '';
    buttonAbout.style.color = 'var(--activeButton)';
    split.style.padding = '1rem 1rem'; // about section does not get smaller with higher aspect-ratio mediaqueries 
    window.dispatchEvent(new Event('resize'));
}

/**
 * Resizes all container divs proportionally (reading the current width and setting the height accordingly).
 */

function resizeDivs() {
    containerDivs.forEach(e => {
        resizeProportionally(e);
    });
}

/**
 * Resizes the ECG canvas. Handles different pixel ratios.
 */

function resizeEcg() {
    const width = document.getElementById('ecg').clientWidth;
    dpr = Math.ceil(window.devicePixelRatio);
    ecgCanvas.width = dpr * width;
    gridCanvas.width = dpr * width;
    ecgCanvas.height = dpr * width;
    gridCanvas.height = dpr * width;
    ecgCanvas.style.width = `${width}px`;
    ecgCanvas.style.height = `${width}px`;
    gridCanvas.style.width = `${width}px`;
    gridCanvas.style.height = `${width}px`;

    if (width < 300) {
        sideBySide = true;
    } else {
        sideBySide = false;
    }
    update(angle);
}

/**
 * Setting the height of an element equal to its width.
 * @param {element} e The element which should be resized.
 */

const resizeProportionally = (e) => {
    const width = e.offsetWidth;
    e.style.height = width + 'px';
}






/**
 * Main update function to update the Cabrera-circle, the line and the ecg.
 * @param {double} angle the angle of the heart-axis
 */

const update = (angle) => {
    line.style.transform = 'rotate(' + angle + 'deg)';
    updateDropShadow(line, angle);
    styleCircle(angle);
    displayLagetyp.innerHTML = (lagetyp(angle) + '<br>' + angle.toFixed(1) + '&deg');
    const ecgAmplitudes = calculateEcg(angle);
    const ecgLeads = ["I", "II", "III", "aVR", "aVL", "aVF"];
    drawEcg(ctxEcg, ctxGrid, ecgLeads, ecgAmplitudes, ecgCanvas.width, ecgCanvas.height, sideBySide, dpr);
}

/**
 * 
 * @param {object} e the element which the shadow should be applied to
 * @param {double} angle the current angle of the element
 */

const updateDropShadow = (e, angle) => {
    const distance = 0.3;    // Distance of the shadow from the arrow (in rem)
    const shadowAngle = 45; // Degree of the shadow angle
    let offsetX = distance;
    let offsetY = distance;
    offsetY = Math.sin(degToRad(shadowAngle - angle)) * distance;
    offsetX = Math.cos(degToRad(shadowAngle - angle)) * distance;
    e.style.filter = 'drop-shadow(' + offsetX + 'rem ' + offsetY + 'rem 0.1rem rgba(0, 0, 0, 0.5)';
}

/**
 * Converts degree to rad.
 * @param {double} deg degree 
 * @returns rad as double
 */
const degToRad = (deg) => {
    return (deg * Math.PI / 180);
}


/**
 * Checks in which part of the Cabrera-circle the degree is and calls the styleCircleParts for the correct part. 
 * @param {double} degree the current angle
 * @returns an error only if the degree is invalid (>360 or <0)
 */

const styleCircle = (degree) => {
    if (degree > 360 || degree < 0) {
        console.log('invalid degree');
        return 'invalid degree';
    } else if (degree >= 30 && degree < 60) {
        styleCircleParts(it);
        displayLagetyp.style.backgroundColor = 'var(--it)';
    } else if (degree >= 60 && degree < 90) {
        styleCircleParts(st);
        displayLagetyp.style.backgroundColor = 'var(--st)';
    } else if (degree >= 90 && degree < 120) {
        styleCircleParts(rt);
        displayLagetyp.style.backgroundColor = 'var(--rt)';
    } else if (degree >= 120 && degree < 180) {
        styleCircleParts(uert);
        displayLagetyp.style.backgroundColor = 'var(--uert)';
    } else if (degree >= 180 && degree < 270) {
        styleCircleParts(nwt);
        displayLagetyp.style.backgroundColor = 'var(--nwt)';
    } else if (degree >= 270 && degree < 330) {
        styleCircleParts(uelt);
        displayLagetyp.style.backgroundColor = 'var(--uelt)';
    } else if (degree >= 330 || degree < 30) {
        styleCircleParts(lt);
        displayLagetyp.style.backgroundColor = 'var(--lt)';
    }
}

/**
 * Empzasizes one part of the Cabrera-circle and resets all the other parts to initial styling.
 * @param {Element} e the element of circle that should be emphasized 
 */

const styleCircleParts = (e) => {
    circleParts.forEach(part => {
        if (e === part) {
            emphasizeCirclePart(e);
        } else {
            resetCirclePart(part);
        }
    })
}

/**
 * Used to emphasize a part of the Cabrera-circle (for example on mouseover)
 * @param {Element} e the element that should be emphasized 
 */

const emphasizeCirclePart = (e) => {
    e.style.filter = 'saturate(5)';
}

/**
 * Used to reset a part of the Cabrera-circle to initial styling.
 * @param {Element} e the element that should be resetted
 */

const resetCirclePart = (e) => {
    e.style.filter = 'saturate(1)';
}





// QUIZ TODO: in module ausgliedern oder dokumentieren


/**
 * Generates a new random axis and uses the update-function with the new angle.
 */

const checkAnswer = (answer) => {
    if (lagetyp(angle) === answer) {
        answersCorrect += 1;
        labelCorrect.classList.remove('animateCorrect');
        void labelCorrect.offsetWidth; // Trigger reflow to make the animation work.
        labelCorrect.classList.add('animateCorrect');
        displayAnswersCorrect.innerHTML = answersCorrect;
        newEcg();
    } else {
        answersWrong += 1;
        labelWrong.classList.remove('animateWrong');
        void labelWrong.offsetWidth; // Trigger reflow to make the animation work.
        labelWrong.classList.add('animateWrong');
        displayAnswersWrong.innerHTML = answersWrong;
    }
}
const newEcg = () => {
    angle = getRandomAxis();
    update(angle);
}


const getRandomAxis = () => {
    let degree = 0;
    do {
        degree = Math.floor(Math.random() * 360);
    } while ((degree >= 180 && degree < 270));
    return degree;
}

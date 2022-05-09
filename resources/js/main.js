/**
 * @file Main file that calculates the mouseposition and ecg-angle.
 * @author David Schaack
 * 
 */

//Imports
import { drawEcg } from './ecgDrawing.js'
import { mouseAngle } from './circleCalculations.js';
import { calculateEcg, lagetyp } from './ecgCalculations.js';
import { langDe, langEn, langEs } from './languages.js';

// Variables
let international = true;
let currentLanguage = langEn;
let currentSection = 'cabrera';
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
const circleDe = document.getElementById('circleDe');
const circleInt = document.getElementById('circleInt');
const split = document.querySelector('div.split');
const ecg = document.getElementById('ecg');
const cabrera = document.getElementById('cabrera');
const quiz = document.getElementById('quiz');
const about = document.getElementById('about');
const sectionGeneral = document.getElementById('sectionGeneral');
const sectionSources = document.getElementById('sectionSources');

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
const enLad = document.getElementById('enLad');
const enNormal = document.getElementById('enNormal');
const enRad = document.getElementById('enRad');
const enNwt = document.getElementById('enNwt');
const circlePartsEn = [enLad, enNormal, enRad, enNwt];

// Navigation Buttons
const buttonCabrera = document.getElementById('button_cabrera');
const buttonQuiz = document.getElementById('button_quiz');
const buttonAbout = document.getElementById('button_about');
const buttonLangEn = document.getElementById('button_en');
const buttonLangDe = document.getElementById('button_de');
const buttonLangEs = document.getElementById('button_es');

buttonQuiz.addEventListener('click', switchToQuiz);
buttonCabrera.addEventListener('click', switchToCabrera);
buttonAbout.addEventListener('click', switchToAbout);

buttonLangEn.addEventListener('click', (element) => {
    international = true;
    currentLanguage = langEn;
    switchLanguage(international, currentLanguage);
    styleLanguageButtons(element.target.id);
    update(angle);
})

buttonLangDe.addEventListener('click', (element) => {
    international = false;
    currentLanguage = langDe;
    switchLanguage(international, currentLanguage);
    styleLanguageButtons(element.target.id);
    update(angle);
})

buttonLangEs.addEventListener('click', (element) => {
    international = true;
    currentLanguage = langEs;
    switchLanguage(international, currentLanguage);
    styleLanguageButtons(element.target.id);
    update(angle);
})

// Quiz Buttons 
const buttonIt = document.getElementById('button_it');
const buttonLt = document.getElementById('button_lt');
const buttonUelt = document.getElementById('button_uelt');
const buttonSt = document.getElementById('button_st');
const buttonRt = document.getElementById('button_rt');
const buttonUert = document.getElementById('button_uert');
const buttonIntNormal = document.getElementById('button_enNormal');
const buttonIntLad = document.getElementById('button_enLad');
const buttonIntRad = document.getElementById('button_enRad');

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
buttonIntNormal.addEventListener('click', () => {
    checkAnswer(currentLanguage.typeNormal, true)
})
buttonIntLad.addEventListener('click', () => {
    checkAnswer(currentLanguage.typeLad, true)
})
buttonIntRad.addEventListener('click', () => {
    checkAnswer(currentLanguage.typeRad, true)
})

// Quiz elements
const displayAnswersCorrect = document.getElementById('answersCorrect');
const displayAnswersWrong = document.getElementById('answersWrong');
const displayLagetyp = document.getElementById('lagetyp');
const displayCorrect = document.getElementById('correct');
const displayWrong = document.getElementById('wrong');
const labelCorrect = document.getElementById('labelCorrect');
const labelWrong = document.getElementById('labelWrong');

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
    if (navigator.language == 'de-DE' || navigator.language == 'de') {
        international = false;
        currentLanguage = langDe;
        styleLanguageButtons('button_de');
    } else if (navigator.language == 'es') {
        international = true;
        currentLanguage = langEs;
        styleLanguageButtons('button_es');
    } else {
        styleLanguageButtons('button_en');
    }
    switchLanguage(international, currentLanguage);
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


// Navigation functions

function switchToCabrera() {
    if (currentSection != 'cabrera') {
        quiz.style.display = 'none';
        cabrera.style.display = '';
        ecg.style.display = '';
        about.style.display = 'none';
        buttonCabrera.style.color = 'var(--activeButton)';
        buttonQuiz.style.color = '';
        buttonAbout.style.color = '';
        split.style.padding = '';
        currentSection = 'cabrera';
        window.dispatchEvent(new Event('resize'));
    }
}

function switchToQuiz() {
    if (currentSection != 'quiz') {
        displayCorrect.classList.remove('animateCorrect');
        displayWrong.classList.remove('animateWrong');
        quiz.style.display = 'flex';
        cabrera.style.display = 'none';
        ecg.style.display = '';
        about.style.display = 'none';
        newEcg();
        buttonCabrera.style.color = '';
        buttonQuiz.style.color = 'var(--activeButton)';
        buttonAbout.style.color = '';
        split.style.padding = '';
        currentSection = 'quiz';
        window.dispatchEvent(new Event('resize'));
    }
}

function switchToAbout() {
    if (currentSection != 'about') {
        quiz.style.display = 'none';
        cabrera.style.display = 'none';
        ecg.style.display = 'none';
        about.style.display = 'block';
        buttonCabrera.style.color = '';
        buttonQuiz.style.color = '';
        buttonAbout.style.color = 'var(--activeButton)';
        split.style.padding = '1rem 1rem'; // about section does not get smaller with higher aspect-ratio mediaqueries 
        currentSection = 'about';
        window.dispatchEvent(new Event('resize'));
    }
}


// Display and layout functions

/**
 * Main update function to update the Cabrera-circle, the line and the ecg.
 * @param {double} angle the angle of the heart-axis
 */

const update = (angle) => {
    line.style.transform = 'rotate(' + angle + 'deg)';
    updateDropShadow(line, angle);
    if (international) {
        stylecircleInt(angle);
    } else {
        styleCircle(angle);
    }
    displayLagetyp.innerHTML = (lagetyp(angle, international, currentLanguage) + '<br>' + angle.toFixed(1) + '&deg');
    const ecgAmplitudes = calculateEcg(angle);
    const ecgLeads = ["I", "II", "III", "aVR", "aVL", "aVF"];
    drawEcg(ctxEcg, ctxGrid, ecgLeads, ecgAmplitudes, ecgCanvas.width, ecgCanvas.height, sideBySide, dpr);
}

function deleteRotationAnimation() {
    lineright.style.backgroundImage = 'none';
    lineright.style.animationIterationCount = 0;
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
        styleCircleParts(it, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--it)';
    } else if (degree >= 60 && degree < 90) {
        styleCircleParts(st, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--st)';
    } else if (degree >= 90 && degree < 120) {
        styleCircleParts(rt, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--rt)';
    } else if (degree >= 120 && degree < 180) {
        styleCircleParts(uert, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--uert)';
    } else if (degree >= 180 && degree < 270) {
        styleCircleParts(nwt, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--nwt)';
    } else if (degree >= 270 && degree < 330) {
        styleCircleParts(uelt, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--uelt)';
    } else if (degree >= 330 || degree < 30) {
        styleCircleParts(lt, circleParts);
        displayLagetyp.style.backgroundColor = 'var(--lt)';
    }
}

/**
 * Checks in which part of the Cabrera-circle the degree is and calls the styleCircleParts for the correct part. 
 * International version (containig less parts then the German circle).
 * @param {double} degree the current angle
 * @returns an error only if the degree is invalid (>360 or <0)
 */

const stylecircleInt = (degree) => {
    if (degree > 360 || degree < 0) {
        console.log('invalid degree');
        return 'invalid degree';
    } else if (degree >= 90 && degree < 180) {
        styleCircleParts(enRad, circlePartsEn);
        displayLagetyp.style.backgroundColor = 'var(--st)';
    } else if (degree >= 180 && degree < 270) {
        styleCircleParts(enNwt, circlePartsEn);
        displayLagetyp.style.backgroundColor = 'var(--uert)';
    } else if (degree >= 270 && degree < 330) {
        styleCircleParts(enLad, circlePartsEn);
        displayLagetyp.style.backgroundColor = 'var(--lt)';
    } else if (degree >= 330 || degree < 90) {
        styleCircleParts(enNormal, circlePartsEn);
        displayLagetyp.style.backgroundColor = 'var(--it)';
    }
}

/**
 * Empzasizes one part of the Cabrera-circle and resets all the other parts to initial styling.
 * @param {Element} e the element of circle that should be emphasized 
 * @param {String[]} parts a string array containing all the circle parts (different for german and international version)
 */

const styleCircleParts = (e, parts) => {
    parts.forEach(part => {
        if (e === part) {
            emphasizeCirclePart(e);
        } else {
            resetCirclePart(part);
        }
    })
}

/**
 * Used to emphasize a part of the Cabrera-circle.
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


// Quiz functions

/**
 * Checks if the answer matches the current axis and updates the counters accordingly.
 * @param {string} answer The current cardiac-axys type as a string.
 * @param {boolean} international determines if German or international axis nomenclature is used (default is false, meaning German system).
 */

const checkAnswer = (answer, international = false) => {
    if (lagetyp(angle, international, currentLanguage) === answer) {
        answersCorrect += 1;
        displayCorrect.classList.remove('animateCorrect');
        void displayCorrect.offsetWidth; // Trigger reflow to make the animation work.
        displayCorrect.classList.add('animateCorrect');
        displayAnswersCorrect.innerHTML = answersCorrect;
        newEcg();
    } else {
        answersWrong += 1;
        displayWrong.classList.remove('animateWrong');
        void displayWrong.offsetWidth; // Trigger reflow to make the animation work.
        displayWrong.classList.add('animateWrong');
        displayAnswersWrong.innerHTML = answersWrong;
    }
}

/**
 * Generates a new random axis and uses the update-function with the new angle.
 */

const newEcg = () => {
    angle = getRandomAxis();
    update(angle);
}

/**
 * Randomizes a degree in the cabrera-circle. Does not return "northwest-type" angles.
 * TODO: cut degrees +-5° between borders because these ecgs are hard to read.
 * @returns the randomized angle as double
 */

const getRandomAxis = () => {
    let degree = 0;
    do {
        degree = Math.floor(Math.random() * 360);
    } while ((degree >= 170 && degree < 280) || (degree > 320 && degree < 340) || (degree > 20 && degree < 35) || (degree > 55 && degree < 65) || (degree > 85 && degree < 95) || (degree > 115 && degree < 130));
    return degree;
}


// Language functions

/**
 * Switches between international and German version.
 * This does not only change the language but also the whole axis-determination (only normal axis, left axis deviation, right axis deviation and Northwest-type for english as compared to the more complicated German system).
 * @param {boolean} international defines if switch should be made to international or German version
 * @param {JSON} language An object containing the necessary language content.
 */
function switchLanguage(international, language) {
    langButtons(international);
    langCabrera(international);
    langFillContent(language);
}

/**
 * 
 * @param {element} element the id of the language-button which should be styled as active button
 */
function styleLanguageButtons(element) {
    buttonLangDe.classList.remove('langButtonActive');
    buttonLangEn.classList.remove('langButtonActive');
    buttonLangEs.classList.remove('langButtonActive');
    document.getElementById(element).classList.add('langButtonActive');
}


/**
 * Switches the display of the buttons between international and German version.
 * @param {boolean} international defines if switch should be made to international (english) or German version
 */

const langButtons = (international) => {
    document.querySelectorAll("button.answer.de").forEach(element => {
        if (international) {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    })
    document.querySelectorAll("button.answer.en").forEach(element => {
        if (international) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    })
}

/**
 * Switches the display of the Cabrera circle between international and German version.
 * @param {boolean} international defines if switch should be made to international (english) or German version
 */

const langCabrera = (international) => {
    if (international) {
        circleDe.style.display = 'none';
        circleInt.style.display = 'block';
    } else {
        circleDe.style.display = 'block';
        circleInt.style.display = 'none';
    }
}

/**
 * Fills the text-content with the correct language.
 * @param {JSON} language An object containing the necessary content.
 */

const langFillContent = (language) => {
    document.querySelector('h1').innerHTML = language.title;
    buttonCabrera.innerHTML = language.navCabrera;
    buttonQuiz.innerHTML = language.navQuiz;
    buttonAbout.innerHTML = language.navAbout;
    labelCorrect.innerHTML = language.quizCorrect;
    labelWrong.innerHTML = language.quizWrong;
    sectionGeneral.innerHTML = language.aboutGeneral;
    sectionSources.innerHTML = language.aboutSources;
    buttonIntNormal.innerHTML = language.typeNormal;
    buttonIntLad.innerHTML = language.typeLad;
    buttonIntRad.innerHTML = language.typeRad;
}
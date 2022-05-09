/**
 * @file Includes all functions for drawing of the ecg-grid and the ecg itself.
 * @author David Schaack
 */


// Preferences

let lineWidth = 1; // QRS Line-Width
let font = '20px serif'
let dpr = 1;


/**
 * Function to draw a single ecg-segment consisting of P-wave, QRS-complex and T-wave.
 * Positive qrs-complexes consist of R- and s-wave. If the main vector of the complex is negative, the drawing is reversed 
 * to have a qrs-complex with an S and r-Wave instead of a large Q-Wave.
 * 
 * Scaling: one segment from begin of P-wave to end of T-wave is 600 ms = 3 factor
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {double} amplitude the amplitude of the main vector (-1 to 1)
 * @param {double} yLevel the vertical level where the segment should be drawn
 * @param {double} xStart  the horizontal starting point
 * @param {double} factor 1 cm of the ecg in px
 * @param {boolean} flatline defines wether an amplitude of 0 creates a flatline or an RS-complex with equally large R- and S-waves. Defaults to false.
 */

const drawQRS = (ctx, amplitude, yLevel, xStart, factor, flatline = false) => {
    ctx.lineWidth = lineWidth;
    ctx.arc(xStart + factor * 0.25, yLevel, factor * 0.25, Math.PI, 0); // P-wave, 100 ms = 1/2 factor
    ctx.lineTo(xStart + factor, yLevel); // PQ, 200 ms = 1 factor (from begin of p-wave)
    if (flatline) {
        if (amplitude >= 0) {
            ctx.lineTo(xStart + factor + factor * 0.17, (yLevel - amplitude * factor * 2)); // R upstroke, QRS combined 100 ms = 1/2 factor
            ctx.lineTo(xStart + factor + factor * 0.34, (yLevel + amplitude * factor * 0.6)); // R downstroke
            ctx.lineTo(xStart + factor + factor * 0.5, yLevel); // S upstroke
        } else {
            ctx.lineTo(xStart + factor + factor * 0.16, (yLevel + amplitude * factor * 0.6)); // R upstroke
            ctx.lineTo(xStart + factor + factor * 0.34, (yLevel - amplitude * factor * 2)); // S downstroke
            ctx.lineTo(xStart + factor + factor * 0.5, yLevel); // S upstroke
        }
    } else {
        const threshold = 0.4; //amplitude threshold at which the R-wave does not decrease anymore but the S-wave increases to have a smaller amplitude sum.
        if (amplitude >= threshold) {
            ctx.lineTo(xStart + factor + factor * 0.17, (yLevel - amplitude * factor * 2)); // R upstroke
            ctx.lineTo(xStart + factor + factor * 0.34, (yLevel + amplitude * factor * 0.6)); // R downstroke
            ctx.lineTo(xStart + factor + factor * 0.5, yLevel); // S upstroke
        } else if (amplitude < threshold && amplitude >= 0) {
            ctx.lineTo(xStart + factor + factor * 0.17, (yLevel - threshold * factor * 2)); // R upstroke
            ctx.lineTo(xStart + factor + factor * 0.34, (yLevel + Math.max(threshold * 0.6, (threshold - amplitude) * 2) * factor)); // R downstroke
            ctx.lineTo(xStart + factor + factor * 0.5, yLevel); // S upstroke
        } else if (amplitude < 0 && amplitude > (threshold * -1)) {
            ctx.lineTo(xStart + factor + factor * 0.17, (yLevel - Math.max(threshold * 0.6, (threshold + amplitude) * 2) * factor)); // R upstroke
            ctx.lineTo(xStart + factor + factor * 0.34, (yLevel + threshold * 2 * factor)); // R downstroke
            ctx.lineTo(xStart + factor + factor * 0.5, yLevel); // S upstroke
        } else {
            ctx.lineTo(xStart + factor + factor * 0.17, (yLevel + amplitude * factor * 0.6)); // R upstroke
            ctx.lineTo(xStart + factor + factor * 0.34, (yLevel - amplitude * factor * 2)); // S downstroke
            ctx.lineTo(xStart + factor + factor * 0.5, yLevel); // S upstroke
        }
    }
    ctx.arc(xStart + factor * 2.6, yLevel, factor * 0.4, Math.PI, 0); // ST; QT-time is 400 ms = 2 factor => ST is 1.5 factor
}

/**
 * This function chains together multiple ecg-segments to draw one ecg-line.
 * It always starts at 60 px in from the left border  (because of the label of the lead) and it draws one QRS-complex per second (meaning one QRS-complex per 5*factor)
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {double} amplitude the amplitude of the main vector (-1 to 1)
 * @param {double} yLevel the vertical level where the line should be drawn
 * @param {double} canvasWidth the width of the canvas in px
 * @param {double} factor 1 cm of the ecg in px
 * @param {double} xstart the x coordinate where the line should start. Defaults to 0
 */

const drawEcgLine = (ctx, amplitude, yLevel, canvasWidth, factor, xstart = 0) => {
    let begin = xstart + 30 + 30 * dpr + factor * 0.75;
    ctx.moveTo(xstart + 30 + 30 * dpr, yLevel);
    while (begin < canvasWidth) {
        drawQRS(ctx, amplitude, yLevel, begin, factor);
        ctx.lineTo(begin + factor * 5, yLevel);
        begin += factor * 5;
    }
}

/**
 * This function draws an ecg and the grid on the canvas. It draws the amount of leads which are passed to it as an array. 
 * 
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {array} ecgLeads a string-array containing the names of the leads.
 * @param {array} ecgAmplitudes a double-array containing the qrs-amplitudes (-1 to 1) for the leads
 * @param {double} canvasWidth the width of the canvas in px
 * @param {double} canvasHeight the height of the canvas in px
 * @param {boolean} sideBySide draws three leads on the left and three leads on the right. Only works if the number of leads is even.
 * @param {double} _dpr device pixel ratio; used to adjust line-width and font-weight
 * 
 */

const drawEcg = (ctxEcg, ctxGrid, ecgLeads, ecgAmplitudes, canvasWidth, canvasHeight, sideBySide = false, _dpr = 1) => {
    dpr = _dpr
    lineWidth = dpr;
    if (dpr >= 2) {
        font = 15 * dpr + 'px serif';
    } else {
        font = '20px serif'
    }

    ctxEcg.clearRect(0, 0, canvasWidth, canvasHeight);
    ctxEcg.font = font;
    if (sideBySide && ecgLeads.length % 2 === 0) {
        const factor = calculateEcgFactor(canvasHeight, ecgLeads.length / 2);
        drawGrid(ctxGrid, canvasWidth, canvasHeight, factor);
        drawEcgSideBySide(ctxEcg, ecgLeads, ecgAmplitudes, canvasWidth, canvasHeight, factor);
    } else {
        const heightPerLine = Math.floor(canvasHeight) / (ecgLeads.length + 1); // half line added above and below the ecg.
        const factor = calculateEcgFactor(canvasHeight, ecgLeads.length);
        drawGrid(ctxGrid, canvasWidth, canvasHeight, factor);
        ctxEcg.strokeStyle = "#000000";
        ctxEcg.beginPath();
        for (let i = 0; i < ecgLeads.length; i++) {
            ctxEcg.fillText(ecgLeads[i], 15, (heightPerLine * (i + 1)) + 5);
            drawEcgLine(ctxEcg, ecgAmplitudes[i], (heightPerLine * (i + 1)), canvasWidth, factor);
        }
        ctxEcg.stroke();
        ctxEcg.closePath();
    }
}


/**
 * This function draws an ecg and the grid on the canvas.
 * It draws three leads on the left and three leads on the right.
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {array} ecgLeads a string-array containing the names of the leads.
 * @param {array} ecgAmplitudes a double-array containing the qrs-amplitudes (-1 to 1) for the leads
 * @param {double} canvasWidth the width of the canvas in px
 * @param {double} canvasHeight the height of the canvas in px
 * @param {double} factor 1 cm of the ecg in px
 */
const drawEcgSideBySide = (ctx, ecgLeads, ecgAmplitudes, canvasWidth, canvasHeight, factor) => {
    const heightPerLine = Math.floor(canvasHeight) / (ecgLeads.length / 2 + 1); // half line added above and below the ecg.
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    for (let i = 0; i < ecgLeads.length / 2; i++) {
        ctx.fillText(ecgLeads[i], 15, (heightPerLine * (i + 1)) + 5);
        drawEcgLine(ctx, ecgAmplitudes[i], (heightPerLine * (i + 1)), canvasWidth, factor);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.clearRect(canvasWidth / 2, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < ecgLeads.length / 2; i++) {
        ctx.fillText(ecgLeads[ecgLeads.length / 2 + i], 15 + canvasWidth / 2, (heightPerLine * (i + 1)) + 5);
        drawEcgLine(ctx, ecgAmplitudes[ecgAmplitudes.length / 2 + i], (heightPerLine * (i + 1)), canvasWidth, factor, canvasWidth / 2);
    }
    ctx.stroke();
    ctx.closePath();
}



/**
 * This function calculates the scaling-factor of the ecg. It depends on the height of the canvas 
 * and the amount of leads included.
 * 
 * @param {double} canvasHeight the height of the canvas in px
 * @returns a number of px that represent 1 cm in the ecg
 */

const calculateEcgFactor = (canvasHeight, leadAmount) => {
    return ((canvasHeight / (leadAmount + 1)) * 0.4)
}

/**
 * Draws the ecg grid with lines every 1 mm and emphasized lines every 5 mm on the canvas.
 * TODO: change to having one part of the grid drawn on an offscreen-canvas and then use createPattern()
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {double} canvasWidth the width of the canvas in px
 * @param {double} canvasHeight the height of the canvas in px
 * @param {double} factor 1 cm of the ecg in px
 */

const drawGrid = (ctx, canvasWidth, canvasHeight, factor) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "#ffd3d3";
    drawVerticalLine(ctx, canvasWidth, canvasHeight, factor / 10);
    drawHorizontalLine(ctx, canvasWidth, canvasHeight, factor / 10);
    ctx.strokeStyle = "#ffacac";
    drawVerticalLine(ctx, canvasWidth, canvasHeight, factor / 2);
    drawHorizontalLine(ctx, canvasWidth, canvasHeight, factor / 2);
}

/**
 * Draws a grid of vertical lines with a specified spacing on the canvas.
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {double} canvasWidth the width of the canvas in px
 * @param {double} canvasHeight the height of the canvas in px
 * @param {double} spacing the space between the lines
 */

const drawVerticalLine = (ctx, canvasWidth, canvasHeight, spacing) => {
    let i = spacing;
    ctx.beginPath();
    while (i < canvasWidth) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasHeight);
        i += spacing;
    }
    ctx.closePath();
    ctx.stroke();
}

/**
 * Draws a grid of horizontal lines with a specified spacing on the canvas.
 * 
 * @param {object} ctx the context (canvas) on which to draw on
 * @param {double} canvasWidth the width of the canvas in px
 * @param {double} canvasHeight the height of the canvas in px
 * @param {double} spacing the space between the lines
 */

const drawHorizontalLine = (ctx, canvasWidth, canvasHeight, spacing) => {
    let i = spacing;
    ctx.beginPath();
    while (i < canvasHeight) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvasWidth, i);
        i += spacing;
    }
    ctx.closePath();
    ctx.stroke();
}

export { drawEcg };
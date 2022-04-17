/**
 * @file Used to calculate amplitudes of the ecg depending on the electrical axis and to determine the axis-deviation.
 * @author David Schaack
 * 
 */



/**
 * Calculates the amplitude of an ecg-lead (-1 to 1) from a given heart-axis and the degree of the lead.
 * @param {double} angle degree of the electrical axis of the heart
 * @param {double} leadDegree degree of the lead 
 * @returns amplitude as double (-1  to 1)
 */

 const calculateAmplitude = (angle, leadDegree) => {
    return (Math.cos(degToRad(angle) - degToRad(leadDegree)));
}

/**
 * Calculates the amplitudes of all ecg-leads for a given heart-axis
 * @param {double} angle degree of the electrical axis of the heart
 * @returns an array with amplitude (-1 to 1) for all leads in order [i, ii, iii, aVR, aVL, aVF]
 */

const calculateEcg = (angle) => {
    return [calculateAmplitude(angle, 0),
    calculateAmplitude(angle, 60),
    calculateAmplitude(angle, 120),
    calculateAmplitude(angle, 210),
    calculateAmplitude(angle, 330),
    calculateAmplitude(angle, 90)]
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
 * Defines which heart-axis-position (German system) is present. 
 * @param {double} degree the degree in Cabrera-circle as float
 * @returns the (German) heart-position as a string
 */

 const lagetyp = (degree) => {
    if (degree > 360 || degree < 0) {
        console.log('invalid degree');
        return 'invalid degree';
    } else if (degree >= 30 && degree < 60) {
        return 'Indifferenztyp';
    } else if (degree >= 60 && degree < 90) {
        return 'Steiltyp';
    } else if (degree >= 90 && degree < 120) {
        return 'Rechtstyp';
    } else if (degree >= 120 && degree < 180) {
        return 'Ueberdrehter Rechtstyp';
    } else if (degree >= 180 && degree < 270) {
        return 'Northwest-Typ';
    } else if (degree >= 270 && degree < 330) {
        return 'Ueberdrehter Linkstyp';
    } else if (degree >= 330 || degree < 30) {
        return 'Linkstyp';
    }
}

export { calculateEcg, lagetyp };
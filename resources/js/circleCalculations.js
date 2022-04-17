/**
 * @file Includes the functions used to calculate the angle between two positions. U
 * Used to calculate the angle between the center of the Cabrera-circle and the mouse/touchpoint.
 * @author David Schaack
 * 
 */

/**
 * Calculates the angle of the mouse or the first touchpoint compared to the center of a DOM-object.
 * @param {event} event the event which triggers the function.
 * @param {object} domOject the DOM-object which center should be used for the calculation
 */

 const mouseAngle = (event, domObject) => {

    if (event.clientX) { // clientX is only truthy in mouse-events
        let mousePosition = {
            x: event.pageX,
            y: event.pageY
        };
        return getAngle(domObject, mousePosition);
    } else { //used for touch-events
        let mousePosition = {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY
        };
        return getAngle(domObject, mousePosition);
    }
}


/**
 * Calculates the angle between the center of an element and any position.
 * Calculation works in Cabrera-circle style, meaning 0 degrees is straight right and degrees increase in clockwise fashion.
 * @param {object} domOject the DOM-object which center should be used for the calculation
 * @param pos the position
 * 
 * @returns the angle in degrees as double
 */

 const getAngle = (domObject, pos) => {
    const relativePos = getRelativePosition(domObject, pos);
    let theta = Math.atan2(relativePos.y, relativePos.x);
    theta = radToDeg(theta);
    if (theta >= 0) {
        return theta
    } else {
        return (360 + theta);
    }
}

/**
 * Finds the absolute center of an HTML-element.
 * @param {Element} e the HTML-element
 * @returns absolute center of the element as an object {x:, y:}
 */

const getAbsoluteCenter = (e) => {
    const width = e.offsetWidth;
    const height = e.offsetHeight;
    const centerX = e.offsetLeft + width / 2;
    const centerY = e.offsetTop + height / 2;
    return ({
        x: centerX,
        y: centerY
    });
}

/**
 * Finds the relative center of an HTML-element.
 * @param {Element} e the element
 * @returns relative center of the element as an object {x:, y:}
 */

const getRelativeCenter = (e) => {
    return ({
        x: e.offsetWidth / 2,
        y: e.offsetHeight / 2
    });
}


/**
 * Finds the vector between the center of an element and any absolute position. 
 * @param {Element} e the element
 * @param {object} position the position as an object {x:, y:}
 * @returns the vector
 *  as an object {x:, y:}
 */

const getRelativePosition = (e, position) => {
    const center = getAbsoluteCenter(e);
    const mouseRelativeX = position.x - center.x;
    const mouseRelativeY = position.y - center.y;
    return {
        x: mouseRelativeX,
        y: mouseRelativeY
    }
}



/**
 * Converts rad to degree.
 * @param {double} rad degree in rad
 * @returns degree as double
 */

 const radToDeg = (rad) => {
    return rad * (180 / Math.PI);
}

/**
 * Converts degree to rad.
 * @param {double} deg degree 
 * @returns rad as double
 */
const degToRad = (deg) => {
    return (deg * Math.PI / 180);
}



export { mouseAngle };
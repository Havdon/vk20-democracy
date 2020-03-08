import { getCanvas } from './utils'
import { CANVAS_OPACITY } from './config'
import initSimulation from './simulation';

function handleOnLoad() {

    const canvas = getCanvas();
    canvas.style = `
    pointer-events: none; 
    margin: 0; 
    padding: 0; 
    width: 100%; 
    height: 100%; 
    position: absolute;
    z-index: 6; opacity: ${CANVAS_OPACITY};
    `;

    let centerOn = canvas.getAttribute('data-center-on');
    if (centerOn != null) {
        let result = document.querySelector(centerOn);
        if (result == null) {
            throw new Error(`Invalid data-center-on, querySelector returns null for ${centerOn}`);
        }
        centerOn = result;
    }

    handleOnResize();
    initSimulation(canvas, centerOn);


    // Handle window resizing.
    function handleOnResize() {
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
    }
    
    window.onresize = handleOnResize;
}

window.addEventListener('load', handleOnLoad);





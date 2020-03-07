import { getCanvas } from './utils'

import initSimulation from './simulation';

function handleOnLoad() {

    const canvas = getCanvas();
    canvas.style = "margin: 0; padding: 0; width: 100%; height: 100%; position: absolute; z-index: 6; opacity: 0.2;";

    handleOnResize();
    initSimulation(canvas);


    // Handle window resizing.
    function handleOnResize() {
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
    }
    
    window.onresize = handleOnResize;
}

window.addEventListener('load', handleOnLoad);





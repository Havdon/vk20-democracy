import { getCanvas } from './utils'
import { CANVAS_OPACITY } from './config'
import initSimulation from './simulation';

window.initParliamentVisualization = function initParliamentVisualization({
    centerElement, 
    zIndex = 0,
    height = null,
    scale = 1
}) {

    if (!centerElement) {
        throw new Error(`[initParliamentVisualization] Invalid argument centerElement: ${centerElement}`)
    }

    let canvas = document.createElement('canvas');
    document.body.prepend(canvas);
    
    canvas.style = `
    pointer-events: none; 
    margin: 0; 
    padding: 0; 
    width: 100%; 
    position: absolute;
    z-index: ${zIndex}; 
    opacity: ${CANVAS_OPACITY};
    `;

    handleOnResize();
    
    

    let start = () => initSimulation(canvas, centerElement, window.innerWidth, height || window.innerHeight, scale);
    let stop = start();

    // Handle window resizing.
    let warmup = 2;
    let resizeTimeout = null;
    function handleOnResize() {
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', height || window.innerHeight);

        if (warmup <= 0) {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout)
            }
            resizeTimeout = setTimeout(() => {
                stop();
                stop = start();
            }, 200);
        } else {
            warmup--;
        }
        
    }
    
    window.onresize = handleOnResize;
    window.addEventListener('resize', handleOnResize);

    return {
        canvas,
        destroy: function() {
            stop();
            canvas.parentNode.removeChild(canvas)
            window.removeEventListener('resize', handleOnResize);
        }
    }
}






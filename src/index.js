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
    let w = 0;
    let h = 0;
    function handleOnResize() {
        console.log('resize')
        var pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, 
            document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

        let newW = window.innerWidth;
        let newH = height || pageHeight;
        if (newW != w || newH != h) {
            canvas.setAttribute('width', newW);
            canvas.setAttribute('height', newH);
            w = newW;
            h = newH;
            if (resizeTimeout) {
                clearTimeout(resizeTimeout)
            }
            resizeTimeout = setTimeout(() => {
                stop();
                stop = start();
            }, 200);
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






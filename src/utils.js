


export function getCanvas() {
    const canvas = document.getElementById('vk20-democracy-canvas');
    if (!canvas) {
        throw new Error('Cannot find canvas with id "vk20-democracy-canvas"');
    }
    if (canvas.tagName.toLowerCase() !== 'canvas') {
        throw new Error('Element with id "vk20-democracy-canvas" is not of type "canvas"');
    }
    return canvas;
}


/**
 * Starts a fixed timestep update loop.
 * @param {*} updateFn Update callback, will be called multiple times per animation frame.
 * @param {*} renderFn Render callback, will be called only once per animation frame
 */
export function startUpdateLoop(updateFn, renderFn) {
    let lastFrameTimeMs = Date.now();
    const maxFPS = 60;
    let timestep = 1000 / 60;
    let delta = 0;
    function mainLoop() {
        var timestamp = Date.now();
        // Throttle the frame rate
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            window.requestAnimationFrame(mainLoop);
            return;
        }
        delta += timestamp - lastFrameTimeMs;
        lastFrameTimeMs = timestamp;
    
        var numUpdateSteps = 0;
        while (delta >= timestep) {
            updateFn(timestep);
            delta -= timestep;
            if (++numUpdateSteps >= 240) {
                delta = 0;
                break;
            }
        }
        renderFn();
        window.requestAnimationFrame(mainLoop);
    }
    window.requestAnimationFrame(mainLoop);
}

export function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
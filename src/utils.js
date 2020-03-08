


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
        if (delta > timestep * maxFPS) {
            delta = timestep * maxFPS
        }
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
    return v0 * (1 - t) + v1 * t
}

const multiplier = Math.sqrt(3)/2;
export function drawEqTriangle(ctx, side, cx, cy, rotation = 0){
    
    var h = side * multiplier;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * 0.0174533);
    ctx.beginPath();
        
        ctx.moveTo(0, -h / 2);
        ctx.lineTo( -side / 2, h / 2);
        ctx.lineTo(side / 2, h / 2);
        ctx.lineTo(0, -h / 2);
        
        ctx.stroke();
        
    ctx.closePath();
    ctx.restore();

}

export function gaussianRand() {
    var rand = 0;

    for (var i = 0; i < 6; i += 1) {
        rand += Math.random();
    }

    return rand / 6;
}

export function gaussianRandom(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
}

export function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }



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
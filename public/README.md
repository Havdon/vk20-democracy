
## VK20 Visualization

After including the `vk20-visualization.min.js` on the website,
the `initParliamentVisualization` will be injected into the global scope.
Call this function after the page has loaded to initialize the visualization.

```
initParliamentVisualization(config)

Parameters:
    config: Object
        {
            centerElement - Element which center point the parliament should gather around
            zIndex - The z-index of the canvas (Optional, default: 0)
            height - The height of the canvas (Optional, default: window.innerHeight)
            scale - Scaling number of the simulation (Optional, default: 1)
        }

Return:
    result: Object
        {
            canvas: Element - The canvas element of the simulation
            destroy: Function - Destroys the simulation if called.
        }
```

### Example usage:
```
    window.addEventListener('load', () => {
        initParliamentVisualization({
            centerElement: document.querySelector("#the_logo_video_element"), 
            zIndex: 6
        })
    });
```

### NOTEs:
- Do not initialize the simulation of mobile devices.
- The simulation restarts if the window is resized.
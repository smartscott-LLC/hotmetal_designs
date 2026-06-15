class SandboxCore {
  constructor() {
    this.state = this._createReactiveState({});
    this.bindings = new Map(); // Tracks elements bound to data
  }

  // 1. ALPINE-LIKE REACTIVITY ENGINE
  _createReactiveState(initialData) {
    const self = this;
    return new Proxy(initialData, {
      set(target, key, value) {
        target[key] = value;
        self._updateBoundDOM(key, value); // Auto-render changes
        return true;
      }
    });
  }

  // Bind a DOM element's text directly to a state property
  bindText(element, stateKey) {
    this.bindings.set(element, { type: 'text', key: stateKey });
    element.innerText = this.state[stateKey] || '';
  }

  _updateBoundDOM(key, value) {
    for (let [element, binding] of this.bindings.entries()) {
      if (binding.key === key) {
        if (binding.type === 'text') element.innerText = value;
      }
    }
  }

  // 2. GSAP-LIKE ANIMATION ENGINE
  animate(element, targetProperties, duration = 1000) {
    const startStyles = {};
    const startTime = performance.now();

    // Capture starting points dynamically
    Object.keys(targetProperties).forEach(prop => {
      if (prop === 'x' || prop === 'y') {
        // Parse existing transform to get starting x/y
        const transform = getComputedStyle(element).transform;
        if (transform && transform !== 'none') {
          const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
          startStyles.x = match ? parseFloat(match[1]) : 0;
          startStyles.y = match ? parseFloat(match[2]) : 0;
        } else {
          startStyles[prop] = 0;
        }
      } else {
        startStyles[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
      }
    });

    const updateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let tx = null, ty = null, hasTransform = false;

      Object.keys(targetProperties).forEach(prop => {
        const start = startStyles[prop] || 0;
        const end = targetProperties[prop];
        const currentVal = start + (end - start) * progress;

        if (prop === 'opacity') {
          element.style.opacity = currentVal;
        } else if (prop === 'x') {
          tx = currentVal;
          hasTransform = true;
        } else if (prop === 'y') {
          ty = currentVal;
          hasTransform = true;
        }
      });

      if (hasTransform) {
        element.style.transform = `translate(${tx ?? 0}px, ${ty ?? 0}px)`;
      }

      if (progress < 1) {
        requestAnimationFrame(updateFrame);
      }
    };

    requestAnimationFrame(updateFrame);
  }
}

// Export a single instance to prevent global footprint bloat
export const sandbox = new SandboxCore();


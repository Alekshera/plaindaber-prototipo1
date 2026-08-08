console.log('Plaindaber prototype initialized');

window.initProgressRing = function (percentage) {
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    if (!circle) return;

    const svg = circle.ownerSVGElement;

    let gradient = document.getElementById('progressGradient');
    if (!gradient) {
        const NS = 'http://www.w3.org/2000/svg';
        gradient = document.createElementNS(NS, 'linearGradient');
        gradient.setAttribute('id', 'progressGradient');
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        gradient.setAttribute('x1', '10');
        gradient.setAttribute('y1', '110');
        gradient.setAttribute('x2', '110');
        gradient.setAttribute('y2', '10');

        const stops = [
            ['0%', '#FFB74D'],
            ['50%', '#822375'],
            ['100%', '#1A3B5C']
        ];
        stops.forEach(([offset, color]) => {
            const stop = document.createElementNS(NS, 'stop');
            stop.setAttribute('offset', offset);
            stop.setAttribute('stop-color', color);
            gradient.appendChild(stop);
        });

        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(NS, 'defs');
            svg.appendChild(defs);
        }
        defs.appendChild(gradient);
    }

    circle.style.stroke = 'url(#progressGradient)';

    const radius = parseFloat(circle.getAttribute('r')) || 50;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, percentage));
    const offset = circumference - (clamped / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    if (text) text.textContent = clamped + '%';
};

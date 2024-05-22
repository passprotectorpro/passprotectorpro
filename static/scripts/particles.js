particlesJS('particles-js', {
  particles: {
    number: {
      value: 70,
      density: { enable: true, value_area: 1000 },
    },
    color: { value: '#e3414b' },
    shape: {
      type: 'circle',
      polygon: { nb_sides: 2 },
      stroke: { width: 0, color: '#000000' },
      image: { src: 'img/github.svg', width: 90, height: 90 },
    },
    opacity: {
      value: 0.8,
      random: false,
      anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
    },
    size: {
      value: 6,
      random: false,
      anim: { enable: false, speed: 60, size_min: 0.1, sync: false },
    },
    line_linked: {
      width: 2,
      enable: true,
      opacity: 0.4,
      distance: 150,
      color: '#e3414b',
    },
    move: {
      speed: 3.5,
      enable: true,
      random: false,
      bounce: false,
      out_mode: 'out',
      straight: false,
      direction: 'none',
      attract: { enable: false, rotateX: 600, rotateY: 1200 },
    },
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'repulse' },
      onclick: { enable: true, mode: 'push' },
      resize: true,
    },
  },
  retina_detect: true,
});

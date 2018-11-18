import './styles/main.css';

const effectList = [
  { name: 'drift',    label: 'Drift',    loader: () => import(/* webpackChunkName: "swirl" */ './effects/swirl') },
  { name: 'circuit',  label: 'Circuit',  loader: () => import(/* webpackChunkName: "pipeline" */ './effects/pipeline') },
  { name: 'nebula',   label: 'Nebula',   loader: () => import(/* webpackChunkName: "shift" */ './effects/shift') },
  { name: 'vortex',   label: 'Vortex',   loader: () => import(/* webpackChunkName: "coalesce" */ './effects/coalesce') },
  { name: 'borealis', label: 'Borealis', loader: () => import(/* webpackChunkName: "aurora" */ './effects/aurora') },
];

let currentIndex = 0;
let currentCleanup = null;

const title = document.querySelector('.ui-title');
const dotsContainer = document.querySelector('.ui-dots');
const prevBtn = document.querySelector('.ui-arrow--left');
const nextBtn = document.querySelector('.ui-arrow--right');

// Build dot indicators
effectList.forEach((effect, i) => {
  const dot = document.createElement('button');
  dot.className = 'ui-dot';
  dot.setAttribute('aria-label', effect.label);
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});

function loadEffect(index) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  currentIndex = index;
  const effect = effectList[index];

  const container = document.querySelector('.content--canvas');
  container.innerHTML = '';

  effect.loader().then(mod => {
    currentCleanup = mod.init('.content--canvas');
  });

  // Update UI
  title.textContent = effect.label;
  document.querySelectorAll('.ui-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function goTo(index) {
  const wrapped = ((index % effectList.length) + effectList.length) % effectList.length;
  loadEffect(wrapped);
}

// Arrow buttons
prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

loadEffect(0);

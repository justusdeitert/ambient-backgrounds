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

const ui = document.querySelector('.ui');
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

  window.history.replaceState(null, '', `#${effect.name}`);
}

function goTo(index) {
  const wrapped = ((index % effectList.length) + effectList.length) % effectList.length;
  loadEffect(wrapped);
}

// Arrow buttons
prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
  if (e.key === 'ArrowRight') goTo(currentIndex + 1);
});

// Show UI briefly on load, then let hover take over
ui.classList.add('ui--visible');
setTimeout(() => ui.classList.remove('ui--visible'), 3000);

// Determine initial effect from hash
const hash = window.location.hash.slice(1);
const startIndex = effectList.findIndex(e => e.name === hash);
loadEffect(startIndex >= 0 ? startIndex : 0);

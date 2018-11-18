import './styles/main.css';

const effectList = [
  { name: 'drift',    label: 'Drift',    loader: () => import(/* webpackChunkName: "swirl" */ './effects/swirl') },
  { name: 'circuit',  label: 'Circuit',  loader: () => import(/* webpackChunkName: "pipeline" */ './effects/pipeline') },
  { name: 'nebula',   label: 'Nebula',   loader: () => import(/* webpackChunkName: "shift" */ './effects/shift') },
  { name: 'vortex',   label: 'Vortex',   loader: () => import(/* webpackChunkName: "coalesce" */ './effects/coalesce') },
  { name: 'borealis', label: 'Borealis', loader: () => import(/* webpackChunkName: "aurora" */ './effects/aurora') },
];

let currentCleanup = null;

function loadEffect(index) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const effect = effectList[index];

  const container = document.querySelector('.content--canvas');
  container.innerHTML = '';

  effect.loader().then(mod => {
    currentCleanup = mod.init('.content--canvas');
  });
}

loadEffect(0);

import './style.css';
import { Stage } from './engine/stage';
import { initDebug } from './engine/debug';
import { preloadImage } from './engine/assets';
import { SCENES, START_SCENE, sceneUrl, type SceneId } from './data/scenes';
import { getLang, loadLang, setLang, t, type Lang } from './data/i18n';

const stage = new Stage();
const startScreen = document.getElementById('start-screen')!;
const startText = document.getElementById('start-text')!;
const rotateText = document.getElementById('rotate-text')!;

let ready = false; // đã tải xong ảnh cảnh đầu?
let started = false;

function renderTexts(): void {
  startText.textContent = ready ? t('tapToStart') : t('loading');
  rotateText.textContent = t('rotate');
  document.documentElement.lang = getLang();
  startScreen.querySelectorAll<HTMLButtonElement>('#lang-switch button').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === getLang());
  });
}

async function boot(): Promise<void> {
  loadLang();
  startScreen.classList.add('loading');
  renderTexts();

  // Cảnh đầu: hiện ngay phía sau màn hình bắt đầu
  stage.setScene(START_SCENE);
  await preloadImage(sceneUrl(START_SCENE));
  ready = true;
  startScreen.classList.remove('loading');
  renderTexts();

  // Các cảnh còn lại tải ngầm
  (Object.keys(SCENES) as SceneId[])
    .filter((id) => id !== START_SCENE)
    .forEach((id) => void preloadImage(sceneUrl(id)));
}

startScreen.addEventListener('click', () => {
  if (!ready || started) return;
  started = true;
  startScreen.style.transition = 'opacity 0.6s';
  startScreen.style.opacity = '0';
  startScreen.style.pointerEvents = 'none';
  window.setTimeout(() => startScreen.remove(), 700);
  // Bước sau: mở khoá âm thanh và chạy đoạn thoại mở đầu ở đây.
});

startScreen.querySelectorAll<HTMLButtonElement>('#lang-switch button').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation(); // đổi ngôn ngữ không được tính là "bắt đầu"
    setLang(b.dataset.lang as Lang);
    renderTexts();
  });
});

initDebug(stage);
void boot();

import './style.css';
import { Stage } from './engine/stage';
import { initDebug } from './engine/debug';
import { preloadImage } from './engine/assets';
import { AudioPlayer } from './engine/audio';
import { Dialogue } from './engine/dialogue';
import { Inventory } from './engine/inventory';
import { Toast } from './engine/toast';
import { SCENES, START_SCENE, sceneUrl, type SceneId } from './data/scenes';
import { ITEMS, itemUrl } from './data/items';
import { INTRO } from './data/dialogue';
import { getLang, loadLang, setLang, t, type Lang } from './data/i18n';

const stage = new Stage();
const audio = new AudioPlayer();
const toast = new Toast(stage.uiLayer);
const inventory = new Inventory(stage.uiLayer);
const dialogue = new Dialogue(stage, audio);

const startScreen = document.getElementById('start-screen')!;
const startText = document.getElementById('start-text')!;
const rotateText = document.getElementById('rotate-text')!;

// ?skipintro: bỏ qua đoạn thoại mở đầu khi đang thử game
const skipIntro = new URLSearchParams(location.search).has('skipintro');

let ready = false; // đã tải xong ảnh cảnh đầu?
let started = false;

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

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

  // Các cảnh còn lại và ảnh vật phẩm tải ngầm
  (Object.keys(SCENES) as SceneId[])
    .filter((id) => id !== START_SCENE)
    .forEach((id) => void preloadImage(sceneUrl(id)));
  Object.values(ITEMS).forEach((item) => void preloadImage(itemUrl(item.id)));
}

async function startGame(): Promise<void> {
  startScreen.style.transition = 'opacity 0.6s';
  startScreen.style.opacity = '0';
  startScreen.style.pointerEvents = 'none';
  await sleep(700);
  startScreen.remove();

  if (!skipIntro) {
    await sleep(500);
    await dialogue.play(INTRO);
  }
}

startScreen.addEventListener('click', () => {
  if (!ready || started) return;
  started = true;
  void startGame();
});

startScreen.querySelectorAll<HTMLButtonElement>('#lang-switch button').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation(); // đổi ngôn ngữ không được tính là "bắt đầu"
    setLang(b.dataset.lang as Lang);
    renderTexts();
  });
});

initDebug(stage, [
  {
    label: '+ Chìa',
    run: () => {
      inventory.add('study_room_lock');
      toast.show(ITEMS.study_room_lock.name[getLang()]);
    },
  },
  { label: '− Chìa', run: () => inventory.remove('study_room_lock') },
  { label: 'Chạy mở đầu', run: () => void dialogue.play(INTRO) },
  { label: 'Thử câu tự tắt', run: () => dialogue.show('door_locked') },
]);
void boot();

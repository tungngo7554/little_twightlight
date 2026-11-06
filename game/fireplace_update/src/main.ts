import './style.css';
import { Stage } from './engine/stage';
import { initDebug } from './engine/debug';
import { preloadImage } from './engine/assets';
import { AudioPlayer } from './engine/audio';
import { Dialogue } from './engine/dialogue';
import { Inventory } from './engine/inventory';
import { Toast } from './engine/toast';
import { SCENES, HOTSPOTS, OVERLAYS, START_SCENE, sceneUrl, overlayUrl, type HotspotId, type OverlayId, type SceneId } from './data/scenes';
import { Overlay } from './engine/overlay';
import { ITEMS, itemUrl } from './data/items';
import { INTRO, HALL_FIRST_VISIT, BEDROOM_PICTURE_FIRST, BEDROOM_PICTURE_AFTER } from './data/dialogue';
import { getLang, loadLang, setLang, t, type Lang } from './data/i18n';
import { ClockPuzzle } from './engine/clock';
import { NEEDLE_URL } from './data/clockConfig';
import { SCENE_PROPS, LOGS_IN_FIREPLACE, type PropDef } from './data/props';

const stage = new Stage();
const audio = new AudioPlayer();
const toast = new Toast(stage.uiLayer);
const inventory = new Inventory(stage.uiLayer);
const dialogue = new Dialogue(stage, audio);
const overlay = new Overlay(stage, () => !dialogue.busy); // đang chạy đoạn thoại bắt buộc thì chưa đóng được

// Tên vật phẩm đang chọn, hiện ở góc trên phải cho đến khi bỏ chọn
const selectedLabel = document.createElement('div');
selectedLabel.className = 'selected-label';
stage.uiLayer.appendChild(selectedLabel);
inventory.onChange(() => {
  const id = inventory.selected;
  if (id) {
    selectedLabel.textContent = ITEMS[id].name[getLang()];
    selectedLabel.classList.add('on');
  } else {
    selectedLabel.classList.remove('on'); // giữ chữ cũ để mờ dần rồi mới biến mất
  }
});

const startScreen = document.getElementById('start-screen')!;
const startText = document.getElementById('start-text')!;
const rotateText = document.getElementById('rotate-text')!;

const params = new URLSearchParams(location.search);
// ?skipintro: bỏ qua đoạn thoại mở đầu khi đang thử game
const skipIntro = params.has('skipintro');
// ?debug: viền các vùng bấm để dễ nhìn
const debugOutline = params.has('debug');

let ready = false; // đã tải xong ảnh cảnh đầu?
let started = false;

// Trạng thái puzzle (bước 5 sẽ lưu vào localStorage)
let keyTaken = false; // đã nhặt chìa trên bàn?
let doorOpen = false; // đã mở cửa thư phòng?
let hallSeen = false; // đã vào hành lang lần đầu (câu nghĩ chỉ hiện một lần)?
let clockSolved = false; // đã chỉnh đúng giờ đồng hồ ở hành lang?
let storageKeyTaken = false; // đã lấy chìa trong đồng hồ?
let logsPlaced = 0; // số khúc gỗ đã bỏ vào lò sưởi (cần 2)
let fireLit = false; // đã đốt lửa?
let bedroomPictureSeen = false; // đã mở bức tranh phòng ngủ lần đầu (thoại chỉ chạy một lần)?

// Câu đố chỉnh kim đồng hồ (cảnh hall_clock_close)
const clock = new ClockPuzzle(stage, () => {
  clockSolved = true;
  dialogue.show('clock_click'); // "*cạch*" (kèm âm thanh khi có file)
  window.setTimeout(() => {
    if (stage.scene === 'hall_clock_close') stage.setScene('hall_clock_open_key');
  }, 900);
});
void clock;

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function renderTexts(): void {
  startText.textContent = ready ? t('tapToStart') : t('loading');
  rotateText.textContent = t('rotate');
  document.documentElement.lang = getLang();
  startScreen.querySelectorAll<HTMLButtonElement>('#lang-switch button').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === getLang());
  });
}

// ----- Vùng bấm & luật chơi -----

/** Vẽ lại các vùng bấm mỗi khi đổi cảnh. */
function renderHotspots(id: SceneId): void {
  stage.hotspotLayer.replaceChildren();
  for (const def of HOTSPOTS[id]) {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', def.label);
    el.style.position = 'absolute';
    el.style.left = `${def.rect.x}%`;
    el.style.top = `${def.rect.y}%`;
    el.style.width = `${def.rect.w}%`;
    el.style.height = `${def.rect.h}%`;
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    if (debugOutline) el.style.outline = '1px dashed rgba(255, 80, 80, 0.8)';
    el.addEventListener('click', () => onHotspot(def.id));
    stage.hotspotLayer.appendChild(el);
  }
}

/** Cảnh đồng hồ trên kệ tuỳ theo đã giải đố / đã lấy chìa chưa. */
function clockScene(): SceneId {
  if (!clockSolved) return 'hall_clock';
  return storageKeyTaken ? 'hall_clock_open' : 'hall_clock_open_key';
}

/** Cảnh quay lại khi bấm vùng "Quay lại". */
function backTarget(scene: SceneId): SceneId {
  switch (scene) {
    case 'hall_shelf':
      return 'hall_2nd';
    case 'master_bedroom':
      return 'hall_2nd';
    case 'hall_2nd_venica_room':
      return 'hall_2nd';
    case 'hall_2nd_left':
      return 'hall_2nd_venica_room';
    case 'main_hall_1st':
      return 'hall_2nd_left';
    case 'lo_suoi':
    case 'lo_suoi_sang':
      return 'main_hall_1st';
    case 'hall_shelf_close':
      return 'hall_shelf';
    case 'hall_clock':
    case 'hall_clock_open':
    case 'hall_clock_open_key':
      return 'hall_shelf_close';
    case 'hall_clock_close':
      return 'hall_clock';
    default:
      return doorOpen ? 'study_open' : 'study_locked'; // cận cảnh bàn
  }
}

/** Lớp ảnh phụ (gỗ, lửa...) nằm trên ảnh nền, dưới các vùng bấm. */
const propLayer = document.createElement('div');
Object.assign(propLayer.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
stage.hotspotLayer.parentElement!.insertBefore(propLayer, stage.hotspotLayer);

function propsFor(id: SceneId): PropDef[] {
  // Cảnh lò sưởi chưa đốt: hiện số khúc gỗ người chơi đã đặt vào
  if (id === 'lo_suoi') return LOGS_IN_FIREPLACE.slice(0, logsPlaced);
  return SCENE_PROPS[id] ?? [];
}

function renderProps(id: SceneId): void {
  propLayer.replaceChildren();
  for (const p of propsFor(id)) {
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = '';
    img.draggable = false;
    Object.assign(img.style, {
      position: 'absolute',
      left: `${p.rect.x}%`,
      top: `${p.rect.y}%`,
      width: `${p.rect.w}%`,
      height: `${p.rect.h}%`,
      objectFit: 'contain',
      transformOrigin: 'center',
      transform: `rotate(${p.rotate ?? 0}deg) scale(${p.scale ?? 1})`,
    });
    propLayer.appendChild(img);
  }
}

function fireplaceScene(): SceneId {
  return fireLit ? 'lo_suoi_sang' : 'lo_suoi';
}

function openDesk(): void {
  // Bàn còn chìa chỉ khi chưa nhặt chìa và chưa mở cửa
  stage.setScene(keyTaken || doorOpen ? 'desk_empty' : 'desk_key');
}

function onHotspot(id: HotspotId): void {
  const scene = stage.scene;
  if (!scene) return;

  // Chỉ có cửa của thư phòng đang khoá mới cần chìa đang chọn; bấm chỗ khác thì hủy chọn rồi làm việc đó.
  const isLockedDoor = id === 'door' && scene === 'study_locked';
  const selected = inventory.selected; // lấy trước khi hủy chọn, dùng cho lò sưởi
  if (!isLockedDoor) inventory.deselect();

  switch (id) {
    case 'door':
      if (scene === 'study_locked') {
        if (inventory.selected === 'study_room_lock') {
          doorOpen = true;
          inventory.consume('study_room_lock'); // chìa thư phòng không tiêu hao nên vẫn ở lại
          stage.setScene('study_open');
        } else {
          dialogue.show('door_locked');
        }
      } else if (scene === 'study_open') {
        stage.setScene('hall_2nd');
        if (!hallSeen) {
          hallSeen = true;
          void dialogue.play(HALL_FIRST_VISIT); // bấm từng câu: nghĩ → gọi "Venica?"
        }
      }
      break;

    case 'desk':
      openDesk();
      break;

    case 'hall_door':
      stage.setScene('study_open'); // cửa thư phòng đã mở nên quay lại cảnh mở
      break;

    case 'back':
      stage.setScene(backTarget(scene));
      break;

    case 'study_clock':
      dialogue.show('study_clock_time');
      break;

    case 'hall_shelf':
      stage.setScene('hall_shelf');
      break;

    case 'master_door':
      stage.setScene('master_bedroom');
      break;

    case 'venica_door':
      stage.setScene('hall_2nd_venica_room');
      break;

    case 'to_hall_left':
      stage.setScene('hall_2nd_left');
      break;

    case 'to_main_hall':
      stage.setScene('main_hall_1st');
      break;

    case 'to_fireplace':
      stage.setScene(fireplaceScene());
      break;

    case 'fireplace':
      if (scene !== 'lo_suoi') break;
      if (selected === 'wood' || selected === 'wood_2') {
        logsPlaced++;
        inventory.consume(selected); // gỗ là vật tiêu hao nên biến mất khỏi túi
        renderProps(scene); // hiện khúc gỗ vừa đặt
      } else if (selected === 'matches') {
        if (logsPlaced < 2) {
          dialogue.show('fireplace_need_wood');
        } else {
          fireLit = true;
          inventory.consume('matches');
          stage.setScene('lo_suoi_sang');
        }
      } else {
        dialogue.show('fireplace_look');
      }
      break;

    case 'bedroom_picture': {
      const first = !bedroomPictureSeen;
      bedroomPictureSeen = true;
      // Lần đầu: câu nghĩ hiện ngay; ba câu còn lại hiện sau khi người chơi thoát khỏi bức tranh
      overlay.open('bedroom_picture', first ? () => void dialogue.play(BEDROOM_PICTURE_AFTER) : undefined);
      if (first) void dialogue.play(BEDROOM_PICTURE_FIRST);
      break;
    }

    case 'shelf_zoom':
      stage.setScene('hall_shelf_close');
      break;

    case 'shelf_clock':
      stage.setScene(clockScene());
      break;

    case 'clock_face':
      stage.setScene('hall_clock_close');
      break;

    case 'storage_key':
      if (scene !== 'hall_clock_open_key') break;
      storageKeyTaken = true;
      inventory.add('storage_key');
      toast.show(ITEMS.storage_key.name[getLang()], 3000);
      stage.setScene('hall_clock_open');
      break;

    case 'book':
      dialogue.show('desk_book');
      break;
    case 'pen':
      dialogue.show('desk_pen');
      break;
    case 'globe':
      dialogue.show('desk_globe');
      break;

    case 'key':
      if (scene !== 'desk_key') break;
      keyTaken = true;
      inventory.add('study_room_lock');
      toast.show(ITEMS.study_room_lock.name[getLang()], 3000);
      stage.setScene('desk_empty');
      break;
  }
}

// Bấm ra ngoài mọi vùng bấm (và ngoài thanh vật phẩm) thì hủy chọn vật phẩm
stage.el.addEventListener('click', (e) => {
  // Dùng composedPath vì thanh vật phẩm vẽ lại ngay khi bấm, nút bị bấm đã rời khỏi trang
  const path = e.composedPath() as HTMLElement[];
  const onKeepSelection = path.some(
    (el) => el.classList && (el.classList.contains('hotspot') || el.classList.contains('inventory')),
  );
  if (onKeepSelection) return;
  inventory.deselect();
});

stage.onSceneChange(renderHotspots);
stage.onSceneChange(renderProps);

// ----- Khởi động -----

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
  void preloadImage(NEEDLE_URL);
  Object.values(SCENE_PROPS).forEach((list) => list?.forEach((p) => void preloadImage(p.img)));
  (Object.keys(OVERLAYS) as OverlayId[]).forEach((id) => void preloadImage(overlayUrl(id)));
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
  { label: '+ Chìa kho', run: () => inventory.add('storage_key') },
  {
    label: '+ Gỗ x2, Diêm',
    run: () => {
      inventory.add('wood');
      inventory.add('wood_2');
      inventory.add('matches');
    },
  },
  { label: 'Chạy mở đầu', run: () => void dialogue.play(INTRO) },
  { label: 'Thử câu tự tắt', run: () => dialogue.show('door_locked') },
]);
void boot();

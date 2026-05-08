// Масив бази
const baseData = {
  crew: [
    { icon: "fa-user-astronaut", name: "Командир Джонс", desc: "Відповідає за безпеку екіпажу та зовнішні місії.", status: "Невідомо", color: "#ff3300" },
    { icon: "fa-user-doctor", name: "Др. Адамс", desc: "Головний біолог. Досліджує зразки ґрунту.", status: "У ЛАБОРАТОРІЇ", color: "#ffcc00" },
    { icon: "fa-robot", name: "ІІ Гермес", desc: "Штучний інтелект бази. Керує системами життєзабезпечення.", status: "Працює над системою", color: "#00ff00" }
  ],
  logs: [
    { date: "Sol 1:", text: "Прибуття на Марс. Все працює." },
    { date: "Sol 15:", text: "Перші дослідження кратера. Знайдено цікаві зразки." },
    { date: "Sol 30:", text: "Підготовка до запуску. Все йде за планом." },
    { date: "Sol 35:", text: "Проблеми з насосом. Втрачаємо тиск у системі." },
    { date: "Sol 43:", text: "Сенсори зафіксували пилову бурю. Скоро почнеться." },
    { date: "Sol 45:", text: "Пилова буря. Шлюзи заблоковано. Багато чого зламалося, потрібен ремонт." }
  ],
  equipment: [
    { icon: "fa-briefcase-medical", name: "Медпак", desc: "Медичний набір." },
    { icon: "fa-fire-extinguisher", name: "Вогнегасник", desc: "Для гасіння займань." },
    { icon: "fa-walkie-talkie", name: "Рація", desc: "Система зв'язку." },
    { icon: "fa-battery-full", name: "Батарея", desc: "Резервне джерело." }
  ],
  resources: []
};
// Масив предметів
const itemsData = {
  crater: [
    { name: "Метеорит", desc: "Рідкісний уламок з іридієм.", icon: "fa-meteor" },
    { name: "Залізна руда", desc: "Корисна для деталей.", icon: "fa-gem" },
    { name: "Кристал", desc: "Невідоме утворення.", icon: "fa-gem" }
  ],
  dunes: [
    { name: "Уламок зонда", desc: "Запчастини старого марсохода.", icon: "fa-satellite" },
    { name: "Сонячна батарея", desc: "Резервне живлення.", icon: "fa-solar-panel" },
    { name: "Запчастини", desc: "Корисно для ремонту.", icon: "fa-wrench" }
  ]
};
// Масив місій 
const allMissionsPool = [
  { id: 1, title: "Ремонт насоса", reqItem: "Запчастини", desc: "Відновити тиск.", locName: "Подвір'я", screen: "surfaceScreen", top: 85, left: 45, icon: "fa-fan" },
  { id: 2, title: "Очищення панелей", reqItem: "Залізна руда", desc: "Прибрати пил.", locName: "Подвір'я", screen: "surfaceScreen", top: 40, left: 10, icon: "fa-solar-panel" },
  { id: 3, title: "Калібрування антени", reqItem: "Сонячна батарея", desc: "Налаштувати зв'язок.", locName: "Подвір'я", screen: "surfaceScreen", top: 35, left: 85, icon: "fa-satellite-dish" },
  { id: 4, title: "Перезапуск реактора", reqItem: "Метеорит", desc: "Усунути помилку.", locName: "База-2", screen: "base2Screen", top: 60, left: 50, icon: "fa-power-off" },
  { id: 5, title: "Відновлення сервера", reqItem: "Уламок зонда", desc: "Завантажити архіви.", locName: "База-2", screen: "base2Screen", top: 45, left: 75, icon: "fa-server" },
  { id: 6, title: "Тест шлюзу", reqItem: "Залізна руда", desc: "Перевірити двері.", locName: "База-2", screen: "base2Screen", top: 40, left: 25, icon: "fa-door-closed" },
  { id: 7, title: "Спектральний аналіз", reqItem: "Кристал", desc: "Просканувати породу.", locName: "Кратер", screen: "craterScreen", top: 65, left: 30, icon: "fa-wave-square" },
  { id: 8, title: "Встановлення маяка", reqItem: "Запчастини", desc: "Поставити GPS.", locName: "Кратер", screen: "craterScreen", top: 40, left: 75, icon: "fa-map-pin" }
];
// Глобальні змінні
let activeMissions = [];
let completedCount = 0;
let totalToWin = 5;

let clickSound, loadingSound, ambientSound, gatewaySound, sirenSound;
let minigameActive = false, mgPos = 0, mgDir = 1, currentTargetMissionId = null, animationFrameId;

let finalTimerInterval;
let finalTimeLeft = 5.0;
let finalEnergy = 0;
let isFinalGameActive = false;
let isSandstormActive = false;

// Завантаження гри
window.onload = () => {
  clickSound = document.getElementById("clickSound");
  loadingSound = document.getElementById("loadingSound");
  ambientSound = document.getElementById("ambientSound");
  gatewaySound = document.getElementById("gatewaySound");
  sirenSound = document.getElementById("sirenSound"); 

  if (clickSound) clickSound.volume = 0.4;
  if (loadingSound) loadingSound.volume = 0.5;
  if (ambientSound) ambientSound.volume = 0.4;
  if (gatewaySound) gatewaySound.volume = 0.5;
  if (sirenSound) sirenSound.volume = 0.4;

  if (!loadGame()) {
    generateRandomMissions();
  } else {
    let rBtn = document.getElementById("resetSaveBtn");
    if (rBtn) rBtn.style.display = "block";
  }

  renderData();
  updateProgress();

  document.getElementById("powerBtn")?.addEventListener("click", turnOn);
  document.getElementById("resetSaveBtn")?.addEventListener("click", resetSaveGame);
  document.getElementById("airlockBtn")?.addEventListener("click", goOutside);
  document.getElementById("returnBtn")?.addEventListener("click", returnInside);
  document.getElementById("leaveBase2Btn")?.addEventListener("click", leaveBase2);

  document.getElementById("finalLaunchBtn")?.addEventListener("click", startFinalGame);
  document.getElementById("pumpEnergyBtn")?.addEventListener("click", pumpEnergy);
  document.getElementById("cancelFinalBtn")?.addEventListener("click", closeFinalGame);

  document.querySelectorAll(".back-btn").forEach(btn => btn.addEventListener("click", goBack));
  document.querySelectorAll(".block").forEach(block => {
    block.addEventListener("click", function () {
      if (this.dataset.tab) openScreen(this.dataset.tab);
    });
  });

  document.getElementById("pathBase2")?.addEventListener("click", enterBase2);
  document.getElementById("pathCrater")?.addEventListener("click", () => goToLocation('crater'));
  document.getElementById("pathDunes")?.addEventListener("click", () => goToLocation('dunes'));
  document.getElementById("returnFromCraterBtn")?.addEventListener("click", returnToSurface);
  document.getElementById("returnFromDunesBtn")?.addEventListener("click", returnToSurface);

  document.getElementById("craterLoot1")?.addEventListener("click", function () { collectResource(itemsData.crater[0], this); });
  document.getElementById("craterLoot2")?.addEventListener("click", function () { collectResource(itemsData.crater[1], this); });
  document.getElementById("craterLoot3")?.addEventListener("click", function () { collectResource(itemsData.crater[2], this); });

  document.getElementById("dunesLoot1")?.addEventListener("click", function () { collectResource(itemsData.dunes[0], this); });
  document.getElementById("dunesLoot2")?.addEventListener("click", function () { collectResource(itemsData.dunes[1], this); });
  document.getElementById("dunesLoot3")?.addEventListener("click", function () { collectResource(itemsData.dunes[2], this); });

  document.getElementById("mgBtn")?.addEventListener("click", attemptMinigameFix);
  document.getElementById("mgCloseBtn")?.addEventListener("click", closeMinigame);
  document.getElementById("restartBtn")?.addEventListener("click", resetSaveGame);

  // Інтерактивний радар
  let fullMap = document.querySelector(".radarArea_full");
  if (fullMap) {
    fullMap.addEventListener("click", (e) => {
      if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }

      let rect = fullMap.getBoundingClientRect();
      let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      
      document.querySelectorAll(".point").forEach(p => {
        p.style.left = xPercent + "%";
        p.style.top = yPercent + "%";
      });
    });

    fullMap.querySelectorAll(".point1").forEach(pt => {
      pt.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("Увага! Піщана буря!");
      });
    });

    fullMap.querySelectorAll(".point2").forEach(pt => {
      pt.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("Безпечна зона! Шлюз Бази-1!");
      });
    });
  }


  let overlay = document.getElementById("transitionOverlay");
  if (overlay) {
    gsap.to(overlay, {
      opacity: 0, duration: 1.5, delay: 0.5, onComplete: () => {
        overlay.classList.remove("active");
        overlay.style.pointerEvents = "none";
      }
    });
  }

  setInterval(() => {
    let mainScr = document.getElementById("mainScreen");
    if (mainScr && Math.random() < 0.15 && !isSandstormActive && mainScr.classList.contains("active")) {
      triggerSandstorm();
    }
  }, 20000);

  setInterval(() => {
    let temp = document.getElementById("sensorTemp");
    let wind = document.getElementById("sensorWind");
    let rad = document.getElementById("sensorRad");
    let o2 = document.getElementById("sensorO2");

    let m1 = activeMissions.find(m => m.id === 1);
    let m3 = activeMissions.find(m => m.id === 3);
    let m4 = activeMissions.find(m => m.id === 4);
    let m7 = activeMissions.find(m => m.id === 7);

    if (o2) o2.innerText = (m1 && !m1.done) ? "N/A [ОФЛАЙН]" : `9${RandomNumber(0, 9)}% O2`;
    if (temp) temp.innerText = (m4 && !m4.done) ? "N/A [ОФЛАЙН]" : `-${RandomNumber(60, 66)}°C`;
    if (wind) wind.innerText = (m3 && !m3.done) ? "N/A [ОФЛАЙН]" : (isSandstormActive ? "120 м/с!" : `${RandomNumber(10, 18)} м/с`);
    if (rad) rad.innerText = (m7 && !m7.done) ? "N/A [ОФЛАЙН]" : `0.${RandomNumber(10, 15)} mSv`;
  }, 2500);
};

// Система збереження гри
function saveGame() {
  const saveData = {
    resources: baseData.resources,
    missions: activeMissions,
    completed: completedCount
  };
  localStorage.setItem("ares3_save", JSON.stringify(saveData));
}

function loadGame() {
  let saved = localStorage.getItem("ares3_save");
  if (saved) {
    let data = JSON.parse(saved);
    baseData.resources = data.resources;
    activeMissions = data.missions;
    completedCount = data.completed;
    return true;
  }
  return false;
}

function resetSaveGame() {
  localStorage.removeItem("ares3_save");
  location.reload();
}

// Функція для запуску випадкової піщаної бурі
function triggerSandstorm() {
  isSandstormActive = true;

  let airlock = document.getElementById("airlockBtn");
  if (airlock) {
    airlock.innerText = "[ ШЛЮЗ ЗАБЛОКОВАНО: БУРЯ ]";
    airlock.style.borderColor = "";
    airlock.style.color = "";
    airlock.style.animation = "";
  }

  
  if (sirenSound) {
    sirenSound.currentTime = 0;
    sirenSound.play();
  }

  alert("[СИСТЕМА]: Увага! Зафіксовано наближення потужної піщаної бурі. Зовнішні шлюзи заблоковано в цілях безпеки.");

  gsap.to("#dashboard", { x: "random(-3, 3)", y: "random(-3, 3)", duration: 0.1, repeat: 100, yoyo: true });

  setTimeout(() => {
    isSandstormActive = false;
    if (airlock) {
      airlock.innerText = "[ ШЛЮЗ: ВИХІД НА ПОВЕРХНЮ ]";
      airlock.style.borderColor = "#ff2a00";
      airlock.style.color = "#ff2a00";
      airlock.style.animation = "none";
    }

    
    if (sirenSound) {
      sirenSound.pause();
      sirenSound.currentTime = 0;
    }

    alert("[СИСТЕМА]: Буря вщухла. Шлюзи розблоковано.");
  }, 15000);
}
// Генерація випадкових місій для поточного проходження
function generateRandomMissions() {
  let shuffled = [...allMissionsPool].sort(() => 0.5 - Math.random());
  let selected = shuffled.slice(0, totalToWin);
  activeMissions = selected.map(m => ({ ...m, status: "➤", done: false }));
  saveGame();
}

// Оновлення прогресу 
function updateProgress() {
  let percentage = (completedCount / totalToWin) * 100;
  let progBar = document.getElementById("mainProgress");
  let progText = document.getElementById("progText");
  if (progBar) progBar.style.width = percentage + "%";
  if (progText) progText.innerText = Math.round(percentage) + "%";

  if (completedCount >= totalToWin) {
    let aBtn = document.getElementById("airlockBtn");
    let fBtn = document.getElementById("finalLaunchBtn");
    if (aBtn) aBtn.style.display = "none";
    if (fBtn) fBtn.style.display = "block";
  }
}
// Відображення Dashboard
function renderData() {
  document.querySelectorAll(".mission-hotspot").forEach(el => el.remove());

  let m1Mini = "", m1Full = "";
  activeMissions.forEach(m => {
    let reqText = m.done ? "" : `<br><span style="color:#ffcc00; font-size:11px;">[ПОТРІБЕН ПРЕДМЕТ: ${m.reqItem.toUpperCase()}]</span>`;
    let statusText = m.done ? `<span style="color:#00ff00;">[ВИКОНАНО]</span>` : `<span style="color:#ffcc00;">[ЛОКАЦІЯ: ${m.locName.toUpperCase()}]</span>`;

    m1Mini += `<p style="color: ${m.done ? '#00ff00' : '#ffca80'}">${m.status} ${m.title}</p>`;
    m1Full += `<div class="mission-box"><p><strong>${m.status} ${m.title}</strong><br>${m.desc} ${reqText}</p>${statusText}</div>`;

    if (!m.done) {
      let screenEl = document.getElementById(m.screen);
      if (screenEl) {
        let spot = document.createElement("div");
        spot.className = "hotspot mission-hotspot";
        spot.style.top = m.top + "%";
        spot.style.left = m.left + "%";
        spot.innerHTML = `<div class="hs-marker mission-marker"></div><p class="mission-text"><i class="fa-solid ${m.icon}"></i> ${m.title}</p>`;
        spot.addEventListener("click", () => startMinigame(m.id));
        screenEl.appendChild(spot);
      }
    }
  });

  let mMissions = document.getElementById("mini-missions");
  let fMissions = document.getElementById("full-missions");
  if (mMissions) mMissions.innerHTML = m1Mini;
  if (fMissions) fMissions.innerHTML = m1Full;

  let miniCrew = "", fullCrew = "";
  baseData.crew.forEach(c => {
    miniCrew += `
      <div class="crew-card" style="justify-content: flex-start; padding-left: 15px; gap: 15px;">
        <i class="fa-solid ${c.icon} fa-xl"></i>
        <div style="text-align: left; line-height: 1.2;">
          <span style="font-weight: bold;">${c.name}</span><br>
          <span style="font-size: 11px; color: ${c.color};">[ ${c.status} ]</span>
        </div>
      </div>`;
    fullCrew += `
      <div class="crew-card-full" style="align-items: flex-start;">
        <i class="fa-solid ${c.icon} fa-2xl" style="margin-top: 10px;"></i>
        <div style="width: 100%;">
          <p style="margin: 0; font-size: 18px;"><strong>${c.name}</strong> <span style="float: right; font-size: 14px; color: ${c.color};">[ ${c.status} ]</span></p>
          <hr style="margin: 8px 0; border-color: rgba(255, 94, 0, 0.3);">
          <p style="margin: 0; font-size: 14px;">${c.desc}</p>
        </div>
      </div>`;
  });
  let mCrew = document.getElementById("mini-crew");
  let fCrew = document.getElementById("full-crew");
  if (mCrew) mCrew.innerHTML = miniCrew;
  if (fCrew) fCrew.innerHTML = fullCrew;

  let miniLogs = "", fullLogs = "";
  if (baseData.logs.length > 0) {
    let lastLog = baseData.logs[baseData.logs.length - 1];
    miniLogs = `<p style="margin: 0; font-size: 13px; color: #ffca80;"><strong>${lastLog.date}</strong> ${lastLog.text.substring(0, 30)}...</p>`;
    baseData.logs.forEach(l => {
      fullLogs += `<p><strong>${l.date}</strong> ${l.text}</p><br>`;
    });
  }
  let mLogs = document.getElementById("mini-logs");
  let fLogs = document.getElementById("full-logs");
  if (mLogs) mLogs.innerHTML = miniLogs;
  if (fLogs) fLogs.innerHTML = fullLogs;

  let miniEquip = "", fullEquip = "";
  if (baseData.equipment && baseData.equipment.length > 0) {
    baseData.equipment.forEach(e => {
      miniEquip += `<div class="item" title="${e.name}"><i class="fa-solid ${e.icon} fa-xl"></i></div>`;
      fullEquip += `<div class="item_full"><i class="fa-solid ${e.icon} fa-2xl"></i><hr><p><strong>${e.name}</strong> - ${e.desc}</p></div>`;
    });
  }
  let miniEquipEl = document.getElementById("mini-equipment");
  let fullEquipEl = document.getElementById("full-equipment");
  if (miniEquipEl) miniEquipEl.innerHTML = miniEquip;
  if (fullEquipEl) fullEquipEl.innerHTML = fullEquip;

  let miniRes = "", fullRes = "";
  if (baseData.resources.length === 0) {
    miniRes = `<p style="font-size: 11px; text-align: center; width: 100%;">[ ПОРОЖНЬО ]</p>`;
  } else {
    baseData.resources.forEach(r => {
      miniRes += `<div class="item" title="${r.name}"><i class="fa-solid ${r.icon} fa-xl"></i></div>`;
      fullRes += `<div class="item_full"><i class="fa-solid ${r.icon} fa-2xl"></i><hr><p><strong>${r.name}</strong> - ${r.desc}</p></div>`;
    });
  }
  let mRes = document.getElementById("mini-resources");
  let fRes = document.getElementById("full-resources");
  if (mRes) mRes.innerHTML = miniRes;
  if (fRes) fRes.innerHTML = fullRes;
}
//  Мінігра
window.startMinigame = function (id) {
  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }

  let mission = activeMissions.find(m => m.id === id);
  let hasItem = baseData.resources.some(r => r.name === mission.reqItem);

  if (!hasItem) {
    alert(`[ПОМИЛКА]: Недостатньо компонентів!\nДля виконання потрібен предмет: ${mission.reqItem}.\nЗнайдіть його на локаціях і повертайтеся.`);
    return;
  }

  currentTargetMissionId = id;
  minigameActive = true;
  mgPos = 0;
  mgDir = 1.2;

  let modal = document.getElementById("minigameModal");
  modal.classList.add("active");
  gsap.fromTo(modal.querySelector(".modal-content"), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" });

  animateMinigame();
}

function animateMinigame() {
  if (!minigameActive) return;
  let slider = document.getElementById("mgSlider");
  mgPos += 1.5 * mgDir;
  if (mgPos >= 96 || mgPos <= 0) mgDir *= -1;
  if (slider) slider.style.left = mgPos + "%";
  animationFrameId = requestAnimationFrame(animateMinigame);
}

function attemptMinigameFix() {
  if (!minigameActive) return;
  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }

  let distance = Math.abs(mgPos - 50);
  let chanceOfSuccess = 0;
  let zoneName = "";

  if (distance <= 5) { chanceOfSuccess = 100; zoneName = "ЗЕЛЕНУ"; }
  else if (distance <= 20) { chanceOfSuccess = 50; zoneName = "ЖОВТУ"; }
  else { chanceOfSuccess = 10; zoneName = "ЧЕРВОНУ"; }

  let roll = RandomNumber(1, 100);
  let isSuccess = roll <= chanceOfSuccess;

  minigameActive = false;
  cancelAnimationFrame(animationFrameId);
  let modal = document.getElementById("minigameModal");
  if (modal) modal.classList.remove("active");

  if (isSuccess) {
    let mission = activeMissions.find(m => m.id === currentTargetMissionId);
    if (mission) {
      mission.done = true;
      mission.status = "✔";
      completedCount++;
      alert(`Ви зупинили сканер у ${zoneName} зоні (Шанс: ${chanceOfSuccess}%).\nРЕЗУЛЬТАТ: УСПІХ! Завдання виконано.`);

      saveGame();
      updateProgress();
      renderData();
    }
  } else {
    alert(`Ви зупинили сканер у ${zoneName} зоні (Шанс: ${chanceOfSuccess}%).\nРЕЗУЛЬТАТ: ЗБІЙ! Калібрування не вдалося, спробуйте ще раз.`);
  }
}

function closeMinigame() {
  minigameActive = false;
  cancelAnimationFrame(animationFrameId);
  let modal = document.getElementById("minigameModal");
  if (modal) modal.classList.remove("active");
}
// Мінігра перед фіналом
function startFinalGame() {
  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }
  let modal = document.getElementById("finalMinigameModal");
  if (modal) {
    modal.classList.add("active");
    gsap.fromTo(modal.querySelector(".modal-content"), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" });
  }

  finalEnergy = 0;
  finalTimeLeft = 5.0;
  isFinalGameActive = true;

  let fBar = document.getElementById("finalEnergyBar");
  let fText = document.getElementById("finalTimerText");
  if (fBar) fBar.style.width = "0%";
  if (fText) fText.innerText = `Час: 5.0с`;

  clearInterval(finalTimerInterval);
  finalTimerInterval = setInterval(() => {
    if (!isFinalGameActive) return;

    finalTimeLeft -= 0.1;
    if (fText) fText.innerText = `Час: ${Math.max(0, finalTimeLeft).toFixed(1)}с`;

    if (finalEnergy > 0) {
      finalEnergy -= 1.5;
      if (fBar) fBar.style.width = finalEnergy + "%";
    }

    if (finalTimeLeft <= 0) {
      clearInterval(finalTimerInterval);
      isFinalGameActive = false;
      alert("ЗБІЙ СИСТЕМИ! Енергія не досягла 100% вчасно. Реактор охолонув. Спробуйте ще раз.");
      closeFinalGame();
    }
  }, 100);
}

function pumpEnergy() {
  if (!isFinalGameActive) return;

  finalEnergy += 10;
  if (finalEnergy > 100) finalEnergy = 100;
  let fBar = document.getElementById("finalEnergyBar");
  if (fBar) fBar.style.width = finalEnergy + "%";

  gsap.fromTo("#finalMinigameModal .modal-content", { x: -2 }, { x: 2, duration: 0.05, yoyo: true, repeat: 1 });

  if (finalEnergy >= 100) {
    clearInterval(finalTimerInterval);
    isFinalGameActive = false;
    let modal = document.getElementById("finalMinigameModal");
    if (modal) modal.classList.remove("active");
    triggerEndingFinale();
  }
}

function closeFinalGame() {
  isFinalGameActive = false;
  clearInterval(finalTimerInterval);
  let modal = document.getElementById("finalMinigameModal");
  if (modal) modal.classList.remove("active");
}

function triggerEndingFinale() {
  if (ambientSound) { ambientSound.pause(); }
  cinematicTransition('endingScreen', null, false);
}

//Початок гри та перехід між екранами
function turnOn() {
  if (clickSound) { clickSound.play(); }
  start();
}

function start() {
  let startEl = document.getElementById("startScreen");
  let loadingEl = document.getElementById("loadingScreen");
  let mainEl = document.getElementById("mainScreen");

  if (loadingSound) loadingSound.play();
  if (ambientSound) ambientSound.play();

  if (startEl) {
    gsap.to(startEl, {
      opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => {
        startEl.classList.remove("active");
        if (loadingEl) {
          loadingEl.classList.add("active");
          gsap.fromTo(loadingEl, { opacity: 0 }, { opacity: 1, duration: 0.8 });
        }
      }
    });
  }

  let texts = ["Синхронізація...", "Перевірка систем...", "Доступ дозволено"];
  let i = 0;

  let interval = setInterval(() => {
    let textEl = document.getElementById("loadingText");
    if (textEl) {
      textEl.innerText = texts[i];
      gsap.fromTo(textEl, { opacity: 0.2, x: -5 }, { opacity: 1, x: 0, duration: 0.4 });
    }
    i++;

    if (i >= texts.length) {
      clearInterval(interval);
      setTimeout(() => {
        if (loadingEl) {
          gsap.to(loadingEl, {
            opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => {
              loadingEl.classList.remove("active");
              if (mainEl) {
                mainEl.classList.add("active");
                gsap.fromTo(mainEl, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 1.0, ease: "sine.out" });
              }
              gsap.fromTo(".block",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.2 }
              );
            }
          });
        }
      }, 1000);
    }
  }, 1200);
}

// Використання GSAP для гарних анімацій
function cinematicTransition(screenIdToShow, bgImage = null, isGateway = false) {
  if (clickSound) clickSound.play();
  if (isGateway && gatewaySound) gatewaySound.play();

  let overlay = document.getElementById("transitionOverlay");
  if (!overlay) return;

  overlay.style.pointerEvents = "all";

  gsap.to(overlay, {
    opacity: 1, duration: 1.0, ease: "sine.inOut", onComplete: () => {

      document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
      let newScreen = document.getElementById(screenIdToShow);
      if (newScreen) newScreen.classList.add("active");

      if (bgImage) document.body.style.backgroundImage = `url('${bgImage}')`;

      gsap.to(overlay, {
        opacity: 0, duration: 1.0, delay: 0.2, ease: "sine.inOut", onComplete: () => {
          overlay.style.pointerEvents = "none";
        }
      });

      if (newScreen) {
        let newElements = newScreen.querySelectorAll(".hotspot, .return-btn, .full");
        if (newElements.length > 0) {
          gsap.fromTo(newElements,
            { opacity: 0, scale: 0.95, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.4 }
          );
        }
      }
    }
  });
}

function openScreen(name) {
  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }
  let screenId = name + "Screen";
  let screen = document.getElementById(screenId);
  if (!screen) return;

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");

  let fullWindow = screen.querySelector(".full");
  if (fullWindow) {
    gsap.fromTo(fullWindow, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
  }
}

function goBack() {
  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  let mainEl = document.getElementById("mainScreen");
  if (mainEl) {
    mainEl.classList.add("active");
    gsap.fromTo(mainEl, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
  }
}
// Логіка переходу між локаціями
function goOutside() {
  if (isSandstormActive) {
    alert("[ПОМИЛКА]: Шлюзи заблоковані через піщану бурю!");
    return;
  }
  cinematicTransition('surfaceScreen', 'images/Yard.png', true);
}
function returnInside() { cinematicTransition('mainScreen', 'images/Base.png', true); }
function enterBase2() { cinematicTransition('base2Screen', 'images/Base2.png', true); }
function leaveBase2() { cinematicTransition('surfaceScreen', 'images/Yard.png', true); }
function returnToSurface() { cinematicTransition('surfaceScreen', 'images/Yard.png', false); }

function goToLocation(loc) {
  if (loc === 'crater') cinematicTransition('craterScreen', 'images/Crater.png', false);
  else if (loc === 'dunes') cinematicTransition('dunesScreen', 'images/Dunes.png', false);
}

function RandomNumber(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
// Логіка збору ресурсів на локаціях, додавання їх до інвентарю та оновлення даних гри
function collectResource(resourceObj, element) {
  if (clickSound) { clickSound.play(); }

  gsap.to(element, {
    y: -30, opacity: 0, scale: 0.8, duration: 0.6, ease: "power2.out", onComplete: () => {
      element.style.display = 'none';
    }
  });

  baseData.resources.push({ icon: resourceObj.icon, name: resourceObj.name, desc: resourceObj.desc });

  saveGame();
  renderData();

  setTimeout(() => { alert(`[СИСТЕМА ШОЛОМА]: Знайдено об'єкт "${resourceObj.name}".`); }, 500);
}

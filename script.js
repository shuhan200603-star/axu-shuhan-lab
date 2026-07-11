const themeToggle = document.querySelector("#themeToggle");
const themeIcon = themeToggle.querySelector("span");
const themeLabel = themeToggle.querySelector(".theme-label");
const dateText = document.querySelector("#dateText");
const timeText = document.querySelector("#timeText");
const greeting = document.querySelector("#greeting");
const experimentText = document.querySelector("#experimentText");
const shuffleExperiment = document.querySelector("#shuffleExperiment");
const noteForm = document.querySelector("#noteForm");
const noteInput = document.querySelector("#noteInput");
const characterCount = document.querySelector("#characterCount");
const notesGrid = document.querySelector("#notesGrid");
const installApp = document.querySelector("#installApp");
const themeColor = document.querySelector('meta[name="theme-color"]');
let deferredInstallPrompt = null;

const experiments = [
  "把一个小小的想法，认真做成可以看见的东西。",
  "收集三件今天让人心情变好的小事。",
  "给未来的实验室留下一张温柔的便签。",
  "学会一个新东西，然后用自己的话讲出来。",
  "允许今天的计划里，出现一点意料之外的快乐。",
  "把喜欢的颜色、句子和瞬间放在同一个角落。",
];

const notesKey = "axu-shuhan-lab-notes";
let notes = JSON.parse(localStorage.getItem(notesKey) || "[]");

function updateClock() {
  const now = new Date();
  const hour = now.getHours();

  dateText.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  timeText.textContent = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  if (hour < 6) greeting.textContent = "夜深了，灵感也要轻轻说话。";
  else if (hour < 11) greeting.textContent = "早上好，今天也要温柔地探索。";
  else if (hour < 14) greeting.textContent = "中午好，先照顾好自己再出发。";
  else if (hour < 18) greeting.textContent = "下午好，新的发现正在路上。";
  else greeting.textContent = "晚上好，实验室为你留了一盏灯。";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isNight = theme === "night";
  themeIcon.textContent = isNight ? "☀" : "☾";
  themeLabel.textContent = isNight ? "白天" : "夜晚";
  themeToggle.setAttribute("aria-label", `切换${isNight ? "白天" : "夜晚"}主题`);
  themeColor.content = isNight ? "#242322" : "#f5f0ea";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "night" ? "day" : "night";
  localStorage.setItem("axu-shuhan-lab-theme", nextTheme);
  applyTheme(nextTheme);
});

shuffleExperiment.addEventListener("click", () => {
  const currentIndex = experiments.indexOf(experimentText.textContent);
  const nextIndex = (currentIndex + 1 + Math.floor(Math.random() * (experiments.length - 1))) % experiments.length;
  experimentText.textContent = experiments[nextIndex];
});

function saveNotes() {
  localStorage.setItem(notesKey, JSON.stringify(notes));
}

function formatNoteDate(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function renderNotes() {
  notesGrid.replaceChildren();

  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-notes";
    empty.textContent = "便签墙还是空的。第一张，写给此刻吧。";
    notesGrid.append(empty);
    return;
  }

  notes.forEach((note) => {
    const card = document.createElement("article");
    card.className = "sticky-note";

    const content = document.createElement("p");
    content.textContent = note.content;

    const time = document.createElement("time");
    time.dateTime = new Date(note.createdAt).toISOString();
    time.textContent = formatNoteDate(note.createdAt);

    const removeButton = document.createElement("button");
    removeButton.className = "delete-note";
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", "删除这张便签");
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      notes = notes.filter((item) => item.id !== note.id);
      saveNotes();
      renderNotes();
    });

    card.append(content, time, removeButton);
    notesGrid.append(card);
  });
}

noteInput.addEventListener("input", () => {
  characterCount.textContent = noteInput.value.length;
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const content = noteInput.value.trim();
  if (!content) return;

  notes.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    content,
    createdAt: Date.now(),
  });

  notes = notes.slice(0, 12);
  saveNotes();
  renderNotes();
  noteForm.reset();
  characterCount.textContent = "0";
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installApp.hidden = false;
});

installApp.addEventListener("click", async () => {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installApp.hidden = true;
    return;
  }

  if (isIOS) {
    window.alert("请用 Safari 打开实验室，点击底部的“分享”按钮，再选择“添加到主屏幕”。");
  }
});

window.addEventListener("appinstalled", () => {
  installApp.hidden = true;
});

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
if (isIOS && !isStandalone) installApp.hidden = false;

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // 页面仍可正常使用，离线能力会在下次访问时重试注册。
    });
  });
}

const savedTheme = localStorage.getItem("axu-shuhan-lab-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
applyTheme(savedTheme || preferredTheme);
updateClock();
renderNotes();
setInterval(updateClock, 30_000);

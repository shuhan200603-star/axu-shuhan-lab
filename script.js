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
const appViews = [...document.querySelectorAll(".app-view")];
const navItems = [...document.querySelectorAll(".bottom-nav-item")];
const diaryForm = document.querySelector("#diaryForm");
const diaryDate = document.querySelector("#diaryDate");
const diaryInput = document.querySelector("#diaryInput");
const diaryCharacterCount = document.querySelector("#diaryCharacterCount");
const diarySubmitLabel = document.querySelector("#diarySubmitLabel");
const deleteDiary = document.querySelector("#deleteDiary");
const diaryCount = document.querySelector("#diaryCount");
const diaryList = document.querySelector("#diaryList");
const exportData = document.querySelector("#exportData");
const chooseImport = document.querySelector("#chooseImport");
const importFile = document.querySelector("#importFile");
const backupStatus = document.querySelector("#backupStatus");
const importDialog = document.querySelector("#importDialog");
const importSummary = document.querySelector("#importSummary");
const mergeImport = document.querySelector("#mergeImport");
const overwriteImport = document.querySelector("#overwriteImport");
const cancelImport = document.querySelector("#cancelImport");
const moodInputs = [...document.querySelectorAll('input[name="mood"]')];
const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const previousMonth = document.querySelector("#previousMonth");
const nextMonth = document.querySelector("#nextMonth");
const openSearch = document.querySelector("#openSearch");
const searchDialog = document.querySelector("#searchDialog");
const closeSearch = document.querySelector("#closeSearch");
const searchInput = document.querySelector("#searchInput");
const searchHint = document.querySelector("#searchHint");
const searchResults = document.querySelector("#searchResults");

const notesKey = "axu-shuhan-lab-notes";
const diariesKey = "axu-shuhan-lab-diaries";
const backupAppId = "axu-shuhan-lab";
const validViews = new Set(["home", "notes", "diary"]);
const moods = {
  happy: { emoji: "😊", label: "开心" },
  calm: { emoji: "🌿", label: "平静" },
  excited: { emoji: "✨", label: "期待" },
  tired: { emoji: "🥱", label: "疲惫" },
  sad: { emoji: "🌧️", label: "低落" },
};

let deferredInstallPrompt = null;
let pendingImport = null;
let backupStatusTimer = null;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const experiments = [
  "把一个小小的想法，认真做成可以看见的东西。",
  "收集三件今天让人心情变好的小事。",
  "给未来的实验室留下一张温柔的便签。",
  "学会一个新东西，然后用自己的话讲出来。",
  "允许今天的计划里，出现一点意料之外的快乐。",
  "把喜欢的颜色、句子和瞬间放在同一个角落。",
];

function readStoredArray(key) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return [];

  try {
    const value = JSON.parse(rawValue);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

let notes = readStoredArray(notesKey);
let diaries = readStoredArray(diariesKey);

function saveNotes() {
  localStorage.setItem(notesKey, JSON.stringify(notes));
}

function saveDiaries() {
  localStorage.setItem(diariesKey, JSON.stringify(diaries));
}

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDiaryDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(year, month - 1, day));
}

function dateFromValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function setDiaryMood(mood) {
  moodInputs.forEach((input) => {
    input.checked = input.value === mood;
  });
}

function selectedMood() {
  return moodInputs.find((input) => input.checked)?.value || null;
}

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

function showView(target, updateLocation = true) {
  const nextView = validViews.has(target) ? target : "home";

  appViews.forEach((view) => {
    view.hidden = view.dataset.view !== nextView;
  });

  navItems.forEach((item) => {
    const isActive = item.dataset.target === nextView;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });

  if (updateLocation) history.replaceState(null, "", `#${nextView}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatNoteDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "日期未知";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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
    card.dataset.noteId = String(note.id);

    const content = document.createElement("p");
    content.textContent = note.content;

    const time = document.createElement("time");
    const noteDate = new Date(note.createdAt);
    if (!Number.isNaN(noteDate.getTime())) time.dateTime = noteDate.toISOString();
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

function selectedDiary() {
  return diaries.find((entry) => entry.date === diaryDate.value);
}

function loadDiaryForDate() {
  const entry = selectedDiary();
  diaryInput.value = entry?.content || "";
  setDiaryMood(entry?.mood || null);
  diaryCharacterCount.textContent = String(diaryInput.value.length);
  diarySubmitLabel.textContent = entry ? "保存修改" : "保存日记";
  deleteDiary.hidden = !entry;
  const selectedDate = dateFromValue(diaryDate.value);
  calendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderCalendar();
  renderDiaryList();
}

function renderCalendar() {
  calendarGrid.replaceChildren();
  calendarTitle.textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(calendarMonth);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);
  const today = localDateValue();
  const diaryDates = new Set(diaries.map((entry) => entry.date));

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const value = localDateValue(date);
    const button = document.createElement("button");
    button.className = "calendar-day";
    button.classList.toggle("is-outside", date.getMonth() !== month);
    button.classList.toggle("is-today", value === today);
    button.classList.toggle("is-selected", value === diaryDate.value);
    button.classList.toggle("has-diary", diaryDates.has(value));
    button.type = "button";
    button.textContent = String(date.getDate());
    button.setAttribute("aria-label", `${formatDiaryDate(value)}${diaryDates.has(value) ? "，有日记" : ""}`);
    button.addEventListener("click", () => {
      diaryDate.value = value;
      loadDiaryForDate();
      diaryInput.focus();
    });
    calendarGrid.append(button);
  }
}

function renderDiaryList() {
  diaryList.replaceChildren();
  const sortedDiaries = [...diaries].sort((a, b) => b.date.localeCompare(a.date));
  diaryCount.textContent = `${diaries.length} 篇`;

  if (sortedDiaries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-diaries";
    empty.textContent = "还没有写过日记。\n今天就是很好的第一页。";
    diaryList.append(empty);
    return;
  }

  sortedDiaries.forEach((entry) => {
    const button = document.createElement("button");
    button.className = "diary-list-item";
    button.classList.toggle("is-selected", entry.date === diaryDate.value);
    button.type = "button";

    const dateRow = document.createElement("span");
    dateRow.className = "diary-list-date";
    const date = document.createElement("strong");
    date.textContent = formatDiaryDate(entry.date);
    dateRow.append(date);

    if (moods[entry.mood]) {
      const mood = document.createElement("span");
      mood.className = "diary-list-mood";
      mood.textContent = moods[entry.mood].emoji;
      mood.setAttribute("aria-label", moods[entry.mood].label);
      dateRow.append(mood);
    }

    const preview = document.createElement("span");
    preview.textContent = entry.content.replace(/\s+/g, " ").trim() || "（空白日记）";

    button.append(dateRow, preview);
    button.addEventListener("click", () => {
      diaryDate.value = entry.date;
      loadDiaryForDate();
      diaryInput.focus();
    });
    diaryList.append(button);
  });
}

function appendHighlightedText(container, text, query) {
  const normalizedText = text.toLocaleLowerCase("zh-CN");
  const normalizedQuery = query.toLocaleLowerCase("zh-CN");
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(normalizedQuery);

  while (matchIndex >= 0) {
    container.append(document.createTextNode(text.slice(cursor, matchIndex)));
    const mark = document.createElement("mark");
    mark.textContent = text.slice(matchIndex, matchIndex + query.length);
    container.append(mark);
    cursor = matchIndex + query.length;
    matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
  }

  container.append(document.createTextNode(text.slice(cursor)));
}

function closeSearchDialog() {
  searchDialog.hidden = true;
  openSearch.focus();
}

function openSearchDialog() {
  searchDialog.hidden = false;
  searchInput.focus();
  renderSearchResults(searchInput.value);
}

function renderSearchResults(rawQuery) {
  const query = rawQuery.trim();
  searchResults.replaceChildren();

  if (!query) {
    searchHint.textContent = "输入关键词，就能从便签和日记中一起寻找。";
    return;
  }

  const normalizedQuery = query.toLocaleLowerCase("zh-CN");
  const noteMatches = notes
    .filter((note) => String(note.content || "").toLocaleLowerCase("zh-CN").includes(normalizedQuery))
    .map((note) => ({
      type: "note",
      id: String(note.id),
      content: String(note.content),
      sortValue: Number(note.createdAt) || 0,
      label: `便签 · ${formatNoteDate(note.createdAt)}`,
    }));
  const diaryMatches = diaries
    .filter((entry) => String(entry.content || "").toLocaleLowerCase("zh-CN").includes(normalizedQuery))
    .map((entry) => ({
      type: "diary",
      date: entry.date,
      content: String(entry.content),
      mood: entry.mood,
      sortValue: dateFromValue(entry.date).getTime(),
      label: `日记 · ${formatDiaryDate(entry.date)}`,
    }));
  const matches = [...noteMatches, ...diaryMatches].sort((a, b) => b.sortValue - a.sortValue).slice(0, 30);
  searchHint.textContent = matches.length > 0 ? `找到 ${matches.length} 条记录。` : "没有找到相关记录，换个词试试吧。";

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-search";
    empty.textContent = "这段文字还没有出现在实验室里。\n也许它正等着被写下来。";
    searchResults.append(empty);
    return;
  }

  matches.forEach((result) => {
    const button = document.createElement("button");
    button.className = "search-result";
    button.type = "button";

    const meta = document.createElement("span");
    meta.className = "search-result-meta";
    const label = document.createElement("span");
    label.textContent = result.label;
    const mood = document.createElement("span");
    mood.textContent = moods[result.mood]?.emoji || (result.type === "note" ? "▱" : "□");
    meta.append(label, mood);

    const preview = document.createElement("p");
    appendHighlightedText(preview, result.content.replace(/\s+/g, " ").trim(), query);
    button.append(meta, preview);

    button.addEventListener("click", () => {
      closeSearchDialog();
      if (result.type === "diary") {
        diaryDate.value = result.date;
        loadDiaryForDate();
        showView("diary");
        window.setTimeout(() => diaryInput.focus(), 250);
      } else {
        showView("notes");
        window.setTimeout(() => {
          document.querySelector(`[data-note-id="${CSS.escape(result.id)}"]`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 250);
      }
    });
    searchResults.append(button);
  });
}

function setBackupStatus(message, isError = false) {
  window.clearTimeout(backupStatusTimer);
  backupStatus.textContent = message;
  backupStatus.style.color = isError ? "#b05f55" : "var(--sage)";
  backupStatusTimer = window.setTimeout(() => {
    backupStatus.textContent = "";
  }, 6000);
}

function validDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function validateBackup(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("文件内容不是有效的备份对象。 ");
  }
  if (data.app !== backupAppId || data.version !== 1) {
    throw new Error("这不是当前实验室支持的备份版本。 ");
  }
  if (!Array.isArray(data.notes) || !Array.isArray(data.diaries)) {
    throw new Error("备份中缺少便签或日记数据。 ");
  }

  const cleanNotes = data.notes.map((note, index) => {
    if (!note || typeof note !== "object" || typeof note.content !== "string") {
      throw new Error(`第 ${index + 1} 张便签格式不正确。`);
    }
    const createdAt = Number(note.createdAt);
    if (!Number.isFinite(createdAt)) throw new Error(`第 ${index + 1} 张便签日期不正确。`);
    return {
      id: String(note.id || `imported-${createdAt}-${index}`),
      content: note.content,
      createdAt,
    };
  });

  const cleanDiaries = data.diaries.map((entry, index) => {
    if (!entry || typeof entry !== "object" || !validDateString(entry.date) || typeof entry.content !== "string") {
      throw new Error(`第 ${index + 1} 篇日记格式不正确。`);
    }
    const updatedAt = Number(entry.updatedAt);
    if (!Number.isFinite(updatedAt)) throw new Error(`第 ${index + 1} 篇日记更新时间不正确。`);
    const mood = typeof entry.mood === "string" && moods[entry.mood] ? entry.mood : null;
    return mood
      ? { date: entry.date, content: entry.content, updatedAt, mood }
      : { date: entry.date, content: entry.content, updatedAt };
  });

  return { notes: cleanNotes, diaries: cleanDiaries };
}

function closeImportDialog() {
  importDialog.hidden = true;
  pendingImport = null;
  importFile.value = "";
  chooseImport.focus();
}

function openImportDialog(data) {
  pendingImport = data;
  importSummary.textContent = `文件中有 ${data.notes.length} 张便签和 ${data.diaries.length} 篇日记。请选择合并或覆盖；取消不会修改任何内容。`;
  importDialog.hidden = false;
  mergeImport.focus();
}

function applyImportedData(mode) {
  if (!pendingImport) return;

  if (mode === "overwrite") {
    notes = pendingImport.notes;
    diaries = pendingImport.diaries;
  } else {
    const existingNoteIds = new Set(notes.map((note) => String(note.id)));
    const newNotes = pendingImport.notes.filter((note) => !existingNoteIds.has(String(note.id)));
    const existingDiaryDates = new Set(diaries.map((entry) => entry.date));
    const newDiaries = pendingImport.diaries.filter((entry) => !existingDiaryDates.has(entry.date));
    notes = [...notes, ...newNotes];
    diaries = [...diaries, ...newDiaries];
  }

  saveNotes();
  saveDiaries();
  renderNotes();
  loadDiaryForDate();
  const action = mode === "overwrite" ? "覆盖" : "合并";
  const noteTotal = notes.length;
  const diaryTotal = diaries.length;
  closeImportDialog();
  setBackupStatus(`${action}完成：现在共有 ${noteTotal} 张便签、${diaryTotal} 篇日记。`);
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

navItems.forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.target));
});

openSearch.addEventListener("click", openSearchDialog);
closeSearch.addEventListener("click", closeSearchDialog);
document.querySelector("[data-close-search]").addEventListener("click", closeSearchDialog);
searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));

window.addEventListener("hashchange", () => {
  showView(location.hash.slice(1), false);
});

noteInput.addEventListener("input", () => {
  characterCount.textContent = String(noteInput.value.length);
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

diaryDate.addEventListener("change", loadDiaryForDate);

previousMonth.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  renderCalendar();
});

diaryInput.addEventListener("input", () => {
  diaryCharacterCount.textContent = String(diaryInput.value.length);
});

diaryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = diaryDate.value;
  const content = diaryInput.value.trim();
  if (!date || !content) return;

  const existingIndex = diaries.findIndex((entry) => entry.date === date);
  const mood = selectedMood();
  const entry = mood ? { date, content, updatedAt: Date.now(), mood } : { date, content, updatedAt: Date.now() };
  if (existingIndex >= 0) diaries.splice(existingIndex, 1, entry);
  else diaries.push(entry);

  saveDiaries();
  loadDiaryForDate();
  setBackupStatus(existingIndex >= 0 ? "这篇日记已经更新。" : "这一天已经收进日记里。 ");
});

deleteDiary.addEventListener("click", () => {
  const entry = selectedDiary();
  if (!entry) return;
  if (!window.confirm(`确定删除 ${formatDiaryDate(entry.date)} 的日记吗？这个操作无法撤销。`)) return;
  diaries = diaries.filter((item) => item.date !== entry.date);
  saveDiaries();
  loadDiaryForDate();
  setBackupStatus("日记已删除。 ");
});

exportData.addEventListener("click", () => {
  const backup = {
    app: backupAppId,
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
    diaries,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `axu-shuhan-lab-backup-${localDateValue()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  setBackupStatus(`已导出 ${notes.length} 张便签和 ${diaries.length} 篇日记。`);
});

chooseImport.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const [file] = importFile.files;
  if (!file) return;

  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("备份文件超过 5 MB，请确认是否选错了文件。 ");
    const parsed = JSON.parse(await file.text());
    openImportDialog(validateBackup(parsed));
  } catch (error) {
    importFile.value = "";
    setBackupStatus(`无法导入：${error.message || "文件格式不正确。"}`, true);
  }
});

mergeImport.addEventListener("click", () => applyImportedData("merge"));
overwriteImport.addEventListener("click", () => applyImportedData("overwrite"));
cancelImport.addEventListener("click", closeImportDialog);
document.querySelector("[data-close-import]").addEventListener("click", closeImportDialog);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !importDialog.hidden) closeImportDialog();
  if (event.key === "Escape" && !searchDialog.hidden) closeSearchDialog();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installApp.hidden = false;
});

installApp.addEventListener("click", async () => {
  const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installApp.hidden = true;
    return;
  }

  if (isIOSDevice) {
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
diaryDate.value = localDateValue();
applyTheme(savedTheme || preferredTheme);
updateClock();
renderNotes();
loadDiaryForDate();
showView(location.hash.slice(1), false);
setInterval(updateClock, 30_000);

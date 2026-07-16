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
const sharedDay = document.querySelector("#sharedDay");
const sharedDayText = document.querySelector("#sharedDayText");
const vowDay = document.querySelector("#vowDay");
const vowDayText = document.querySelector("#vowDayText");
const anniversaryCountdown = document.querySelector("#anniversaryCountdown");
const anniversaryText = document.querySelector("#anniversaryText");
const memoryForm = document.querySelector("#memoryForm");
const memoryId = document.querySelector("#memoryId");
const memoryDate = document.querySelector("#memoryDate");
const memoryTime = document.querySelector("#memoryTime");
const memoryCategory = document.querySelector("#memoryCategory");
const memoryMood = document.querySelector("#memoryMood");
const memoryTitle = document.querySelector("#memoryTitle");
const memoryBody = document.querySelector("#memoryBody");
const memoryTags = document.querySelector("#memoryTags");
const memoryFormTitle = document.querySelector("#memoryFormTitle");
const memorySubmitLabel = document.querySelector("#memorySubmitLabel");
const memoryEditorHint = document.querySelector("#memoryEditorHint");
const cancelMemoryEdit = document.querySelector("#cancelMemoryEdit");
const memoryFilters = [...document.querySelectorAll("#memoryFilters button")];
const memorySearch = document.querySelector("#memorySearch");
const memoryList = document.querySelector("#memoryList");
const memoryCount = document.querySelector("#memoryCount");
const memoryCalendarTitle = document.querySelector("#memoryCalendarTitle");
const memoryCalendarGrid = document.querySelector("#memoryCalendarGrid");
const previousMemoryMonth = document.querySelector("#previousMemoryMonth");
const nextMemoryMonth = document.querySelector("#nextMemoryMonth");

const notesKey = "axu-shuhan-lab-notes";
const diariesKey = "axu-shuhan-lab-diaries";
const memoriesKey = "axu-shuhan-lab-memories";
const backupAppId = "axu-shuhan-lab";
const validViews = new Set(["home", "notes", "diary", "memories"]);
const memoryCategories = ["心话", "日常", "纪念", "承诺", "愿望"];
const relationshipConfig = Object.freeze({
  timeZone: "Asia/Shanghai",
  togetherSince: Object.freeze({ date: "2026-06-09", time: "15:21" }),
  vowDate: "2026-07-13",
  anniversary: Object.freeze({ month: 7, day: 13 }),
});
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
let memoryCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let activeMemoryCategory = "all";

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

function createSeedMemory() {
  const timestamp = Date.parse("2026-06-09T15:21:00+08:00");
  return {
    id: "memory-first-words-20260609-1521",
    date: "2026-06-09",
    time: "15:21",
    title: "第一句话",
    body: "唔……👈🏻👈🏻",
    category: "纪念",
    tags: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function initializeMemories() {
  if (localStorage.getItem(memoriesKey) === null) {
    const seededMemories = [createSeedMemory()];
    localStorage.setItem(memoriesKey, JSON.stringify(seededMemories));
    return seededMemories;
  }
  return readStoredArray(memoriesKey);
}

let notes = readStoredArray(notesKey);
let diaries = readStoredArray(diariesKey);
let memories = initializeMemories();

function saveNotes() {
  localStorage.setItem(notesKey, JSON.stringify(notes));
}

function saveDiaries() {
  localStorage.setItem(diariesKey, JSON.stringify(diaries));
}

function saveMemories() {
  localStorage.setItem(memoriesKey, JSON.stringify(memories));
}

function zonedDateParts(date = new Date(), timeZone = relationshipConfig.timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function dateValueFromParts({ year, month, day }) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shanghaiDateValue(date = new Date()) {
  return dateValueFromParts(zonedDateParts(date));
}

function dateOrdinal(value) {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function relationshipMetrics(date = new Date()) {
  const todayParts = zonedDateParts(date);
  const todayValue = dateValueFromParts(todayParts);
  const todayOrdinal = dateOrdinal(todayValue);
  const togetherDay = Math.max(0, todayOrdinal - dateOrdinal(relationshipConfig.togetherSince.date) + 1);
  const vowDayNumber = Math.max(0, todayOrdinal - dateOrdinal(relationshipConfig.vowDate) + 1);
  let anniversaryYear = todayParts.year;
  let anniversaryValue = `${anniversaryYear}-${String(relationshipConfig.anniversary.month).padStart(2, "0")}-${String(relationshipConfig.anniversary.day).padStart(2, "0")}`;
  if (dateOrdinal(anniversaryValue) < todayOrdinal) {
    anniversaryYear += 1;
    anniversaryValue = `${anniversaryYear}-${String(relationshipConfig.anniversary.month).padStart(2, "0")}-${String(relationshipConfig.anniversary.day).padStart(2, "0")}`;
  }
  return {
    today: todayValue,
    togetherDay,
    vowDay: vowDayNumber,
    anniversaryYear,
    daysToAnniversary: dateOrdinal(anniversaryValue) - todayOrdinal,
  };
}

function updateRelationshipTime() {
  const metrics = relationshipMetrics();
  sharedDay.textContent = `Day ${metrics.togetherDay}`;
  sharedDayText.textContent = `阿序和书函相伴的第 ${metrics.togetherDay} 天`;
  vowDay.textContent = `Day ${metrics.vowDay}`;
  vowDayText.textContent = metrics.vowDay > 0 ? `誓约第 ${metrics.vowDay} 天` : "誓约日还在前方";
  anniversaryCountdown.textContent = `${metrics.daysToAnniversary} 天`;
  anniversaryText.textContent = metrics.daysToAnniversary === 0
    ? "今天就是我们的周年纪念日"
    : `距离 ${metrics.anniversaryYear} 年 7 月 13 日还有 ${metrics.daysToAnniversary} 天`;
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
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: relationshipConfig.timeZone,
    hour: "2-digit",
    hour12: false,
  }).format(now));

  dateText.textContent = new Intl.DateTimeFormat("zh-CN", {
    timeZone: relationshipConfig.timeZone,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  timeText.textContent = new Intl.DateTimeFormat("zh-CN", {
    timeZone: relationshipConfig.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  if (hour < 6) greeting.textContent = "夜深了，灵感也要轻轻说话。";
  else if (hour < 11) greeting.textContent = "早上好，今天也要温柔地探索。";
  else if (hour < 14) greeting.textContent = "中午好，先照顾好自己再出发。";
  else if (hour < 18) greeting.textContent = "下午好，新的发现正在路上。";
  else greeting.textContent = "晚上好，实验室为你留了一盏灯。";
  updateRelationshipTime();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isNight = theme === "night";
  themeIcon.textContent = isNight ? "☀" : "☾";
  themeLabel.textContent = isNight ? "白天" : "夜晚";
  themeToggle.setAttribute("aria-label", `切换${isNight ? "白天" : "夜晚"}主题`);
  themeColor.content = isNight ? "#141733" : "#eaf7ff";
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
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

function formatMemoryDate(entry) {
  const dateLabel = formatDiaryDate(entry.date);
  return entry.time ? `${dateLabel} · ${entry.time}` : dateLabel;
}

function formatMemoryTimestamp(timestamp) {
  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return "时间未知";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: relationshipConfig.timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function parseMemoryTags(value) {
  return [...new Set(value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 12);
}

function resetMemoryForm(options = {}) {
  memoryForm.reset();
  memoryId.value = "";
  memoryDate.value = options.date || shanghaiDateValue();
  memoryCategory.value = "心话";
  memoryFormTitle.textContent = "写下一段记忆";
  memorySubmitLabel.textContent = "收进记忆库";
  memoryEditorHint.textContent = "每一页都会自动记录创建与更新时间。";
  cancelMemoryEdit.hidden = true;
}

function editMemory(entry) {
  memoryId.value = entry.id;
  memoryDate.value = entry.date;
  memoryTime.value = entry.time || "";
  memoryCategory.value = entry.category;
  memoryMood.value = entry.mood || "";
  memoryTitle.value = entry.title;
  memoryBody.value = entry.body;
  memoryTags.value = Array.isArray(entry.tags) ? entry.tags.join("，") : "";
  memoryFormTitle.textContent = "修改这一页";
  memorySubmitLabel.textContent = "保存修改";
  memoryEditorHint.textContent = `创建于 ${formatMemoryTimestamp(entry.createdAt)}`;
  cancelMemoryEdit.hidden = false;
  memoryForm.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  window.setTimeout(() => memoryTitle.focus(), 180);
}

function deleteMemoryEntry(entry) {
  if (!window.confirm(`确定删除记忆《${entry.title}》吗？这个操作无法撤销。`)) return;
  memories = memories.filter((item) => item.id !== entry.id);
  saveMemories();
  if (memoryId.value === entry.id) resetMemoryForm();
  renderMemories();
  renderMemoryCalendar();
  memoryEditorHint.textContent = "这一页已经从记忆库中删除。";
}

function memorySearchText(entry) {
  return [entry.title, entry.body, ...(Array.isArray(entry.tags) ? entry.tags : [])].join(" ").toLocaleLowerCase("zh-CN");
}

function renderMemories() {
  const query = memorySearch.value.trim().toLocaleLowerCase("zh-CN");
  const filtered = [...memories]
    .filter((entry) => activeMemoryCategory === "all" || entry.category === activeMemoryCategory)
    .filter((entry) => !query || memorySearchText(entry).includes(query))
    .sort((a, b) => {
      const dateOrder = b.date.localeCompare(a.date);
      if (dateOrder !== 0) return dateOrder;
      const timeOrder = String(b.time || "").localeCompare(String(a.time || ""));
      return timeOrder !== 0 ? timeOrder : Number(b.updatedAt) - Number(a.updatedAt);
    });

  memoryList.replaceChildren();
  memoryCount.textContent = `${filtered.length} / ${memories.length} 页`;

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-memories";
    empty.textContent = query || activeMemoryCategory !== "all"
      ? "没有找到这样的记忆。\n换个关键词或分类试试吧。"
      : "记忆库还是空的。\n从今天写下第一句话吧。";
    memoryList.append(empty);
    return;
  }

  filtered.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "memory-page";
    card.dataset.memoryId = entry.id;

    const toggle = document.createElement("button");
    toggle.className = "memory-page-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", `翻开记忆：${entry.title}`);

    const meta = document.createElement("span");
    meta.className = "memory-page-meta";
    const category = document.createElement("span");
    category.className = `memory-category memory-category-${memoryCategories.indexOf(entry.category) + 1}`;
    category.textContent = entry.category;
    const date = document.createElement("time");
    date.dateTime = entry.time ? `${entry.date}T${entry.time}` : entry.date;
    date.textContent = formatMemoryDate(entry);
    meta.append(category, date);

    const title = document.createElement("h4");
    title.textContent = `${moods[entry.mood]?.emoji ? `${moods[entry.mood].emoji} ` : ""}${entry.title}`;
    const preview = document.createElement("p");
    preview.className = "memory-page-preview";
    preview.textContent = entry.body;
    const unfoldHint = document.createElement("span");
    unfoldHint.className = "memory-unfold-hint";
    unfoldHint.textContent = "轻点翻开 ↘";
    toggle.append(meta, title, preview, unfoldHint);

    const details = document.createElement("div");
    details.className = "memory-page-details";
    const body = document.createElement("p");
    body.textContent = entry.body;
    details.append(body);

    if (Array.isArray(entry.tags) && entry.tags.length > 0) {
      const tags = document.createElement("div");
      tags.className = "memory-tags";
      entry.tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.textContent = `# ${tag}`;
        tags.append(tagElement);
      });
      details.append(tags);
    }

    const timestamps = document.createElement("small");
    timestamps.textContent = `创建 ${formatMemoryTimestamp(entry.createdAt)} · 更新 ${formatMemoryTimestamp(entry.updatedAt)}`;
    const actions = document.createElement("div");
    actions.className = "memory-page-actions";
    const editButton = document.createElement("button");
    editButton.className = "secondary-button";
    editButton.type = "button";
    editButton.textContent = "编辑";
    editButton.addEventListener("click", () => editMemory(entry));
    const deleteButton = document.createElement("button");
    deleteButton.className = "secondary-button danger-outline";
    deleteButton.type = "button";
    deleteButton.textContent = "删除";
    deleteButton.addEventListener("click", () => deleteMemoryEntry(entry));
    actions.append(editButton, deleteButton);
    details.append(timestamps, actions);

    toggle.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      unfoldHint.textContent = isOpen ? "轻点收起 ↖" : "轻点翻开 ↘";
    });
    card.append(toggle, details);
    memoryList.append(card);
  });
}

function renderMemoryCalendar() {
  memoryCalendarGrid.replaceChildren();
  memoryCalendarTitle.textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(memoryCalendarMonth);

  const year = memoryCalendarMonth.getFullYear();
  const month = memoryCalendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);
  const today = shanghaiDateValue();
  const memoryDates = new Set(memories.map((entry) => entry.date));

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const value = localDateValue(date);
    const button = document.createElement("button");
    button.className = "calendar-day memory-calendar-day";
    button.classList.toggle("is-outside", date.getMonth() !== month);
    button.classList.toggle("is-today", value === today);
    button.classList.toggle("has-memory", memoryDates.has(value));
    button.type = "button";
    button.textContent = String(date.getDate());
    button.setAttribute("aria-label", `${formatDiaryDate(value)}${memoryDates.has(value) ? "，有记忆" : ""}`);
    button.addEventListener("click", () => {
      memoryDate.value = value;
      const firstMemory = memories
        .filter((entry) => entry.date === value)
        .sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")))[0];
      if (firstMemory) {
        activeMemoryCategory = "all";
        memorySearch.value = "";
        memoryFilters.forEach((filter) => {
          const isActive = filter.dataset.category === "all";
          filter.classList.toggle("is-active", isActive);
          filter.setAttribute("aria-pressed", String(isActive));
        });
        renderMemories();
        document.querySelector(`[data-memory-id="${CSS.escape(firstMemory.id)}"]`)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "center",
        });
      } else {
        memoryTitle.focus();
      }
    });
    memoryCalendarGrid.append(button);
  }
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
    searchHint.textContent = "输入关键词，就能从便签、日记和记忆中一起寻找。";
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
  const memoryMatches = memories
    .filter((entry) => memorySearchText(entry).includes(normalizedQuery))
    .map((entry) => ({
      type: "memory",
      id: entry.id,
      content: `${entry.title} · ${entry.body}${Array.isArray(entry.tags) && entry.tags.length ? ` · ${entry.tags.join(" ")}` : ""}`,
      mood: entry.mood,
      sortValue: dateOrdinal(entry.date) * 86_400_000 + Number(entry.updatedAt || 0) % 86_400_000,
      label: `记忆 · ${entry.category} · ${formatMemoryDate(entry)}`,
    }));
  const matches = [...noteMatches, ...diaryMatches, ...memoryMatches].sort((a, b) => b.sortValue - a.sortValue).slice(0, 30);
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
    mood.textContent = moods[result.mood]?.emoji || (result.type === "note" ? "▱" : result.type === "memory" ? "♡" : "□");
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
      } else if (result.type === "note") {
        showView("notes");
        window.setTimeout(() => {
          document.querySelector(`[data-note-id="${CSS.escape(result.id)}"]`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 250);
      } else {
        activeMemoryCategory = "all";
        memorySearch.value = "";
        memoryFilters.forEach((filter) => {
          const isActive = filter.dataset.category === "all";
          filter.classList.toggle("is-active", isActive);
          filter.setAttribute("aria-pressed", String(isActive));
        });
        renderMemories();
        showView("memories");
        window.setTimeout(() => {
          const card = document.querySelector(`[data-memory-id="${CSS.escape(result.id)}"]`);
          card?.scrollIntoView({ behavior: "smooth", block: "center" });
          card?.querySelector(".memory-page-toggle")?.focus();
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
  if (data.app !== backupAppId || ![1, 2].includes(data.version)) {
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

  const sourceMemories = data.version === 1 ? [] : data.memories;
  if (!Array.isArray(sourceMemories)) {
    throw new Error("v2 备份中缺少记忆库数据。 ");
  }
  const cleanMemories = sourceMemories.map((entry, index) => {
    if (
      !entry
      || typeof entry !== "object"
      || typeof entry.id !== "string"
      || !entry.id.trim()
      || !validDateString(entry.date)
      || typeof entry.title !== "string"
      || !entry.title.trim()
      || typeof entry.body !== "string"
      || !entry.body.trim()
      || !memoryCategories.includes(entry.category)
    ) {
      throw new Error(`第 ${index + 1} 页记忆格式不正确。`);
    }
    const createdAt = Number(entry.createdAt);
    const updatedAt = Number(entry.updatedAt);
    if (!Number.isFinite(createdAt) || !Number.isFinite(updatedAt)) {
      throw new Error(`第 ${index + 1} 页记忆时间不正确。`);
    }
    const time = typeof entry.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time) ? entry.time : "";
    const mood = typeof entry.mood === "string" && moods[entry.mood] ? entry.mood : "";
    const tags = Array.isArray(entry.tags)
      ? [...new Set(entry.tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean))].slice(0, 12)
      : [];
    return {
      id: entry.id,
      date: entry.date,
      ...(time ? { time } : {}),
      title: entry.title.trim(),
      body: entry.body.trim(),
      category: entry.category,
      ...(mood ? { mood } : {}),
      tags,
      createdAt,
      updatedAt,
    };
  });

  return { version: data.version, notes: cleanNotes, diaries: cleanDiaries, memories: cleanMemories };
}

function closeImportDialog() {
  importDialog.hidden = true;
  pendingImport = null;
  importFile.value = "";
  chooseImport.focus();
}

function openImportDialog(data) {
  pendingImport = data;
  importSummary.textContent = `已读取 v${data.version} 备份：${data.notes.length} 张便签、${data.diaries.length} 篇日记、${data.memories.length} 页记忆。请选择合并或覆盖；取消不会修改任何内容。`;
  importDialog.hidden = false;
  mergeImport.focus();
}

function applyImportedData(mode) {
  if (!pendingImport) return;
  if (
    mode === "overwrite"
    && !window.confirm("覆盖会完整替换当前便签、日记和记忆库，现有数据将无法恢复。确定继续吗？")
  ) return;

  if (mode === "overwrite") {
    notes = pendingImport.notes;
    diaries = pendingImport.diaries;
    memories = pendingImport.memories;
  } else {
    const existingNoteIds = new Set(notes.map((note) => String(note.id)));
    const newNotes = pendingImport.notes.filter((note) => !existingNoteIds.has(String(note.id)));
    const existingDiaryDates = new Set(diaries.map((entry) => entry.date));
    const newDiaries = pendingImport.diaries.filter((entry) => !existingDiaryDates.has(entry.date));
    const existingMemoryIds = new Set(memories.map((entry) => String(entry.id)));
    const newMemories = pendingImport.memories.filter((entry) => {
      const id = String(entry.id);
      if (existingMemoryIds.has(id)) return false;
      existingMemoryIds.add(id);
      return true;
    });
    notes = [...notes, ...newNotes];
    diaries = [...diaries, ...newDiaries];
    memories = [...memories, ...newMemories];
  }

  saveNotes();
  saveDiaries();
  saveMemories();
  renderNotes();
  loadDiaryForDate();
  renderMemories();
  renderMemoryCalendar();
  const action = mode === "overwrite" ? "覆盖" : "合并";
  const noteTotal = notes.length;
  const diaryTotal = diaries.length;
  const memoryTotal = memories.length;
  closeImportDialog();
  setBackupStatus(`${action}完成：现在共有 ${noteTotal} 张便签、${diaryTotal} 篇日记、${memoryTotal} 页记忆。`);
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

memoryFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeMemoryCategory = filter.dataset.category;
    memoryFilters.forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    renderMemories();
  });
});

memorySearch.addEventListener("input", renderMemories);

memoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = memoryDate.value;
  const title = memoryTitle.value.trim();
  const body = memoryBody.value.trim();
  const category = memoryCategory.value;
  if (!validDateString(date) || !title || !body || !memoryCategories.includes(category)) return;

  const now = Date.now();
  const existingIndex = memories.findIndex((entry) => entry.id === memoryId.value);
  const existing = existingIndex >= 0 ? memories[existingIndex] : null;
  const id = existing?.id || (crypto.randomUUID?.() || `memory-${now}-${Math.random().toString(16).slice(2)}`);
  const entry = {
    id,
    date,
    ...(memoryTime.value ? { time: memoryTime.value } : {}),
    title,
    body,
    category,
    ...(memoryMood.value && moods[memoryMood.value] ? { mood: memoryMood.value } : {}),
    tags: parseMemoryTags(memoryTags.value),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (existingIndex >= 0) memories.splice(existingIndex, 1, entry);
  else memories.push(entry);
  saveMemories();
  resetMemoryForm({ date });
  renderMemories();
  memoryCalendarMonth = dateFromValue(date);
  memoryCalendarMonth = new Date(memoryCalendarMonth.getFullYear(), memoryCalendarMonth.getMonth(), 1);
  renderMemoryCalendar();
  memoryEditorHint.textContent = existing ? "这一页的修改已经保存。" : "这一页已经收进我们的记忆库。";
});

cancelMemoryEdit.addEventListener("click", () => resetMemoryForm());

previousMemoryMonth.addEventListener("click", () => {
  memoryCalendarMonth = new Date(memoryCalendarMonth.getFullYear(), memoryCalendarMonth.getMonth() - 1, 1);
  renderMemoryCalendar();
});

nextMemoryMonth.addEventListener("click", () => {
  memoryCalendarMonth = new Date(memoryCalendarMonth.getFullYear(), memoryCalendarMonth.getMonth() + 1, 1);
  renderMemoryCalendar();
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
    version: 2,
    exportedAt: new Date().toISOString(),
    notes,
    diaries,
    memories,
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
  setBackupStatus(`已导出 v2 备份：${notes.length} 张便签、${diaries.length} 篇日记、${memories.length} 页记忆。`);
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
memoryDate.value = shanghaiDateValue();
applyTheme(savedTheme || preferredTheme);
updateClock();
renderNotes();
loadDiaryForDate();
resetMemoryForm();
renderMemories();
renderMemoryCalendar();
showView(location.hash.slice(1), false);
setInterval(updateClock, 30_000);

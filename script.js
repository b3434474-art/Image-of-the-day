const image = document.getElementById("dailyPhoto");
const title = document.getElementById("dateTitle");
const status = document.getElementById("status");
const backupBadge = document.getElementById("backupBadge");
const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");

const imageURL = name => `images/${encodeURIComponent(name)}`;

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86400000) + 1;
}

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function yearSeed(year) {
  let seed = 2166136261;
  for (const ch of String(year)) {
    seed ^= ch.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function shuffledForYear(year) {
  const list = [...MAIN_PHOTOS];
  const random = mulberry32(yearSeed(year));
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const today = new Date();
const year = today.getFullYear();
const day = dayOfYear(today);
const yearlyOrder = shuffledForYear(year);
const chosenName = yearlyOrder[day - 1];
let activeName = chosenName;
let usingBackup = false;

title.textContent = today.toLocaleDateString(undefined, {weekday:"long", month:"long", day:"numeric", year:"numeric"});
status.textContent = `Photo ${day} of ${yearlyOrder.length} for ${year}`;

function showBackup() {
  usingBackup = true;
  const index = (day - 1) % BACKUP_PHOTOS.length;
  activeName = BACKUP_PHOTOS[index];
  backupBadge.hidden = false;
  status.textContent = "The main photo was unavailable, so a backup photo is being shown.";
  image.src = imageURL(activeName);
}

image.onerror = () => {
  if (!usingBackup) showBackup();
};
image.onload = () => {
  if (!usingBackup) status.textContent = `Photo ${day} of ${yearlyOrder.length} for ${year}`;
};
image.src = imageURL(chosenName);

async function getImageFile() {
  const response = await fetch(image.src);
  if (!response.ok) throw new Error("Image could not be downloaded");
  const blob = await response.blob();
  const ext = activeName.split(".").pop().split("?")[0] || "jpg";
  return new File([blob], `photo-of-the-day-${year}-${String(day).padStart(3,"0")}.${ext}`, {type: blob.type || "image/jpeg"});
}

saveBtn.addEventListener("click", async () => {
  try {
    const file = await getImageFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    window.open(image.src, "_blank", "noopener");
  }
});

shareBtn.addEventListener("click", async () => {
  try {
    const file = await getImageFile();
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      await navigator.share({title:"Photo of the Day", text:`Photo of the Day — ${title.textContent}`, files:[file]});
      return;
    }
    if (navigator.share) {
      await navigator.share({title:"Photo of the Day", text:`Photo of the Day — ${title.textContent}`, url:location.href});
      return;
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(location.href);
    alert("The photo page link was copied. You can paste it into a message.");
  } catch {
    alert("Sharing isn't available here. You can use Save to Device instead.");
  }
});
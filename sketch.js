let birthdays = [];
let hoveredBirthday = null;
let isTouchDevice = false;
let mainFont;

let showPanel = false;
let editingIndex = null;

// Form elements
let inputName, inputInitials, inputDate, inputApprox, addButton, cancelButton, panelBg;

let fabButtonX, fabButtonY, fabRadius = 32;

function preload() {
  mainFont = loadFont("Roboto-Medium.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont(mainFont);
  isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  colorMode(HSB, 360, 100, 100);

  positionFabButton();
  createPanelElements();

  let saved = localStorage.getItem("birthdays");
  if (saved) birthdays = JSON.parse(saved);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionFabButton();
  positionPanel();
}

function positionFabButton() {
  fabButtonX = width - fabRadius - 24;
  fabButtonY = height - fabRadius - 24;
}

function drawFabButton() {
  drawingContext.shadowBlur = 6;
  drawingContext.shadowColor = "rgba(0,0,0,0.18)";
  colorMode(RGB, 255);
  fill(230, 230, 230);
  noStroke();
  ellipse(fabButtonX, fabButtonY, fabRadius * 2);
  drawingContext.shadowBlur = 0;
  fill(0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("+", fabButtonX, fabButtonY - 3);
  colorMode(HSB, 360, 100, 100);
}

function mousePressed() {
  if (!showPanel && dist(mouseX, mouseY, fabButtonX, fabButtonY) <= fabRadius) {
    showPanel = true;
    showPanelModal();
    return;
  }
  if (showPanel) return;
  if (!isTouchDevice) checkHoveredBirthday(mouseX, mouseY);
}

function keyPressed() {
  if (showPanel && keyCode === ESCAPE) {
    hidePanelModal();
  }
}

function draw() {
  background(0, 0, 100);
  positionFabButton();
  textFont(mainFont);
  drawMonths();
  drawDecades();
  drawCurrentDay();
  drawBirthdays();
  drawHoverInfo();
  if (!showPanel) drawFabButton();

  // Tooltip gris suave debajo del FAB (restaurado, pero gris y negro, NO azul)
  if (!showPanel && dist(mouseX, mouseY, fabButtonX, fabButtonY) < fabRadius + 10) {
    push();
    colorMode(RGB, 255);
    fill(230,230,230);     // gris suave
    noStroke();
    rect(fabButtonX - 66, fabButtonY - 62, 110, 30, 10);
    fill(0);
    textSize(13);
    textAlign(CENTER, CENTER);
    text("Añadir cumpleaños", fabButtonX - 11, fabButtonY - 47);
    colorMode(HSB, 360, 100, 100);
    pop();
  }
}

function createPanelElements() {
  panelBg = createDiv("");
  panelBg.position(0, 0);
  panelBg.style("width", windowWidth + "px");
  panelBg.style("height", windowHeight + "px");
  panelBg.style("background", "rgba(255,255,255,0.82)");
  panelBg.style("backdrop-filter", "blur(13px)");
  panelBg.style("display", "none");
  panelBg.style("position", "fixed");
  panelBg.style("z-index", "10");

  let panelCard = createDiv("");
  panelCard.parent(panelBg);
  panelCard.style("width", "320px");
  panelCard.style("margin", "auto");
  panelCard.style("padding", "34px 28px 20px 28px");
  panelCard.style("border-radius", "20px");
  panelCard.style("background", "rgba(255,255,255,0.97)");
  panelCard.style("box-shadow", "0 18px 32px rgba(0,0,32,0.13), 0 2px 8px rgba(0,0,64,0.07)");
  panelCard.style("position", "absolute");
  panelCard.style("top", height / 2 - 190 + "px");
  panelCard.style("left", width / 2 - 160 + "px");
  panelCard.id("panelCard");

  let title = createDiv("Cumpleaños");
  title.parent(panelCard);
  title.style("font-size", "1.4em");
  title.style("font-family", "Roboto,sans-serif");
  title.style("color", "#222");
  title.style("margin-bottom", "12px");
  title.style("font-weight", "600");
  title.style("text-align", "center");

  inputName = createInput("").parent(panelCard);
  inputName.style("width", "95%");
  inputName.style("margin-bottom", "11px");
  inputName.attribute("placeholder", "Nombre completo");
  inputName.style("font-size", "1.1em");
  inputName.style("border-radius", "7px");
  inputName.style("border", "1.5px solid #e0e0e0");

  inputInitials = createInput("").parent(panelCard);
  inputInitials.style("width", "95%");
  inputInitials.style("margin-bottom", "11px");
  inputInitials.attribute("placeholder", "Iniciales");
  inputInitials.style("font-size", "1.1em");
  inputInitials.style("border-radius", "7px");
  inputInitials.style("border", "1.5px solid #e0e0e0");

  inputDate = createInput("", "date").parent(panelCard);
  inputDate.style("width", "95%");
  inputDate.style("margin-bottom", "8px");
  inputDate.attribute("placeholder", "Fecha");
  inputDate.style("font-size", "1.1em");
  inputDate.style("border-radius", "7px");
  inputDate.style("border", "1.5px solid #e0e0e0");

  inputApprox = createCheckbox("Año aproximado", false).parent(panelCard);
  inputApprox.style("font-family", "Roboto, Arial, sans-serif");
  inputApprox.style("font-size", "1.08em");
  inputApprox.style("margin-bottom", "19px");
  inputApprox.style("margin-left", "2px");
  inputApprox.style("display", "flex");
  inputApprox.style("align-items", "center");
  inputApprox.style("gap", "7px");

  addButton = createButton("Añadir/editar").parent(panelCard);
  addButton.style("width", "100%");
  addButton.style("height", "37px");
  addButton.style("font-size", "1.08em");
  addButton.style("margin-top", "5px");
  addButton.style("border-radius", "7px");
  addButton.style("border", "none");
  addButton.style("background", "#e6e6e6");
  addButton.style("color", "#111");
  addButton.style("font-family", "Roboto, Arial, sans-serif");
  addButton.style("font-weight", "600");
  addButton.mousePressed(addOrUpdateBirthday);

  cancelButton = createButton("×").parent(panelCard);
  cancelButton.style("position", "absolute");
  cancelButton.style("top", "12px");
  cancelButton.style("right", "22px");
  cancelButton.style("font-size", "2.0em");
  cancelButton.style("line-height", "1em");
  cancelButton.style("background", "none");
  cancelButton.style("border", "none");
  cancelButton.style("color", "#7b7b7b");
  cancelButton.style("cursor", "pointer");
  cancelButton.mousePressed(hidePanelModal);

  let list = createDiv("").parent(panelCard);
  list.id("panelList");
  list.style("max-height", "195px");
  list.style("overflow-y", "auto");
  list.style("margin-top", "22px");
  list.style("margin-bottom", "2px");
  list.style("font-size", "1em");
  list.style("color", "#2F446A");
  list.style("font-family", "Roboto,sans-serif");
  refreshListView();

  panelBg.hide();
}

function refreshListView() {
  let list = select("#panelList");
  list.html("");
  birthdays.forEach((p, i) => {
    let d = createDiv("").parent(list);
    d.style("display", "flex");
    d.style("align-items", "center");
    d.style("padding", "7px 0");
    d.mouseOver(() => {
      d.style("background", "rgba(220,236,240,0.13)");
    });
    d.mouseOut(() => {
      d.style("background", "");
    });

    let t =
      (p.name || "~") +
      " (" +
      (p.initials || "~") +
      ") " +
      (p.birthdate || "~") +
      (p.approximate ? " ~" : "");
    let txt = createSpan(t).parent(d);
    txt.style("flex", "1");
    txt.style("font-size", "1em");

    let editBtn = createButton("✎").parent(d);
    editBtn.style("font-size", "1.1em");
    editBtn.style("margin-right", "11px");
    editBtn.style("border", "none");
    editBtn.style("background", "none");
    editBtn.style("color", "#2F446A");
    editBtn.style("cursor", "pointer");
    editBtn.mousePressed(() => {
      startEdit(i);
    });

    let removeBtn = createButton("🗑").parent(d);
    removeBtn.style("font-size", "1.08em");
    removeBtn.style("border", "none");
    removeBtn.style("background", "none");
    removeBtn.style("color", "crimson");
    removeBtn.style("cursor", "pointer");
    removeBtn.mousePressed(() => {
      if (confirm("¿Borrar?")) deleteEntry(i);
    });
  });
}

function showPanelModal() {
  selectAll("input").forEach((inp) => inp.elt.blur && inp.elt.blur());
  selectAll("div").forEach((d) => d.id() == "panelCard" && positionPanel());
  panelBg.show();
  showPanel = true;
  refreshListView();
  resetForm();
}

function hidePanelModal() {
  panelBg.hide();
  showPanel = false;
  resetForm();
}

function resetForm() {
  inputName.value("");
  inputInitials.value("");
  inputDate.value("");
  inputApprox.checked(false);
  editingIndex = null;
  addButton.html("Añadir/editar");
}

function positionPanel() {
  let pc = select("#panelCard");
  if (pc) {
    pc.style("left", windowWidth / 2 - 160 + "px");
    pc.style("top", windowHeight / 2 - 190 + "px");
  }
  panelBg.style("width", windowWidth + "px");
  panelBg.style("height", windowHeight + "px");
}

function addOrUpdateBirthday() {
  const name = inputName.value().trim();
  const initials = inputInitials.value().trim();
  const birthdate = inputDate.value();
  const approximate = inputApprox.checked();

  if (!name || !initials || !birthdate) {
    alert("Pon nombre, iniciales y fecha");
    return;
  }
  if (editingIndex !== null) {
    birthdays[editingIndex] = { name, initials, birthdate, approximate };
    editingIndex = null;
    addButton.html("Añadir/editar");
  } else {
    birthdays.push({ name, initials, birthdate, approximate });
  }
  localStorage.setItem("birthdays", JSON.stringify(birthdays));
  refreshListView();
  resetForm();
}

function startEdit(i) {
  let p = birthdays[i];
  inputName.value(p.name || "");
  inputInitials.value(p.initials || "");
  inputDate.value(p.birthdate || "");
  inputApprox.checked(!!p.approximate);
  editingIndex = i;
  addButton.html("Añadir/editar");
}

function deleteEntry(i) {
  birthdays.splice(i, 1);
  localStorage.setItem("birthdays", JSON.stringify(birthdays));
  refreshListView();
  resetForm();
}

function getDayOfYear(date) {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - yearStart;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function drawMonths() {
  const daysInYear = 366;
  const monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  let xMonthStart = [0];
  for (let i = 0; i < 12; i++) xMonthStart.push(xMonthStart[i] + monthLengths[i]);
  for (let i = 0; i < 12; i++) {
    const xStart = Math.round(map(xMonthStart[i], 0, daysInYear, 0, width));
    const xEnd = Math.round(map(xMonthStart[i + 1], 0, daysInYear, 0, width));
    const monthWidth = xEnd - xStart;
    fill(0, 0, i % 2 === 0 ? 96 : 98);
    noStroke();
    rect(xStart, 0, monthWidth, height);
    fill(0, 0, 40);
    textSize(8);
    const xText = Math.round((xStart + xEnd) / 2);
    text(monthNames[i], xText, 15);
  }
}

function drawDecades() {
  stroke(0, 0, 80);
  strokeWeight(1);
  for (let i = 10; i <= 100; i += 10) {
    const y = map(i, 0, 100, height, 0);
    line(0, y, width, y);
  }
  noStroke();
}

function getSeasonColor(date) {
  if (!date || isNaN(date.getTime())) return color("#CCC");
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20))
    return color("#E1FAC8");
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22))
    return color("#F7F0C6");
  if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 20))
    return color("#FFDEDE");
  return color("#C7F4F4");
}

function drawCurrentDay() {
  const today = new Date();
  const utcDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const dayOfYear = getDayOfYear(utcDate);
  const x = map(dayOfYear, 1, 366, 0, width);
  const seasonColor = getSeasonColor(utcDate);
  stroke(0);
  strokeWeight(1);
  line(x, 0, x, height);
  noStroke();
}

function calculateAge(birthDate, now, approximate) {
  if (!birthDate || isNaN(birthDate.getTime()) || approximate) return "~";
  let years = now.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = now.getUTCMonth() - birthDate.getUTCMonth();
  let days = now.getUTCDate() - birthDate.getUTCDate();
  if (months < 0 || (months === 0 && days < 0)) years--;
  return years;
}

function getZodiacSign(date, approximate) {
  if (!date || isNaN(date.getTime()) || approximate) return "~";
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Capricornio";
  if ((month == 1 && day >= 21) || (month == 2 && day <= 19)) return "Acuario";
  if ((month == 2 && day >= 20) || (month == 3 && day <= 20)) return "Piscis";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 20)) return "Aries";
  if ((month == 4 && day >= 21) || (month == 5 && day <= 20)) return "Tauro";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Géminis";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cáncer";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Escorpio";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagitario";
  return "~";
}

function getChineseZodiac(birthDate, approximate) {
  if (!birthDate || isNaN(birthDate.getTime()) || approximate) return "~";
  const year = birthDate.getUTCFullYear();
  const animals = [
    "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
    "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"
  ];
  return animals[(year - 4) % 12];
}

function getChineseElement(birthDate, approximate) {
  if (!birthDate || isNaN(birthDate.getTime()) || approximate) return "~";
  const year = birthDate.getUTCFullYear();
  const elementIndex = (year - 4) % 10;
  const elements = [
    "Madera", "Madera", "Fuego", "Fuego", "Tierra",
    "Tierra", "Metal", "Metal", "Agua", "Agua"
  ];
  return elements[elementIndex];
}

function getGeneration(birthDate, approximate) {
  if (!birthDate || isNaN(birthDate.getTime()) || approximate) return "~";
  const year = birthDate.getUTCFullYear();
  if (year >= 2010) return "Generación Alpha";
  if (year >= 1997) return "Generación Z";
  if (year >= 1981) return "Millennials";
  if (year >= 1965) return "Generación X";
  if (year >= 1946) return "Baby Boomers";
  if (year >= 1928) return "Silent Generation";
  return "Greatest Generation";
}

function drawCurrentDay() {
  const today = new Date();
  const utcDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const dayOfYear = getDayOfYear(utcDate);
  const x = map(dayOfYear, 1, 366, 0, width);
  stroke(255, 0, 0); // ROJO, muy visible
  strokeWeight(0.2);   // Más grueso para depurar
  line(x, 0, x, height);
  noStroke();
}

function drawBirthdays() {
  let birthdayGroups = {};
  for (const birthday of birthdays) {
    const [year, month, day] = (birthday.birthdate || "----").split("-");
    const key = `${month || "--"}-${day || "--"}`;
    if (!birthdayGroups[key]) birthdayGroups[key] = [];
    birthdayGroups[key].push(birthday);
  }
  const today = new Date();
  hoveredBirthday = null;
  for (const [key, group] of Object.entries(birthdayGroups)) {
    const [month, day] = key.split("-").map(Number);
    const plotDate = new Date(Date.UTC(2000, month ? month - 1 : 0, day || 1));
    const dayOfYear = getDayOfYear(plotDate);
    const xBase = map(dayOfYear, 1, 366, 0, width);
    for (let idx = 0; idx < group.length; idx++) {
      const birthday = group[idx];
      let [year, month, day] = (birthday.birthdate || "----").split("-");
      year = Number(year);
      month = Number(month);
      day = Number(day);
      let realDate = year && month && day ? new Date(Date.UTC(year, month - 1, day)) : null;
      let approximate = !!birthday.approximate || !realDate || isNaN(realDate.getTime());
      let age = calculateAge(realDate, today, approximate);
      const y = age === "~" ? height - 20 : map(age, 0, 100, height, 0);
      const total = group.length;
      const spread = 20;
      const x = xBase + (idx - (total - 1) / 2) * spread;
      let circleColor = getSeasonColor(realDate || plotDate);
      let baseSize = 20;
      let circleSize = baseSize;
      let fontSize = 10;
      let pulseFactor = 1;
      let displayText = birthday.initials + (approximate ? " ~" : "");
      const isBirthdayToday =
        !approximate &&
        realDate &&
        today.getUTCDate() === realDate.getUTCDate() &&
        today.getUTCMonth() === realDate.getUTCMonth();
      if (isBirthdayToday) {
        pulseFactor = map(sin(frameCount * 0.2), -1, 1, 1, 2);
        const saturation = map(sin(frameCount * 0.4), -1, 1, 30, 100);
        circleColor = color(hue(circleColor), saturation, brightness(circleColor));
        displayText = (birthday.name || birthday.initials) + (approximate ? " ~" : "");
        fontSize = 20 * pulseFactor;
      }
      circleSize = baseSize * pulseFactor;
      fontSize = 10 * pulseFactor;
      fill(circleColor);
      ellipse(x, y, circleSize, circleSize);
      fill(0, 0, 0);
      textSize(fontSize);
      textAlign(CENTER, CENTER);
      text(displayText, x, y);
      if (isBirthdayToday && age !== "~") {
        textSize(12);
        text(age, x, y + 15);
      }
      if (!isTouchDevice && dist(mouseX, mouseY, x, y) < circleSize / 2) {
        hoveredBirthday = birthday;
      }
    }
  }
}

function checkHoveredBirthday(x, y) {
  hoveredBirthday = null;
  let birthdayGroups = {};
  for (const birthday of birthdays) {
    const [year, month, day] = (birthday.birthdate || "----").split("-");
    const key = `${month || "--"}-${day || "--"}`;
    if (!birthdayGroups[key]) birthdayGroups[key] = [];
    birthdayGroups[key].push(birthday);
  }
  const today = new Date();
  for (const [key, group] of Object.entries(birthdayGroups)) {
    const [month, day] = key.split("-").map(Number);
    const plotDate = new Date(Date.UTC(2000, month ? month - 1 : 0, day || 1));
    const dayOfYear = getDayOfYear(plotDate);
    const xBase = map(dayOfYear, 1, 366, 0, width);
    for (let idx = 0; idx < group.length; idx++) {
      const birthday = group[idx];
      let [year, month, day] = (birthday.birthdate || "----").split("-");
      year = Number(year);
      month = Number(month);
      day = Number(day);
      let realDate = year && month && day ? new Date(Date.UTC(year, month - 1, day)) : null;
      let approximate = !!birthday.approximate || !realDate || isNaN(realDate.getTime());
      let age = calculateAge(realDate, today, approximate);
      const yPos = age === "~" ? height - 20 : map(age, 0, 100, height, 0);
      const total = group.length;
      const spread = 20;
      const xPos = xBase + (idx - (total - 1) / 2) * spread;
      if (dist(x, y, xPos, yPos) < 10) {
        hoveredBirthday = birthday;
        return;
      }
    }
  }
}

function drawHoverInfo() {
  if (hoveredBirthday) {
    const infoWidth = 250;
    const infoHeight = 160;
    const padding = 10;
    let infoX, infoY;
    if (isTouchDevice) {
      infoX = width / 2 - infoWidth / 2;
      infoY = height - infoHeight - padding;
    } else {
      infoX = constrain(
        mouseX - infoWidth / 2,
        padding,
        width - infoWidth - padding
      );
      infoY = constrain(
        mouseY - infoHeight - padding,
        padding,
        height - infoHeight - padding
      );
    }
    fill(0, 0, 100, 0.85);
    stroke(0, 0, 80);
    rect(infoX, infoY, infoWidth, infoHeight, 10);
    noStroke();
    fill(0, 0, 0);
    textAlign(CENTER, TOP);

    let [year, month, day] = (hoveredBirthday.birthdate || "----").split("-");
    year = Number(year);
    month = Number(month);
    day = Number(day);
    let realDate = year && month && day ? new Date(Date.UTC(year, month - 1, day)) : null;
    let approximate = !!hoveredBirthday.approximate || !realDate || isNaN(realDate.getTime());
    let age = calculateAge(realDate, new Date(), approximate);

    let zodiacSign = getZodiacSign(realDate, approximate);
    let chineseZodiac = getChineseZodiac(realDate, approximate);
    let chineseElement = getChineseElement(realDate, approximate);
    let generation = getGeneration(realDate, approximate);

    let textY = infoY + padding;
    textSize(16);
    textStyle(BOLD);
    text(
      (hoveredBirthday.name || hoveredBirthday.initials) +
        (approximate ? " ~" : ""),
      infoX + infoWidth / 2,
      textY
    );
    textY += 23;
    textSize(14);
    textStyle(NORMAL);
    text(
      `Nacimiento: ${hoveredBirthday.birthdate || "~"}${approximate ? " ~" : ""}`,
      infoX + infoWidth / 2,
      textY
    );
    textY += 23;
    text(`Edad: ${age} años`, infoX + infoWidth / 2, textY);
    textY += 23;
    text(`Signo: ${zodiacSign}`, infoX + infoWidth / 2, textY);
    textY += 23;
    text(
      `Signo Chino: ${chineseZodiac} (${chineseElement})`,
      infoX + infoWidth / 2,
      textY
    );
    textY += 23;
    text(`Generación: ${generation}`, infoX + infoWidth / 2, textY);
  }
}

function touchStarted() {
  if (touches.length > 0 && touches[0]) {
    checkHoveredBirthday(touches[0].x, touches[0].y);
  }
  return false;
}
function touchMoved() {
  if (touches.length > 0 && touches[0]) {
    checkHoveredBirthday(touches[0].x, touches[0].y);
  }
  return false;
}
function touchEnded() {
  hoveredBirthday = null;
  return false;
}
function mouseMoved() {
  if (!isTouchDevice && !showPanel) checkHoveredBirthday(mouseX, mouseY);
}

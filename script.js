const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 클릭 원의 최대 반지름(px)과 확산 속도(px/ms)를 조절한다.
const clickRippleMaxRadius = 30;
const clickRippleSpeed = 0.25;
const clickRipples = [];

// 힌트 패널의 접힌 폭, 펼친 폭(접힌 폭의 두 배), 애니메이션 속도를 설정한다.
const hintPanelX = 20;
const hintPanelY = 20;
const hintPanelCollapsedWidth = 100;
const hintPanelExpandedWidth = hintPanelCollapsedWidth * 2;
const hintPanelExpandSpeed = 0.6;
let hintPanelWidth = hintPanelCollapsedWidth;
let isHintPanelExpanded = false;

// 달과 별의 위치, 크기, 이동 속도를 한곳에서 관리한다.
const skyHeight = 450;
const moon = {
  x: 0,
  y: 95,
  radius: 22,
  speed: 0.1,
};
const stars = [
  { x: 70, y: 40, radius: 1.5, speed: 0.35 },
  { x: 180, y: 110, radius: 2, speed: 0.5 },
  { x: 270, y: 55, radius: 1, speed: 0.25 },
  { x: 340, y: 130, radius: 1.5, speed: 0.45 },
  { x: 490, y: 35, radius: 2, speed: 0.3 },
  { x: 570, y: 150, radius: 1, speed: 0.6 },
  { x: 740, y: 75, radius: 1.5, speed: 0.4 },
  { x: 125, y: 230, radius: 1, speed: 0.55 },
  { x: 300, y: 300, radius: 1.5, speed: 0.3 },
  { x: 530, y: 250, radius: 1, speed: 0.5 },
  { x: 760, y: 350, radius: 2, speed: 0.35 },
];
// 게임에서 사용할 동기, 장소, 물건 종류를 관리한다.
const motiveTypes = [
  "복수",
  "금전 문제",
  "질투",
  "비밀 은폐",
  "권력욕",
  "오랜 원한",
  "협박",
  "상속 다툼",
  "배신감",
  "명예 훼손",
];
const locationTypes = [
  "서재",
  "도서관",
  "정원",
  "주방",
  "창고",
  "연구실",
  "온실",
  "지하실",
  "복도",
  "응접실",
  "옥상",
  "차고",
  "작업실",
  "별관",
  "음악실",
];
const itemTypes = [
  "촛대",
  "편지칼",
  "독약",
  "밧줄",
  "망치",
  "권총",
  "약병",
  "장식품",
  "와인잔",
  "가위",
  "드라이버",
  "열쇠",
  "향수병",
  "트로피",
  "책",
];
const suspects = [
  { x: 270, color: "#5b83a6", motive: "", location: "", item: "" },
  { x: 410, color: "#a65b5b", motive: "", location: "", item: "" },
  { x: 550, color: "#6b8c65", motive: "", location: "", item: "" },
  { x: 690, color: "#8a6b9b", motive: "", location: "", item: "" },
];
let culpritSuspect = null;

// 각 버튼의 원래 위치와 크기, 확대 속도와 애니메이션 시간을 저장한다.
const buttonHoverScale = 1.1;
const buttons = [
  {
    x: 350,
    y: 500,
    width: 100,
    height: 70,
    label: "범인 잡기",
    scale: 1,
    scaleSpeed: 0.0015,
    animationDurationMs: 60,
    animationElapsedMs: 0,
    animationTargetScale: 1,
    isHovered: false,
  },
  {
    x: 680,
    y: 500,
    width: 100,
    height: 70,
    label: "단서 특정",
    scale: 1,
    scaleSpeed: 0.0015,
    animationDurationMs: 60,
    animationElapsedMs: 0,
    animationTargetScale: 1,
    isHovered: false,
  },
];
let previousFrameTime = 0;

// 목록을 무작위로 섞고, 중복 없이 각 용의자에게 속성을 배정한다.
function shuffle(items) {
  const shuffledItems = [...items];
  for (let i = shuffledItems.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledItems[i], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[i],
    ];
  }
  return shuffledItems;
}

function initializeGame() {
  const shuffledMotives = shuffle(motiveTypes);
  const shuffledLocations = shuffle(locationTypes);
  const shuffledItems = shuffle(itemTypes);

  for (let i = 0; i < suspects.length; i += 1) {
    suspects[i].motive = shuffledMotives[i];
    suspects[i].location = shuffledLocations[i];
    suspects[i].item = shuffledItems[i];
  }

  // 게임마다 용의자 한 명을 범인으로 지정해 내부 변수에만 보관한다.
  culpritSuspect = suspects[Math.floor(Math.random() * suspects.length)];
}

// 왼쪽 클릭 위치를 캔버스 좌표로 저장해 원형 확산 효과를 시작한다.
canvas.addEventListener("click", (event) => {
  if (event.button !== 0) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

  clickRipples.push({
    x: mouseX,
    y: mouseY,
    radius: 0,
  });

  // 패널 오른쪽 가장자리의 화살표 버튼을 누르면 펼침 상태를 전환한다.
  const toggleButtonX = hintPanelX + hintPanelWidth;
  const toggleButtonY = hintPanelY + 225;
  const toggleButtonRadius = 14;
  const distanceX = mouseX - toggleButtonX;
  const distanceY = mouseY - toggleButtonY;
  if (distanceX ** 2 + distanceY ** 2 <= toggleButtonRadius ** 2) {
    isHintPanelExpanded = !isHintPanelExpanded;
  }
});

// 마우스 위치를 캔버스 좌표로 바꾸고 확대된 버튼 영역까지 확인한다.
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

  for (const button of buttons) {
    const scaledWidth = button.width * button.scale;
    const scaledHeight = button.height * button.scale;
    button.isHovered =
      mouseX >= button.x + button.width / 2 - scaledWidth / 2 &&
      mouseX <= button.x + button.width / 2 + scaledWidth / 2 &&
      mouseY >= button.y + button.height / 2 - scaledHeight / 2 &&
      mouseY <= button.y + button.height / 2 + scaledHeight / 2;
  }
});

// 캔버스를 벗어나면 확대 상태를 해제해 버튼 크기를 원래대로 돌린다.
canvas.addEventListener("mouseleave", () => {
  for (const button of buttons) {
    button.isHovered = false;
  }
});

function drawBackground() {
  // 밤하늘과 아래쪽 지면을 칠한다.
  ctx.fillStyle = "#14233f";
  ctx.fillRect(0, 0, canvas.width, skyHeight);
  ctx.fillStyle = "#302044";
  ctx.fillRect(0, skyHeight, canvas.width, canvas.height - skyHeight);

  // 배경 천체를 먼저 그려 UI와 게임 오브젝트가 앞에 보이게 한다.
  ctx.fillStyle = "#f5e7b2";
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHintPanel() {
  // 힌트 목록의 배경 상자와 제목을 그린다.
  ctx.fillStyle = "#f3ead5";
  ctx.fillRect(hintPanelX, hintPanelY, hintPanelWidth, 450);
  ctx.fillStyle = "#29232d";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("힌트 목록", hintPanelX + hintPanelWidth / 2, 34);

  // 장소, 도구, 동기 항목을 세로로 배치한다.
  const hints = ["장소", "도구", "동기"];
  for (let i = 0; i < hints.length; i += 1) {
    const boxY = 55 + i * 70;

    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(25, boxY, hintPanelWidth - 10, 50);
    ctx.strokeStyle = "#b7aa91";
    ctx.lineWidth = 1;
    ctx.strokeRect(25, boxY, hintPanelWidth - 10, 50);

    ctx.fillStyle = "#29232d";
    ctx.font = "16px sans-serif";
    ctx.fillText(hints[i], hintPanelX + hintPanelWidth / 2, boxY + 25);
  }

  // 힌트 목록의 스크롤 바를 그린다.
  const scrollbarX = hintPanelX + hintPanelWidth - 8;
  ctx.fillStyle = "#d6cbb7";
  ctx.fillRect(scrollbarX, 55, 4, 400);
  ctx.fillStyle = "#8c806e";
  ctx.fillRect(scrollbarX, 55, 4, 95);

  // 화살표 버튼을 패널의 현재 오른쪽 가장자리 중앙에 그린다.
  const toggleButtonX = hintPanelX + hintPanelWidth;
  const toggleButtonY = hintPanelY + 225;
  ctx.beginPath();
  ctx.arc(toggleButtonX, toggleButtonY, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#8c806e";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(isHintPanelExpanded ? "<" : ">", toggleButtonX, toggleButtonY);
}

function wrapText(text, maxWidth) {
  const lines = [];
  let line = "";

  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
    }
    line = "";

    for (const character of word) {
      const candidateCharacter = line + character;
      if (ctx.measureText(candidateCharacter).width > maxWidth && line) {
        lines.push(line);
        line = character;
      } else {
        line = candidateCharacter;
      }
    }
  }

  if (line) {
    lines.push(line);
  }
  return lines;
}

function drawGameUI() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 남은 기회와 추가 힌트를 표시한다.
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(400, 55, 50, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(730, 55, 50, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#24202b";
  ctx.font = "13px sans-serif";
  ctx.fillText("남은 기회: 2", 400, 55);
  ctx.fillText("추가 힌트: 2", 730, 55);
  // 네 명의 용의자 정보 상자와 인물을 그린다.
  // 네 명의 용의자 정보 상자와 인물을 그린다.
  for (let i = 0; i < suspects.length; i += 1) {
    const suspect = suspects[i];
    const centerX = suspect.x;
    const bubbleX = centerX - 65;
    const bubbleY = 145;

    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, 130, 100, 10);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#24202b";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`용의자 ${i + 1}`, centerX, bubbleY + 14);

    // 배정된 장소, 물건, 동기를 엮어 각 용의자의 알리바이로 표시한다.
    const itemParticle = hasFinalConsonant(suspect.item) ? "을" : "를";
    const alibi =
      `저는 사건 당시 ${suspect.location}에 있었고 ` +
      `${suspect.item}${itemParticle} 가지고 있었습니다. ` +
      `피해자와는 ${suspect.motive}로 인한 문제가 있었습니다.`;
    ctx.font = "10px sans-serif";
    const alibiLines = wrapText(alibi, 114);
    for (let lineIndex = 0; lineIndex < alibiLines.length; lineIndex += 1) {
      ctx.fillText(alibiLines[lineIndex], centerX, bubbleY + 34 + lineIndex * 12);
    }

    ctx.fillStyle = "#e7bd99";
    ctx.beginPath();
    ctx.arc(centerX, 270, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = suspect.color;
    ctx.fillRect(centerX - 15, 300, 30, 50);
  }

  // 화면 아래쪽에 동작 버튼을 그린다.
  for (const button of buttons) {
    drawRoundedButton(button);
  }
}

function hasFinalConsonant(word) {
  const lastCharacter = word.charCodeAt(word.length - 1);
  const hangulBaseCode = 0xac00;
  const hangulEndCode = 0xd7a3;
  return (
    lastCharacter >= hangulBaseCode &&
    lastCharacter <= hangulEndCode &&
    (lastCharacter - hangulBaseCode) % 28 !== 0
  );
}

function drawRoundedButton(button) {
  const { x, y, width, height, label, scale } = button;
  const radius = 10;

  // 버튼 중심을 고정한 채 현재 배율로 확대해 그린다.
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + width / 2), -(y + height / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = "#24202b";
  ctx.font = "16px sans-serif";
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.restore();
}

function drawClickRipples() {
  for (const ripple of clickRipples) {
    const progress = ripple.radius / clickRippleMaxRadius;

    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function gameLoop(frameTime) {
  const deltaTime = previousFrameTime === 0 ? 0 : frameTime - previousFrameTime;
  previousFrameTime = frameTime;

  // 지우기: 이전 프레임을 지운다.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 계산: 달과 별을 움직이고, 버튼은 마우스 상태에 맞춰 크기를 바꾼다.
  moon.x += moon.speed;
  if (moon.x - moon.radius > canvas.width) {
    moon.x = -moon.radius;
  }

  for (const star of stars) {
    star.y += star.speed;
    if (star.y - star.radius > skyHeight) {
      star.y = -star.radius;
    }
  }

  for (const button of buttons) {
    const targetScale = button.isHovered ? buttonHoverScale : 1;
    if (button.animationTargetScale !== targetScale) {
      button.animationTargetScale = targetScale;
      button.animationElapsedMs = 0;
    }

    if (button.scale !== targetScale) {
      button.animationElapsedMs += deltaTime;
      const scaleChange = button.scaleSpeed * deltaTime;

      if (button.animationElapsedMs >= button.animationDurationMs) {
        button.scale = targetScale;
      } else if (button.scale < targetScale) {
        button.scale = Math.min(button.scale + scaleChange, targetScale);
      } else {
        button.scale = Math.max(button.scale - scaleChange, targetScale);
      }
    } else {
      button.animationElapsedMs = 0;
    }
  }

  // 패널 폭을 목표 폭까지 일정한 속도로 부드럽게 이동시킨다.
  const targetHintPanelWidth = isHintPanelExpanded
    ? hintPanelExpandedWidth
    : hintPanelCollapsedWidth;
  const panelWidthChange = hintPanelExpandSpeed * deltaTime;
  if (hintPanelWidth < targetHintPanelWidth) {
    hintPanelWidth = Math.min(
      hintPanelWidth + panelWidthChange,
      targetHintPanelWidth,
    );
  } else if (hintPanelWidth > targetHintPanelWidth) {
    hintPanelWidth = Math.max(
      hintPanelWidth - panelWidthChange,
      targetHintPanelWidth,
    );
  }

  // 설정한 속도로 원을 키우고, 최대 반지름에 도달한 효과는 제거한다.
  for (let i = clickRipples.length - 1; i >= 0; i -= 1) {
    clickRipples[i].radius += clickRippleSpeed * deltaTime;
    if (clickRipples[i].radius >= clickRippleMaxRadius) {
      clickRipples.splice(i, 1);
    }
  }

  // 배경과 다른 UI를 그린 뒤 힌트 패널을 마지막에 그려 항상 위에 표시한다.
  drawBackground();
  drawGameUI();
  drawClickRipples();
  drawHintPanel();

  requestAnimationFrame(gameLoop);
}

initializeGame();
gameLoop();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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

function drawGameUI() {
  // 힌트 목록의 배경 상자와 제목을 그린다.
  ctx.fillStyle = "#f3ead5";
  ctx.fillRect(20, 20, 100, 450);
  ctx.fillStyle = "#29232d";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("힌트 목록", 70, 34);

  // 장소, 도구, 동기 항목을 세로로 배치한다.
  const hints = ["장소", "도구", "동기"];
  for (let i = 0; i < hints.length; i += 1) {
    const boxY = 55 + i * 70;

    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(25, boxY, 90, 50);
    ctx.strokeStyle = "#b7aa91";
    ctx.lineWidth = 1;
    ctx.strokeRect(25, boxY, 90, 50);

    ctx.fillStyle = "#29232d";
    ctx.font = "16px sans-serif";
    ctx.fillText(hints[i], 70, boxY + 25);
  }

  // 힌트 목록의 스크롤 바를 그린다.
  ctx.fillStyle = "#d6cbb7";
  ctx.fillRect(112, 55, 4, 400);
  ctx.fillStyle = "#8c806e";
  ctx.fillRect(112, 55, 4, 95);

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
  const suspectCenters = [230, 370, 510, 650];
  const suspectColors = ["#5b83a6", "#a65b5b", "#6b8c65", "#8a6b9b"];
  for (let i = 0; i < suspectCenters.length; i += 1) {
    const centerX = suspectCenters[i];
    const bubbleX = centerX - 65;
    const bubbleY = 145;

    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, 130, 100, 10);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#24202b";
    ctx.font = "16px sans-serif";
    ctx.fillText("용의자 정보", centerX, bubbleY + 50);

    ctx.fillStyle = "#e7bd99";
    ctx.beginPath();
    ctx.arc(centerX, 270, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = suspectColors[i];
    ctx.fillRect(centerX - 15, 300, 30, 50);
  }

  // 화면 아래쪽에 동작 버튼을 그린다.
  for (const button of buttons) {
    drawRoundedButton(button);
  }
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

  // 그리기: 배경을 먼저, UI와 게임 오브젝트를 나중에 그린다.
  drawBackground();
  drawGameUI();

  requestAnimationFrame(gameLoop);
}

gameLoop();

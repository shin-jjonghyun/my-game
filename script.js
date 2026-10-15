const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 화면 위쪽은 짙은 푸른색, 아래쪽은 짙은 보라색으로 칠한다.
ctx.fillStyle = "#14233f";
ctx.fillRect(0, 0, 800, 450);
ctx.fillStyle = "#302044";
ctx.fillRect(0, 450, 800, 150);

// 힌트 목록의 배경 박스를 그린다.
ctx.fillStyle = "#f3ead5";
ctx.fillRect(20, 20, 100, 450);

// 힌트 목록 제목을 쓴다.
ctx.fillStyle = "#29232d";
ctx.font = "bold 14px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("힌트 목록", 70, 34);

// 장소, 도구, 동기 항목을 세로로 배치한다.
const hints = ["장소", "도구", "동기"];
for (let i = 0; i < hints.length; i += 1) {
  const boxY = 55 + i * 70;

  // 각 힌트 항목의 테두리와 배경을 그린다.
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(25, boxY, 90, 50);
  ctx.strokeStyle = "#b7aa91";
  ctx.lineWidth = 1;
  ctx.strokeRect(25, boxY, 90, 50);

  // 힌트 항목의 이름을 가운데에 쓴다.
  ctx.fillStyle = "#29232d";
  ctx.font = "16px sans-serif";
  ctx.fillText(hints[i], 70, boxY + 25);
}

// 힌트 목록 오른쪽에 스크롤 바 모양을 그린다.
ctx.fillStyle = "#d6cbb7";
ctx.fillRect(112, 55, 4, 400);
ctx.fillStyle = "#8c806e";
ctx.fillRect(112, 55, 4, 95);

// 남은 기회와 추가 힌트 표시용 타원을 그린다.
ctx.fillStyle = "#fff";
ctx.beginPath();
ctx.ellipse(400, 55, 50, 35, 0, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.ellipse(730, 55, 50, 35, 0, 0, Math.PI * 2);
ctx.fill();

// 각 타원 안에 기본 개수를 표시한다.
ctx.fillStyle = "#24202b";
ctx.font = "13px sans-serif";
ctx.fillText("남은 기회: 2", 400, 55);
ctx.fillText("추가 힌트: 2", 730, 55);

// 네 명의 용의자를 머리와 몸으로 그린다.
const suspectCenters = [230, 370, 510, 650];
for (let i = 0; i < suspectCenters.length; i += 1) {
  const centerX = suspectCenters[i];
  const bubbleX = centerX - 65;
  const bubbleY = 145;

  // 용의자 머리 위에 130x100 크기의 흰색 둥근 말풍선 상자를 그린다.
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, 130, 100, 10);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // 말풍선 가운데에 용의자 정보 문구를 쓴다.
  ctx.fillStyle = "#24202b";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("용의자 정보", centerX, bubbleY + 50);

  // 용의자의 머리를 원으로 그린다.
  ctx.fillStyle = "#e7bd99";
  ctx.beginPath();
  ctx.arc(centerX, 270, 25, 0, Math.PI * 2);
  ctx.fill();

  // 용의자의 몸을 직사각형으로 그린다.
  ctx.fillStyle = ["#5b83a6", "#a65b5b", "#6b8c65", "#8a6b9b"][i];
  ctx.fillRect(centerX - 15, 300, 30, 50);
}

// 모서리가 둥근 버튼 모양을 그리는 함수다.
function drawRoundedButton(x, y, width, height, label) {
  const radius = 10;

  // 둥근 사각형 경로를 만든다.
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

  // 흰색 버튼과 가운데 정렬된 글자를 그린다.
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = "#24202b";
  ctx.font = "16px sans-serif";
  ctx.fillText(label, x + width / 2, y + height / 2);
}

// 화면 아래쪽에 두 버튼을 그린다.
drawRoundedButton(350, 500, 100, 70, "범인 잡기");
drawRoundedButton(680, 500, 100, 70, "단서 특정");

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
const attributeCategories = {
  복수: ["쓰라린", "격렬한"],
  "금전 문제": ["탐욕스러운", "비밀스러운"],
  질투: ["쓰라린", "비밀스러운"],
  "비밀 은폐": ["비밀스러운", "어두운"],
  권력욕: ["야심 찬", "격렬한"],
  "오랜 원한": ["쓰라린", "오래된"],
  협박: ["위협적인", "어두운"],
  "상속 다툼": ["탐욕스러운", "격렬한"],
  배신감: ["쓰라린", "비밀스러운"],
  "명예 훼손": ["모욕적인", "격렬한"],
  서재: ["고요한", "비밀스러운"],
  도서관: ["고요한", "오래된"],
  정원: ["꽃이 핀", "고요한"],
  주방: ["분주한", "뜨거운"],
  창고: ["어두운", "먼지 쌓인"],
  연구실: ["비밀스러운", "어두운"],
  온실: ["습한", "꽃이 핀"],
  지하실: ["어두운", "으슥한"],
  복도: ["긴", "고요한"],
  응접실: ["화려한", "분주한"],
  옥상: ["탁 트인", "외딴"],
  차고: ["어수선한", "먼지 쌓인"],
  작업실: ["먼지 쌓인", "어수선한"],
  별관: ["외딴", "으슥한"],
  음악실: ["울림 있는", "고요한"],
  촛대: ["묵직한", "쓰라린"],
  편지칼: ["날카로운", "쓰라린"],
  독약: ["치명적인", "어두운"],
  밧줄: ["질긴", "위협적인"],
  망치: ["무거운", "격렬한"],
  권총: ["장전된", "위협적인"],
  약병: ["작은", "비밀스러운"],
  장식품: ["깨지기 쉬운", "화려한"],
  와인잔: ["깨끗한", "화려한"],
  가위: ["날 선", "날카로운"],
  드라이버: ["단단한", "무거운"],
  열쇠: ["낡은", "비밀스러운"],
  향수병: ["향기로운", "화려한"],
  트로피: ["반짝이는", "야심 찬"],
  책: ["두꺼운", "오래된"],
};

function categorizeAttribute(value) {
  const categories = attributeCategories[value];
  if (!categories || categories.length < 2) {
    throw new Error(`속성 카테고리를 찾을 수 없습니다: ${value}`);
  }
  return { value, categories };
}

function categorizeWord(word) {
  return {
    ...word,
    categories: attributeCategories[word.value] || [],
  };
}

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
].map(categorizeAttribute);
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
].map(categorizeAttribute);
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
].map(categorizeAttribute);
const suspects = [
  { x: 270, color: "#5b83a6", motive: "", location: "", item: "", isHovered: false },
  { x: 410, color: "#a65b5b", motive: "", location: "", item: "", isHovered: false },
  { x: 550, color: "#6b8c65", motive: "", location: "", item: "", isHovered: false },
  { x: 690, color: "#8a6b9b", motive: "", location: "", item: "", isHovered: false },
];
let culpritSuspect = null;
let availableHintClues = [];
let hintClues = [];
let choiceResult = "";
let choiceResultElapsedMs = 0;
const choiceResultDurationMs = 2000;
const choiceResultBounceDurationMs = 800;
const initialChances = 2;
let remainingChances = initialChances;
const initialAdditionalHints = 2;
let remainingAdditionalHints = initialAdditionalHints;
const GameState = {
  GAME_WAITING: "GameWaiting",
  HINT_WAITING: "HintWaiting",
  PLAYING: "Playing",
  CHOICE: "Choice",
  GAME_OVER: "GameOver",
  EXITED: "Exited",
};
let gameState = GameState.GAME_WAITING;

const clueColors = {
  motive: "#c62828",
  item: "#1565c0",
  location: "#b8860b",
};

// 각 단어는 어떤 용의자 속성을 설명하는지 함께 저장한다.
const adjectiveWords = [
  { word: "쓰라린", category: "motive", value: "복수" },
  { word: "탐욕스러운", category: "motive", value: "금전 문제" },
  { word: "질투심 어린", category: "motive", value: "질투" },
  { word: "필사적인", category: "motive", value: "비밀 은폐" },
  { word: "야심 찬", category: "motive", value: "권력욕" },
  { word: "오래된", category: "motive", value: "오랜 원한" },
  { word: "위협적인", category: "motive", value: "협박" },
  { word: "격렬한", category: "motive", value: "상속 다툼" },
  { word: "배신당한", category: "motive", value: "배신감" },
  { word: "모욕적인", category: "motive", value: "명예 훼손" },
  { word: "고요한", category: "location", value: "서재" },
  { word: "한적한", category: "location", value: "도서관" },
  { word: "꽃이 핀", category: "location", value: "정원" },
  { word: "분주한", category: "location", value: "주방" },
  { word: "어두운", category: "location", value: "창고" },
  { word: "비밀스러운", category: "location", value: "연구실" },
  { word: "습한", category: "location", value: "온실" },
  { word: "으슥한", category: "location", value: "지하실" },
  { word: "긴", category: "location", value: "복도" },
  { word: "화려한", category: "location", value: "응접실" },
  { word: "탁 트인", category: "location", value: "옥상" },
  { word: "어수선한", category: "location", value: "차고" },
  { word: "먼지 쌓인", category: "location", value: "작업실" },
  { word: "외딴", category: "location", value: "별관" },
  { word: "울림 있는", category: "location", value: "음악실" },
  { word: "묵직한", category: "item", value: "촛대" },
  { word: "날카로운", category: "item", value: "편지칼" },
  { word: "치명적인", category: "item", value: "독약" },
  { word: "질긴", category: "item", value: "밧줄" },
  { word: "무거운", category: "item", value: "망치" },
  { word: "장전된", category: "item", value: "권총" },
  { word: "작은", category: "item", value: "약병" },
  { word: "깨지기 쉬운", category: "item", value: "장식품" },
  { word: "깨끗한", category: "item", value: "와인잔" },
  { word: "날 선", category: "item", value: "가위" },
  { word: "단단한", category: "item", value: "드라이버" },
  { word: "낡은", category: "item", value: "열쇠" },
  { word: "향기로운", category: "item", value: "향수병" },
  { word: "반짝이는", category: "item", value: "트로피" },
  { word: "두꺼운", category: "item", value: "책" },
  { word: "수상한", category: "extra", value: "" },
  { word: "희미한", category: "extra", value: "" },
  { word: "낯선", category: "extra", value: "" },
  { word: "조용한", category: "extra", value: "" },
  { word: "불길한", category: "extra", value: "" },
].map(categorizeWord);
const nounWords = [
  { word: "파문", category: "motive", value: "복수" },
  { word: "안개", category: "motive", value: "금전 문제" },
  { word: "여백", category: "motive", value: "질투" },
  { word: "메아리", category: "motive", value: "비밀 은폐" },
  { word: "윤곽", category: "motive", value: "권력욕" },
  { word: "기척", category: "motive", value: "오랜 원한" },
  { word: "잔향", category: "motive", value: "협박" },
  { word: "진동", category: "motive", value: "상속 다툼" },
  { word: "기류", category: "motive", value: "배신감" },
  { word: "불씨", category: "motive", value: "명예 훼손" },
  { word: "지평선", category: "location", value: "서재" },
  { word: "별자리", category: "location", value: "도서관" },
  { word: "물비늘", category: "location", value: "정원" },
  { word: "낙차", category: "location", value: "주방" },
  { word: "풍경", category: "location", value: "창고" },
  { word: "서리", category: "location", value: "연구실" },
  { word: "물결", category: "location", value: "온실" },
  { word: "구름", category: "location", value: "지하실" },
  { word: "숨결", category: "location", value: "복도" },
  { word: "온도", category: "location", value: "응접실" },
  { word: "그늘", category: "location", value: "옥상" },
  { word: "모래", category: "location", value: "차고" },
  { word: "소용돌이", category: "location", value: "작업실" },
  { word: "빛무리", category: "location", value: "별관" },
  { word: "계절", category: "location", value: "음악실" },
  { word: "시차", category: "item", value: "촛대" },
  { word: "수평선", category: "item", value: "편지칼" },
  { word: "표류", category: "item", value: "독약" },
  { word: "기상", category: "item", value: "밧줄" },
  { word: "장막", category: "item", value: "망치" },
  { word: "시간", category: "item", value: "권총" },
  { word: "파장", category: "item", value: "약병" },
  { word: "노을", category: "item", value: "장식품" },
  { word: "반사", category: "item", value: "와인잔" },
  { word: "얼룩", category: "item", value: "가위" },
  { word: "무늬", category: "item", value: "드라이버" },
  { word: "잔상", category: "item", value: "열쇠" },
  { word: "음영", category: "item", value: "향수병" },
  { word: "공간", category: "item", value: "트로피" },
  { word: "침묵", category: "item", value: "책" },
  { word: "도약", category: "extra", value: "" },
  { word: "방향", category: "extra", value: "" },
  { word: "단계", category: "extra", value: "" },
  { word: "순환", category: "extra", value: "" },
  { word: "균형", category: "extra", value: "" },
].map(categorizeWord);

// 각 버튼의 원래 위치와 크기, 확대 속도와 애니메이션 시간을 저장한다.
const buttonHoverScale = 1.1;
const buttons = [
  {
    x: 290,
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
];
const additionalHintButton = {
  x: 410,
  y: 500,
  width: 100,
  height: 70,
  label: "추가 힌트",
  scale: 1,
  scaleSpeed: buttons[0].scaleSpeed,
  animationDurationMs: buttons[0].animationDurationMs,
  animationElapsedMs: 0,
  animationTargetScale: 1,
  isHovered: false,
};
const gameOverButtons = [
  {
    x: 220,
    y: 370,
    width: 160,
    height: 60,
    label: "다시 하기",
    scale: 1,
    scaleSpeed: buttons[0].scaleSpeed,
    animationDurationMs: buttons[0].animationDurationMs,
    animationElapsedMs: 0,
    animationTargetScale: 1,
    isHovered: false,
  },
  {
    x: 420,
    y: 370,
    width: 160,
    height: 60,
    label: "게임 종료",
    scale: 1,
    scaleSpeed: buttons[0].scaleSpeed,
    animationDurationMs: buttons[0].animationDurationMs,
    animationElapsedMs: 0,
    animationTargetScale: 1,
    isHovered: false,
  },
];
const hintChoiceButtons = [
  {
    x: 120,
    y: 370,
    width: 160,
    height: 60,
    category: "motive",
    label: "동기",
  },
  {
    x: 320,
    y: 370,
    width: 160,
    height: 60,
    category: "location",
    label: "장소",
  },
  {
    x: 520,
    y: 370,
    width: 160,
    height: 60,
    category: "item",
    label: "도구",
  },
].map((button) => ({
  ...button,
  scale: 1,
  scaleSpeed: buttons[0].scaleSpeed,
  animationDurationMs: buttons[0].animationDurationMs,
  animationElapsedMs: 0,
  animationTargetScale: 1,
  isHovered: false,
}));
const hintPanelToggleButton = {
  radius: 14,
  scale: 1,
  scaleSpeed: buttons[0].scaleSpeed,
  animationDurationMs: buttons[0].animationDurationMs,
  animationElapsedMs: 0,
  animationTargetScale: 1,
  isHovered: false,
};
const choiceCancelButton = {
  x: 730,
  y: 520,
  width: 50,
  height: 50,
  scale: 1,
  scaleSpeed: buttons[0].scaleSpeed,
  animationDurationMs: buttons[0].animationDurationMs,
  animationElapsedMs: 0,
  animationTargetScale: 1,
  isHovered: false,
};
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
  const assignedMotives = assignRelatedAttributes(motiveTypes);
  const assignedLocations = assignRelatedAttributes(locationTypes);
  const assignedItems = assignRelatedAttributes(itemTypes);

  for (let i = 0; i < suspects.length; i += 1) {
    suspects[i].motive = assignedMotives[i];
    suspects[i].location = assignedLocations[i];
    suspects[i].item = assignedItems[i];
  }

  // 게임마다 용의자 한 명을 범인으로 지정해 내부 변수에만 보관한다.
  culpritSuspect = suspects[Math.floor(Math.random() * suspects.length)];

  const targets = [
    { category: "motive", label: "동기", value: culpritSuspect.motive },
    { category: "item", label: "도구", value: culpritSuspect.item },
    { category: "location", label: "장소", value: culpritSuspect.location },
  ];
  const selectedAdjectives = selectNineWords(adjectiveWords, targets);
  const selectedNouns = selectNineWords(nounWords, targets);

  // 범인의 세 속성에 맞는 형용사와 명사를 조합해 힌트 문장을 만든다.
  availableHintClues = targets.map((target) => {
    const adjective = selectedAdjectives.find(
      (word) => word.category === target.category && word.value === target.value,
    );
    const noun = selectedNouns.find(
      (word) => word.category === target.category && word.value === target.value,
    );
    return {
      category: target.category,
      label: target.label,
      text: `${adjective.word} ${noun.word}`,
    };
  });
}

function startNewGame() {
  remainingChances = initialChances;
  remainingAdditionalHints = initialAdditionalHints;
  choiceResult = "";
  choiceResultElapsedMs = 0;
  hintClues = [];
  gameState = GameState.GAME_WAITING;
  for (const button of gameOverButtons) {
    button.isHovered = false;
    button.scale = 1;
    button.animationTargetScale = 1;
    button.animationElapsedMs = 0;
  }
  for (const suspect of suspects) {
    suspect.isHovered = false;
  }
  for (const button of hintChoiceButtons) {
    button.isHovered = false;
    button.scale = 1;
    button.animationTargetScale = 1;
    button.animationElapsedMs = 0;
  }
  initializeGame();
}

function chooseStartingHint(category) {
  const selectedHint = availableHintClues.find(
    (clue) => clue.category === category,
  );
  if (!selectedHint) {
    throw new Error(`선택한 종류의 힌트를 찾을 수 없습니다: ${category}`);
  }

  if (gameState === GameState.GAME_WAITING) {
    hintClues = [selectedHint];
  } else if (gameState === GameState.HINT_WAITING) {
    if (hintClues.some((clue) => clue.category === category)) {
      return;
    }
    hintClues.push(selectedHint);
  } else {
    return;
  }

  gameState = GameState.PLAYING;
  for (const button of hintChoiceButtons) {
    button.isHovered = false;
  }
}

function getAvailableHintChoiceButtons() {
  if (gameState !== GameState.HINT_WAITING) {
    return hintChoiceButtons;
  }

  return hintChoiceButtons.filter(
    (button) =>
      !hintClues.some((clue) => clue.category === button.category) &&
      availableHintClues.some((clue) => clue.category === button.category),
  );
}

function assignRelatedAttributes(attributes) {
  if (suspects.length % 2 !== 0) {
    throw new Error("유사 카테고리 배정에는 짝수의 용의자가 필요합니다.");
  }

  const relatedPairs = findRelatedPairs(attributes, suspects.length / 2);
  if (!relatedPairs) {
    throw new Error("용의자에게 배정할 유사 카테고리 조합을 찾을 수 없습니다.");
  }

  return shuffle(relatedPairs.flatMap((pair) => pair.values))
    .slice(0, suspects.length)
    .map((attribute) => attribute.value);
}

function findRelatedPairs(attributes, pairCount) {
  if (pairCount === 0) {
    return [];
  }

  const candidatePairs = [];
  for (let firstIndex = 0; firstIndex < attributes.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < attributes.length;
      secondIndex += 1
    ) {
      const first = attributes[firstIndex];
      const second = attributes[secondIndex];
      const hasSharedCategory = first.categories.some((category) =>
        second.categories.includes(category),
      );
      if (hasSharedCategory) {
        candidatePairs.push({ values: [first, second] });
      }
    }
  }

  for (const pair of shuffle(candidatePairs)) {
    const remainingAttributes = attributes.filter(
      (attribute) => !pair.values.includes(attribute),
    );
    const remainingPairs = findRelatedPairs(remainingAttributes, pairCount - 1);
    if (remainingPairs) {
      return [pair, ...remainingPairs];
    }
  }

  return null;
}

function selectNineWords(words, targets) {
  const requiredWords = targets.map((target) => {
    const word = words.find(
      (candidate) =>
        candidate.category === target.category && candidate.value === target.value,
    );
    if (!word) {
      throw new Error(
        `힌트 단어를 찾을 수 없습니다: ${target.category} - ${target.value}`,
      );
    }
    return word;
  });
  const remainingWords = words.filter((word) => !requiredWords.includes(word));
  return shuffle([...requiredWords, ...shuffle(remainingWords).slice(0, 6)]);
}

// 왼쪽 클릭 위치를 캔버스 좌표로 저장해 원형 확산 효과를 시작한다.
canvas.addEventListener("click", (event) => {
  if (event.button !== 0 || gameState === GameState.EXITED) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

  if (
    gameState === GameState.PLAYING ||
    gameState === GameState.CHOICE
  ) {
    clickRipples.push({
      x: mouseX,
      y: mouseY,
      radius: 0,
    });
  }

  if (
    gameState === GameState.GAME_WAITING ||
    gameState === GameState.HINT_WAITING
  ) {
    const selectedButton = getAvailableHintChoiceButtons().find((button) =>
      isPointInsideButton(mouseX, mouseY, button),
    );
    if (selectedButton) {
      chooseStartingHint(selectedButton.category);
    }
  } else if (gameState === GameState.PLAYING || gameState === GameState.CHOICE) {
    // 패널 오른쪽 가장자리의 화살표 버튼을 누르면 펼침 상태를 전환한다.
    const toggleButtonX = hintPanelX + hintPanelWidth;
    const toggleButtonY = hintPanelY + 225;
    const distanceX = mouseX - toggleButtonX;
    const distanceY = mouseY - toggleButtonY;
    if (
      distanceX ** 2 + distanceY ** 2 <=
      (hintPanelToggleButton.radius * hintPanelToggleButton.scale) ** 2
    ) {
      isHintPanelExpanded = !isHintPanelExpanded;
    }
  }

  if (gameState === GameState.GAME_OVER) {
    const selectedButton = gameOverButtons.find((button) =>
      isPointInsideButton(mouseX, mouseY, button),
    );
    if (selectedButton === gameOverButtons[0]) {
      startNewGame();
    } else if (selectedButton === gameOverButtons[1]) {
      choiceResult = "";
      gameState = GameState.EXITED;
    }
  } else if (
    gameState === GameState.PLAYING &&
    isPointInsideButton(mouseX, mouseY, buttons[0])
  ) {
    choiceResult = "";
    gameState = GameState.CHOICE;
    buttons[0].isHovered = false;
  } else if (
    gameState === GameState.PLAYING &&
    isPointInsideButton(mouseX, mouseY, additionalHintButton) &&
    remainingAdditionalHints > 0 &&
    getAvailableHintChoiceButtons().length > 0
  ) {
    remainingAdditionalHints -= 1;
    choiceResult = "";
    gameState = GameState.HINT_WAITING;
    additionalHintButton.isHovered = false;
  } else if (
    gameState === GameState.CHOICE &&
    isPointInsideButton(mouseX, mouseY, choiceCancelButton)
  ) {
    gameState = GameState.PLAYING;
    choiceCancelButton.isHovered = false;
  } else if (gameState === GameState.CHOICE) {
    const selectedSuspect = suspects.find((suspect) =>
      isPointOverSuspect(mouseX, mouseY, suspect),
    );
    if (selectedSuspect) {
      choiceResult = selectedSuspect === culpritSuspect ? "정답" : "오답";
      choiceResultElapsedMs = 0;
      if (choiceResult === "오답") {
        remainingChances -= 1;
        if (remainingChances === 0) {
          gameState = GameState.GAME_OVER;
        }
      }
    }
  }
});

// 마우스 위치를 캔버스 좌표로 바꾸고 확대된 버튼 영역까지 확인한다.
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

  for (const button of buttons) {
    button.isHovered =
      gameState === GameState.PLAYING &&
      isPointInsideButton(mouseX, mouseY, button);
  }
  additionalHintButton.isHovered =
    gameState === GameState.PLAYING &&
    remainingAdditionalHints > 0 &&
    isPointInsideButton(mouseX, mouseY, additionalHintButton);
  for (const button of gameOverButtons) {
    button.isHovered =
      gameState === GameState.GAME_OVER &&
      isPointInsideButton(mouseX, mouseY, button);
  }
  for (const button of hintChoiceButtons) {
    button.isHovered =
      (gameState === GameState.GAME_WAITING ||
        gameState === GameState.HINT_WAITING) &&
      getAvailableHintChoiceButtons().includes(button) &&
      isPointInsideButton(mouseX, mouseY, button);
  }

  const toggleButtonX = hintPanelX + hintPanelWidth;
  const toggleButtonY = hintPanelY + 225;
  const toggleDistanceX = mouseX - toggleButtonX;
  const toggleDistanceY = mouseY - toggleButtonY;
  hintPanelToggleButton.isHovered =
    toggleDistanceX ** 2 + toggleDistanceY ** 2 <=
    (hintPanelToggleButton.radius * hintPanelToggleButton.scale) ** 2;
  choiceCancelButton.isHovered =
    gameState === GameState.CHOICE &&
    isPointInsideButton(mouseX, mouseY, choiceCancelButton);
  for (const suspect of suspects) {
    suspect.isHovered =
      gameState === GameState.CHOICE &&
      isPointOverSuspect(mouseX, mouseY, suspect);
  }
});

// 캔버스를 벗어나면 확대 상태를 해제해 버튼 크기를 원래대로 돌린다.
canvas.addEventListener("mouseleave", () => {
  for (const button of buttons) {
    button.isHovered = false;
  }
  additionalHintButton.isHovered = false;
  for (const button of gameOverButtons) {
    button.isHovered = false;
  }
  for (const button of hintChoiceButtons) {
    button.isHovered = false;
  }
  hintPanelToggleButton.isHovered = false;
  choiceCancelButton.isHovered = false;
  for (const suspect of suspects) {
    suspect.isHovered = false;
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

function isPointInsideButton(x, y, button) {
  const scaledWidth = button.width * button.scale;
  const scaledHeight = button.height * button.scale;
  return (
    x >= button.x + button.width / 2 - scaledWidth / 2 &&
    x <= button.x + button.width / 2 + scaledWidth / 2 &&
    y >= button.y + button.height / 2 - scaledHeight / 2 &&
    y <= button.y + button.height / 2 + scaledHeight / 2
  );
}

function isPointOverSuspect(x, y, suspect) {
  const headDistanceX = x - suspect.x;
  const headDistanceY = y - 270;
  const isOverHead = headDistanceX ** 2 + headDistanceY ** 2 <= 25 ** 2;
  const isOverBody =
    x >= suspect.x - 15 &&
    x <= suspect.x + 15 &&
    y >= 300 &&
    y <= 350;

  return isOverHead || isOverBody;
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

  // 시작 시 선택한 범인 속성의 힌트만 표시한다.
  for (let i = 0; i < hintClues.length; i += 1) {
    const boxY = 55 + i * 70;

    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(25, boxY, hintPanelWidth - 10, 50);
    ctx.strokeStyle = "#b7aa91";
    ctx.lineWidth = 1;
    ctx.strokeRect(25, boxY, hintPanelWidth - 10, 50);

    ctx.fillStyle = clueColors[hintClues[i].category];
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(hintClues[i].label, hintPanelX + hintPanelWidth / 2, boxY + 13);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = clueColors[hintClues[i].category];
    const clueLines = wrapText(hintClues[i].text, hintPanelWidth - 20);
    for (let lineIndex = 0; lineIndex < clueLines.length; lineIndex += 1) {
      ctx.fillText(
        clueLines[lineIndex],
        hintPanelX + hintPanelWidth / 2,
        boxY + 32 + lineIndex * 12,
      );
    }
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
  ctx.save();
  ctx.translate(toggleButtonX, toggleButtonY);
  ctx.scale(hintPanelToggleButton.scale, hintPanelToggleButton.scale);
  ctx.beginPath();
  ctx.arc(0, 0, hintPanelToggleButton.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#8c806e";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(isHintPanelExpanded ? "<" : ">", 0, 0);
  ctx.restore();
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

function wrapColoredText(segments, maxWidth) {
  const lines = [[]];
  let lineWidth = 0;

  for (const segment of segments) {
    for (const character of segment.text) {
      const characterWidth = ctx.measureText(character).width;
      if (lineWidth + characterWidth > maxWidth && lineWidth > 0) {
        lines.push([]);
        lineWidth = 0;
      }

      const currentLine = lines[lines.length - 1];
      const previousSegment = currentLine[currentLine.length - 1];
      if (previousSegment && previousSegment.color === segment.color) {
        previousSegment.text += character;
      } else {
        currentLine.push({ text: character, color: segment.color });
      }
      lineWidth += characterWidth;
    }
  }

  return lines;
}

function drawGameUI() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (gameState === GameState.EXITED) {
    ctx.fillStyle = "#101827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("게임을 종료했습니다.", canvas.width / 2, canvas.height / 2);
    return;
  }

  if (
    gameState === GameState.GAME_WAITING ||
    gameState === GameState.HINT_WAITING
  ) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(
      gameState === GameState.GAME_WAITING
        ? "시작 힌트를 선택하세요"
        : "추가로 받을 힌트를 선택하세요",
      canvas.width / 2,
      235,
    );
    ctx.font = "18px sans-serif";
    ctx.fillText(
      "동기, 장소, 도구 중 하나의 힌트를 받습니다.",
      canvas.width / 2,
      290,
    );
    if (gameState === GameState.HINT_WAITING) {
      ctx.font = "15px sans-serif";
      ctx.fillText(
        `남은 추가 힌트: ${remainingAdditionalHints}`,
        canvas.width / 2,
        325,
      );
    }
    for (const button of getAvailableHintChoiceButtons()) {
      drawRoundedButton(button);
    }
    return;
  }

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
  ctx.fillText(`남은 기회: ${remainingChances}`, 400, 55);
  ctx.fillText(`추가 힌트: ${remainingAdditionalHints}`, 730, 55);
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
    ctx.font = "10px sans-serif";
    const alibiLines = wrapColoredText(
      [
        { text: "저는 사건 당시 " },
        { text: suspect.location, color: clueColors.location },
        { text: "에 있었고 " },
        { text: `${suspect.item}${itemParticle}`, color: clueColors.item },
        { text: " 가지고 있었습니다. 피해자와는 " },
        { text: suspect.motive, color: clueColors.motive },
        { text: "로 인한 문제가 있었습니다." },
      ],
      114,
    );
    for (let lineIndex = 0; lineIndex < alibiLines.length; lineIndex += 1) {
      const line = alibiLines[lineIndex];
      const lineWidth = line.reduce(
        (width, segment) => width + ctx.measureText(segment.text).width,
        0,
      );
      let textX = centerX - lineWidth / 2;
      for (const segment of line) {
        ctx.fillStyle = segment.color || "#24202b";
        ctx.textAlign = "left";
        ctx.fillText(segment.text, textX, bubbleY + 34 + lineIndex * 12);
        textX += ctx.measureText(segment.text).width;
      }
    }
    ctx.textAlign = "center";

    ctx.fillStyle = "#e7bd99";
    ctx.beginPath();
    ctx.arc(centerX, 270, 25, 0, Math.PI * 2);
    ctx.fill();
    if (gameState === GameState.CHOICE && suspect.isHovered) {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = suspect.color;
    ctx.fillRect(centerX - 15, 300, 30, 50);
    if (gameState === GameState.CHOICE && suspect.isHovered) {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3;
      ctx.strokeRect(centerX - 15, 300, 30, 50);
    }
  }

  if (gameState === GameState.GAME_OVER) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ff8a80";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("게임 오버", canvas.width / 2, 270);
    ctx.fillStyle = "#fff";
    ctx.font = "18px sans-serif";
    ctx.fillText("남은 기회를 모두 사용했습니다.", canvas.width / 2, 320);
    for (const button of gameOverButtons) {
      drawRoundedButton(button);
    }
  } else if (gameState === GameState.PLAYING) {
    // Playing 상태에서만 범인 지목 버튼을 표시한다.
    for (const button of buttons) {
      drawRoundedButton(button);
    }
    drawRoundedButton(additionalHintButton);
  } else if (gameState === GameState.CHOICE) {
    // Choice 상태에서는 지목 안내와 취소 버튼만 표시한다.
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("범인을 지목하세요", canvas.width / 2, 575);

    ctx.save();
    ctx.translate(
      choiceCancelButton.x + choiceCancelButton.width / 2,
      choiceCancelButton.y + choiceCancelButton.height / 2,
    );
    ctx.scale(choiceCancelButton.scale, choiceCancelButton.scale);
    ctx.fillStyle = "#a65b5b";
    ctx.fillRect(
      -choiceCancelButton.width / 2,
      -choiceCancelButton.height / 2,
      choiceCancelButton.width,
      choiceCancelButton.height,
    );
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("X", 0, 0);
    ctx.restore();
  }

  if (choiceResult) {
    const animationProgress = Math.min(
      choiceResultElapsedMs / choiceResultBounceDurationMs,
      1,
    );
    const bounceProgress = easeOutBounce(animationProgress);
    const resultY = -30 + (105 + 30) * bounceProgress;
    ctx.fillStyle = choiceResult === "정답" ? "#8de38d" : "#ff8a80";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(choiceResult, canvas.width / 2, resultY);
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

  if (choiceResult) {
    choiceResultElapsedMs += deltaTime;
    if (choiceResultElapsedMs >= choiceResultDurationMs) {
      choiceResult = "";
      choiceResultElapsedMs = 0;
    }
  }

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

  for (const button of [
    ...buttons,
    additionalHintButton,
    ...gameOverButtons,
    ...hintChoiceButtons,
    hintPanelToggleButton,
    choiceCancelButton,
  ]) {
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
  if (gameState === GameState.EXITED) {
    return;
  }
  if (
    gameState === GameState.PLAYING ||
    gameState === GameState.CHOICE
  ) {
    drawClickRipples();
    drawHintPanel();
  }

  requestAnimationFrame(gameLoop);
}

function easeOutBounce(progress) {
  const bounceScale = 7.5625;
  const bounceDuration = 2.75;

  if (progress < 1 / bounceDuration) {
    return bounceScale * progress ** 2;
  }
  if (progress < 2 / bounceDuration) {
    const adjustedProgress = progress - 1.5 / bounceDuration;
    return bounceScale * adjustedProgress ** 2 + 0.75;
  }
  if (progress < 2.5 / bounceDuration) {
    const adjustedProgress = progress - 2.25 / bounceDuration;
    return bounceScale * adjustedProgress ** 2 + 0.9375;
  }

  const adjustedProgress = progress - 2.625 / bounceDuration;
  return bounceScale * adjustedProgress ** 2 + 0.984375;
}

initializeGame();
gameLoop();

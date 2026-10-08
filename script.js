const nameHeading = document.querySelector("#name");

if (nameHeading) {
  document.title = `${nameHeading.textContent.trim()} | 자기소개`;
}

const todayDate = document.querySelector("#today-date");

if (todayDate) {
  const now = new Date();
  const localDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  todayDate.dateTime = localDate;
  todayDate.textContent = `현재 날짜: ${new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now)}`;
}
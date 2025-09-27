const list = document.querySelector(".filter__list");
const items = document.querySelectorAll(".filter__item");
const cards = document.querySelectorAll(".card");

function filter() {
  const lists = document.querySelectorAll(".filter__list");

  lists.forEach((list) => {
    list.addEventListener("click", (event) => {
      const item = event.target;
      if (!item.classList.contains("filter__item")) return;

      const type = item.dataset.type; // "seed" или "time"
      const value = item.dataset.value; // "arabica", "morning" и т.д.

      // Убираем active у всех кнопок в этом списке
      list
        .querySelectorAll(".filter__item")
        .forEach((i) => i.classList.remove("active"));

      // Добавляем active только к кликнутой кнопке
      item.classList.add("active");

      // 🔑 Вызов фильтрации карточек
      filterCards();
    });
  });
}

filter(); // иначе обработчики клика не навесились

function filterCards() {
  // Считываем активные фильтры
  const activeSeed =
    document.querySelector(
      '.filter__list[data-filter="seed"] .filter__item.active'
    )?.dataset.value || "all";
  const activeTime =
    document.querySelector(
      '.filter__list[data-filter="time"] .filter__item.active'
    )?.dataset.value || "all";

  cards.forEach((card) => {
    const cardSeed = card.dataset.seed;
    const cardTime = card.dataset.time;

    // Проверяем соответствие фильтрам
    if (
      (activeSeed === "all" || cardSeed === activeSeed) &&
      (activeTime === "all" || cardTime === activeTime)
    ) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

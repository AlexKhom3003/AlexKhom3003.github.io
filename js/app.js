const buttons = document.querySelectorAll(".lang-switch__btn");
const elements = document.querySelectorAll("[data-i18n]");

const loadLanguage = async (lang) => {
  const res = await fetch(`i18n/${lang}.json`);
  const translations = await res.json();

  elements.forEach((el) => {
    const key = el.dataset.i18n;
    const keys = key.split(".");
    let text = translations;

    keys.forEach((k) => (text = text?.[k]));
    if (text) el.innerHTML = text;
  });

  localStorage.setItem("lang", lang);
};

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    loadLanguage(btn.dataset.lang);
  });
});

const savedLang = localStorage.getItem("lang") || "en";
loadLanguage(savedLang);

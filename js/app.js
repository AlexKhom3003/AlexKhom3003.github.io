const buttons = document.querySelectorAll(".lang-switch__btn");
const elements = document.querySelectorAll("[data-i18n]");
const translations = window.TRANSLATIONS || {};
const defaultLang = "en";

let currentLang = defaultLang;

const getTranslationValue = (locale, key) =>
  key.split(".").reduce((value, segment) => value?.[segment], locale);

const setActiveButton = (lang) => {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
};

const applyTranslation = (element, value) => {
  if (value === undefined || value === null) {
    return;
  }

  const attribute = element.dataset.i18nAttr;

  if (attribute) {
    element.setAttribute(attribute, value);
    return;
  }

  element.innerHTML = value;
};

const loadLanguage = (lang) => {
  const nextLang = translations[lang] ? lang : defaultLang;
  const locale = translations[nextLang];
  const fallbackLocale = translations[defaultLang];

  elements.forEach((element) => {
    const key = element.dataset.i18n;
    const value =
      getTranslationValue(locale, key) ?? getTranslationValue(fallbackLocale, key);

    applyTranslation(element, value);
  });

  document.documentElement.lang = nextLang;
  setActiveButton(nextLang);
  localStorage.setItem("lang", nextLang);
  currentLang = nextLang;
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    loadLanguage(button.dataset.lang);
  });
});

const savedLang = localStorage.getItem("lang") || defaultLang;
loadLanguage(savedLang);

const form = document.getElementById("contactForm");
const successMessage = document.getElementById("formSuccess");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      form.classList.add("d-none");
      successMessage.classList.remove("d-none");
    } catch (error) {
      const errorMessage =
        getTranslationValue(translations[currentLang], "contact.error") ||
        getTranslationValue(translations[defaultLang], "contact.error") ||
        "Something went wrong. Please try again later.";

      alert(errorMessage);
    }
  });
}

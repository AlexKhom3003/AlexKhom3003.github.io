const buttons = document.querySelectorAll(".lang-switch__btn");
const elements = document.querySelectorAll("[data-i18n]");
const translations = window.TRANSLATIONS || {};
const defaultLang = "en";
const form = document.getElementById("contactForm");
const successMessage = document.getElementById("formSuccess");
const toast = document.getElementById("formToast");
const submitButton = document.getElementById("contactSubmitButton");
const submitLabel = document.getElementById("contactSubmitLabel");
const sendAnotherButton = document.getElementById("sendAnotherMessage");
const cvDownloadLink = document.getElementById("downloadCvLink");
const cvDownloadVersion = "20260321-2";

let currentLang = defaultLang;
let toastTimer;

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

const getLocalizedText = (key) =>
  getTranslationValue(translations[currentLang], key) ??
  getTranslationValue(translations[defaultLang], key);

const updateSubmitLabel = (key = "contact.submit") => {
  if (!submitLabel) {
    return;
  }

  submitLabel.textContent = getLocalizedText(key) || "Send Message";
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
  updateSubmitLabel(
    submitButton?.disabled ? "contact.sending" : "contact.submit"
  );
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    loadLanguage(button.dataset.lang);
  });
});

const savedLang = localStorage.getItem("lang") || defaultLang;
loadLanguage(savedLang);

const showToast = () => {
  if (!toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  toast.classList.remove("d-none");

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");

    window.setTimeout(() => {
      toast.classList.add("d-none");
    }, 250);
  }, 4200);
};

const setSubmittingState = (isSubmitting) => {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isSubmitting;
  form?.classList.toggle("is-submitting", isSubmitting);
  updateSubmitLabel(isSubmitting ? "contact.sending" : "contact.submit");
};

const showSuccessState = () => {
  form?.classList.add("d-none");
  successMessage?.classList.remove("d-none");
  showToast();
};

const resetContactFormState = () => {
  successMessage?.classList.add("d-none");
  form?.classList.remove("d-none");
  form?.querySelector('input[name="email"]')?.focus();
};

const buildDownloadUrl = (path) => {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}v=${cvDownloadVersion}`;
};

const forceFileDownload = async (path, fileName) => {
  const response = await fetch(buildDownloadUrl(path), {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const temporaryLink = document.createElement("a");

  temporaryLink.href = objectUrl;
  temporaryLink.download = fileName;
  document.body.appendChild(temporaryLink);
  temporaryLink.click();
  temporaryLink.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
};

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    setSubmittingState(true);

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
      showSuccessState();
    } catch (error) {
      const errorMessage = getLocalizedText("contact.error") ||
        "Something went wrong. Please try again later.";

      alert(errorMessage);
    } finally {
      setSubmittingState(false);
    }
  });
}

if (sendAnotherButton) {
  sendAnotherButton.addEventListener("click", () => {
    resetContactFormState();
  });
}

if (cvDownloadLink) {
  cvDownloadLink.addEventListener("click", async (event) => {
    event.preventDefault();

    const filePath = cvDownloadLink.dataset.cvUrl;
    const fileName =
      cvDownloadLink.dataset.cvFilename || "Aleksandr_Khomenko_CV_2026_03_21.pdf";

    if (!filePath) {
      return;
    }

    try {
      await forceFileDownload(filePath, fileName);
    } catch (error) {
      window.location.href = buildDownloadUrl(filePath);
    }
  });
}

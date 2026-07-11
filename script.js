const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function setNavigation(open) {
  if (!navToggle || !siteNav) return;

  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  siteNav.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    setNavigation(navToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavigation(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavigation(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setNavigation(false);
  });
}

const reveals = document.querySelectorAll(".reveal:not(.is-visible)");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 }
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}

const quoteForm = document.querySelector("#quote-form");
const blueprintInput = document.querySelector("#blueprint");
const fileName = document.querySelector("#file-name");
const formStatus = document.querySelector("#form-status");
const projectType = document.querySelector("#project-type");

const projectPresets = {
  caravan: "Accommodation caravan furniture",
  office: "Commercial office furniture",
  commercial: "Commercial office furniture",
  hospitality: "Hospitality furniture",
  retail: "Retail furniture",
  manufacturing: "Furniture contract manufacturing"
};

if (projectType) {
  const project = new URLSearchParams(window.location.search).get("project");
  if (project && projectPresets[project]) projectType.value = projectPresets[project];
}

if (blueprintInput && fileName) {
  blueprintInput.addEventListener("change", () => {
    const selectedFile = blueprintInput.files && blueprintInput.files[0];
    fileName.textContent = selectedFile ? selectedFile.name : "PDF, CAD, spreadsheet, or image";
  });
}

function cleanValue(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : "Not provided";
}

if (quoteForm) {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      if (formStatus) {
        formStatus.textContent = "Please complete the required project and contact fields.";
        formStatus.classList.add("error");
      }
      return;
    }

    const data = new FormData(quoteForm);
    const selectedFile = blueprintInput && blueprintInput.files ? blueprintInput.files[0] : null;
    const company = cleanValue(data, "company");
    const selectedProject = cleanValue(data, "project_type");
    const subject = `Production quote request | ${company} | ${selectedProject}`;
    const body = [
      "BLUE CHIP PRODUCTION QUOTE REQUEST",
      "",
      "CONTACT",
      `Name: ${cleanValue(data, "contact_name")}`,
      `Company: ${company}`,
      `Email: ${cleanValue(data, "email")}`,
      `Phone: ${cleanValue(data, "phone")}`,
      "",
      "PROJECT SCOPE",
      `Project type: ${selectedProject}`,
      `Project stage: ${cleanValue(data, "project_stage")}`,
      `Estimated volume / quantity: ${cleanValue(data, "quantity")}`,
      `Required delivery / installation: ${cleanValue(data, "timeline")}`,
      `Delivery location: ${cleanValue(data, "delivery_location")}`,
      `Material / finish preference: ${cleanValue(data, "material_preference")}`,
      "",
      "DIMENSIONS / ROOM TYPES",
      cleanValue(data, "dimensions"),
      "",
      "PERFORMANCE REQUIREMENTS / NOTES",
      cleanValue(data, "message"),
      "",
      `Drawing selected: ${selectedFile ? selectedFile.name : "No file selected"}`,
      selectedFile ? "Please attach the selected drawing to this email before sending." : "",
      "",
      "Submitted from bluechipspc.com"
    ]
      .filter(Boolean)
      .join("\n");

    if (formStatus) {
      formStatus.classList.remove("error");
      formStatus.textContent = selectedFile
        ? "Your email application is opening. Attach the selected drawing, then send the request."
        : "Your email application is opening with the quotation brief.";
    }

    window.location.href = `mailto:info@bluechipspc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

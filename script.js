const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

function setNavigation(open) {
  siteNav?.classList.toggle("is-open", open);
  navToggle?.classList.toggle("is-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
  navToggle?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  document.body.classList.toggle("nav-open", open);
}

navToggle?.addEventListener("click", () => {
  const willOpen = !siteNav?.classList.contains("is-open");
  setNavigation(willOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setNavigation(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setNavigation(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    setNavigation(false);
  }
});

function updateHeader() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const projectFilters = [...document.querySelectorAll(".project-filter")];
const projectCards = [...document.querySelectorAll(".project-card")];
const projectCount = document.querySelector(".project-count strong");

function filterProjects(category) {
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const visible = category === "all" || card.dataset.category === category;
    card.hidden = !visible;

    if (visible) {
      visibleCount += 1;
      requestAnimationFrame(() => card.classList.add("is-visible"));
    } else {
      const details = card.querySelector("details");
      if (details) details.open = false;
    }
  });

  if (projectCount) {
    projectCount.textContent = String(visibleCount);
  }
}

projectFilters.forEach((filter, index) => {
  filter.addEventListener("click", () => {
    projectFilters.forEach((button) => {
      const active = button === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    filterProjects(filter.dataset.filter || "all");
  });

  filter.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let targetIndex = index;

    if (event.key === "ArrowLeft") targetIndex = (index - 1 + projectFilters.length) % projectFilters.length;
    if (event.key === "ArrowRight") targetIndex = (index + 1) % projectFilters.length;
    if (event.key === "Home") targetIndex = 0;
    if (event.key === "End") targetIndex = projectFilters.length - 1;

    projectFilters[targetIndex].focus();
    projectFilters[targetIndex].click();
  });
});

document.querySelectorAll(".project-card details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;

    const card = details.closest(".project-card");
    document.querySelectorAll(".project-card details[open]").forEach((openDetails) => {
      if (openDetails !== details && openDetails.closest(".project-card") !== card) {
        openDetails.open = false;
      }
    });
  });
});

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visibleEntry.target.id}`);
      });
    },
    { rootMargin: "-28% 0px -58% 0px", threshold: [0.01, 0.2, 0.5] },
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

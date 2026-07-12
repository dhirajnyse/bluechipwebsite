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

const quoteRecipient = "info@capsa-eng.com";

function loadImageAsDataUrl(url) {
  return fetch(url, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Logo could not be loaded.");
      return response.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener("load", () => resolve(reader.result), { once: true });
          reader.addEventListener("error", () => reject(reader.error), { once: true });
          reader.readAsDataURL(blob);
        })
    );
}

const quoteLogoPromise = quoteForm
  ? loadImageAsDataUrl("assets/bluechip-logo-pdf.png").catch(() => null)
  : Promise.resolve(null);

function safeFilePart(value) {
  return value
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "Project";
}

function buildQuoteEmail(data, selectedFile, pdfFileName) {
  const company = cleanValue(data, "company");
  const selectedProject = cleanValue(data, "project_type");
  const subject = `Production quote request | ${company} | ${selectedProject}`;
  const body = [
    `To: ${quoteRecipient}`,
    "",
    `Please find the generated inquiry PDF attached as ${pdfFileName}.`,
    selectedFile ? `Please also attach the selected drawing: ${selectedFile.name}.` : "",
    "",
    "BLUECHIP PRODUCTION QUOTE REQUEST",
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
    "",
    "Submitted from bluechipspc.com"
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, body };
}

function createQuotePdf(data, selectedFile, logoDataUrl) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("PDF generator is unavailable.");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const charcoal = [23, 27, 31];
  const slate = [93, 104, 113];
  const orange = [242, 100, 34];
  const now = new Date();
  const compactDate = now.toISOString().slice(0, 10).replaceAll("-", "");
  const compactTime = now.toTimeString().slice(0, 5).replace(":", "");
  const reference = `BCQ-${compactDate}-${compactTime}`;
  const company = cleanValue(data, "company");
  const fileName = `Bluechip-Quote-${safeFilePart(company)}-${now.toISOString().slice(0, 10)}.pdf`;
  let y = 0;

  function drawPageHeader(firstPage = false) {
    if (firstPage) {
      doc.setFillColor(...charcoal);
      doc.rect(0, 0, pageWidth, 42, "F");
      if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", margin, 7, 72, 27.3, undefined, "FAST");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("PRODUCTION QUOTE REQUEST", pageWidth - margin, 17, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(reference, pageWidth - margin, 26, { align: "right" });
      doc.text(quoteRecipient, pageWidth - margin, 33, { align: "right" });
      y = 53;
      return;
    }

    doc.setFillColor(...charcoal);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("BLUECHIP PRODUCTION QUOTE REQUEST", margin, 11);
    doc.setFont("helvetica", "normal");
    doc.text(reference, pageWidth - margin, 11, { align: "right" });
    y = 28;
  }

  function newPage() {
    doc.addPage();
    drawPageHeader(false);
  }

  function ensureSpace(height) {
    if (y + height > pageHeight - 22) newPage();
  }

  function addSection(title) {
    ensureSpace(14);
    doc.setDrawColor(...orange);
    doc.setLineWidth(1.1);
    doc.line(margin, y, margin + 8, y);
    doc.setTextColor(...charcoal);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), margin + 12, y + 1.2);
    y += 10;
  }

  function addPair(labelA, valueA, labelB, valueB) {
    const gap = 10;
    const columnWidth = (contentWidth - gap) / 2;
    const linesA = doc.splitTextToSize(String(valueA), columnWidth);
    const linesB = doc.splitTextToSize(String(valueB), columnWidth);
    const lineCount = Math.max(linesA.length, linesB.length);
    ensureSpace(10 + lineCount * 4.5);

    doc.setTextColor(...slate);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(labelA.toUpperCase(), margin, y);
    doc.text(labelB.toUpperCase(), margin + columnWidth + gap, y);
    doc.setTextColor(...charcoal);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(linesA, margin, y + 5);
    doc.text(linesB, margin + columnWidth + gap, y + 5);
    y += 9 + lineCount * 4.5;
  }

  function addBlock(label, value) {
    ensureSpace(16);
    doc.setTextColor(...slate);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), margin, y);
    y += 5;

    doc.setTextColor(...charcoal);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(String(value), contentWidth);
    let index = 0;

    while (index < lines.length) {
      const availableLines = Math.max(1, Math.floor((pageHeight - 22 - y) / 4.7));
      const pageLines = lines.slice(index, index + availableLines);
      doc.text(pageLines, margin, y);
      y += pageLines.length * 4.7;
      index += pageLines.length;
      if (index < lines.length) newPage();
    }
    y += 5;
  }

  drawPageHeader(true);
  addPair("Submission reference", reference, "Prepared", now.toLocaleString("en-GB"));
  addSection("Contact");
  addPair("Contact name", cleanValue(data, "contact_name"), "Company", company);
  addPair("Business email", cleanValue(data, "email"), "Phone number", cleanValue(data, "phone"));
  addSection("Project scope");
  addPair("Project type", cleanValue(data, "project_type"), "Project stage", cleanValue(data, "project_stage"));
  addPair("Estimated volume / quantity", cleanValue(data, "quantity"), "Required delivery / installation", cleanValue(data, "timeline"));
  addPair("Delivery location", cleanValue(data, "delivery_location"), "Material / finish preference", cleanValue(data, "material_preference"));
  addBlock("Custom dimensions / room types", cleanValue(data, "dimensions"));
  addSection("Technical information");
  addBlock("Performance requirements / notes", cleanValue(data, "message"));
  addPair("Drawing / schedule selected", selectedFile ? selectedFile.name : "No file selected", "Email recipient", quoteRecipient);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(214, 218, 221);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setTextColor(...slate);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Bluechip Engineering & Contracting LLC | bluechipspc.com", margin, pageHeight - 8);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  return { doc, fileName };
}

function downloadPdf(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

if (quoteForm) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      if (formStatus) {
        formStatus.textContent = "Please complete the required project and contact fields.";
        formStatus.classList.add("error");
      }
      return;
    }

    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const data = new FormData(quoteForm);
    const selectedFile = blueprintInput && blueprintInput.files ? blueprintInput.files[0] : null;

    if (submitButton) submitButton.disabled = true;
    if (formStatus) {
      formStatus.classList.remove("error");
      formStatus.textContent = "Preparing your branded inquiry PDF...";
    }

    try {
      const logoDataUrl = await quoteLogoPromise;
      const { doc, fileName: pdfFileName } = createQuotePdf(data, selectedFile, logoDataUrl);
      const pdfBlob = doc.output("blob");
      const pdfFile =
        typeof File === "function" ? new File([pdfBlob], pdfFileName, { type: "application/pdf" }) : null;
      const { subject, body } = buildQuoteEmail(data, selectedFile, pdfFileName);
      const sharePayload = pdfFile ? { files: [pdfFile], title: subject, text: body } : null;
      const canSharePdf =
        Boolean(pdfFile) &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [pdfFile] });

      if (canSharePdf) {
        if (formStatus) {
          formStatus.textContent = `Choose your email application. The PDF and message are ready; send them to ${quoteRecipient}.`;
        }
        try {
          await navigator.share(sharePayload);
          if (formStatus) formStatus.textContent = `The PDF and message were passed to your selected application for ${quoteRecipient}.`;
          return;
        } catch (error) {
          if (error && error.name === "AbortError") {
            if (formStatus) formStatus.textContent = "Email sharing was cancelled. Select Prepare PDF & email to try again.";
            return;
          }
        }
      }

      downloadPdf(pdfBlob, pdfFileName);
      if (formStatus) {
        formStatus.textContent = `The PDF was downloaded and an email draft is opening. Attach ${pdfFileName}${selectedFile ? ` and ${selectedFile.name}` : ""}, then send it.`;
      }
      window.setTimeout(() => {
        window.location.href = `mailto:${quoteRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }, 300);
    } catch (error) {
      if (formStatus) {
        formStatus.classList.add("error");
        formStatus.textContent = "The PDF could not be prepared. Please email info@capsa-eng.com directly.";
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

# Blue Chip Manufacturing Website

Static multi-page website for `bluechipspc.com`, presenting Blue Chip Engineering's accommodation caravan, site-office, and commercial furniture manufacturing services.

## Pages

- `index.html` - sector overview, 62-second company film, and production process
- `caravan-furniture.html` - accommodation and office caravan furniture
- `commercial-furniture.html` - workplace, hospitality, and retail furniture
- `manufacturing-capabilities.html` - production methods and material library
- `quote-contact.html` - structured B2B quotation enquiry
- `styles.css` - shared responsive design system
- `script.js` - navigation, reveal motion, viewport-aware video playback, PDF generation, and quote-email workflow
- `assets/` - optimized brand and manufacturing imagery
- `assets/vendor/` - locally hosted jsPDF browser library and license

## Publishing

The site is published from the `main` branch through GitHub Pages and uses `bluechipspc.com` as its custom domain.

The homepage film is a locally hosted, silent 720p MP4 with a branded poster. It starts muted while substantially in view, pauses when it leaves the viewport, and does not auto-start for reduced-motion or data-saver users.

The quote form generates a branded inquiry PDF, then clearly offers three deliberate next steps: open a pre-addressed email and download the PDF for attachment, pass the PDF to the native share sheet, or download the PDF only. Nothing is sent automatically. Selected project drawings remain on the sender's device and must be added separately in the email application.

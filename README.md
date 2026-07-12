# Blue Chip Manufacturing Website

Static multi-page website for `bluechipspc.com`, presenting Blue Chip Engineering's accommodation caravan, site-office, and commercial furniture manufacturing services.

## Pages

- `index.html` - sector overview and production process
- `caravan-furniture.html` - accommodation and office caravan furniture
- `commercial-furniture.html` - workplace, hospitality, and retail furniture
- `manufacturing-capabilities.html` - production methods and material library
- `quote-contact.html` - structured B2B quotation enquiry
- `styles.css` - shared responsive design system
- `script.js` - navigation, reveal motion, PDF generation, and quote-email workflow
- `assets/` - optimized brand and manufacturing imagery
- `assets/vendor/` - locally hosted jsPDF browser library and license

## Publishing

The site is published from the `main` branch through GitHub Pages and uses `bluechipspc.com` as its custom domain.

The quote form generates a branded inquiry PDF and prepares the message for `info@capsa-eng.com`. Compatible browsers pass the PDF and message to the native share sheet; other browsers download the PDF and open a pre-addressed email draft. Selected project drawings remain on the sender's device and must be added separately in the email application.

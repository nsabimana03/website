# BRIGHT MIND SCHOLARSHIP INITIATIVE FOR ALL — Frontend Prototype

This repository contains a static, frontend-only prototype of the BRIGHT MIND SCHOLARSHIP INITIATIVE FOR ALL website. It is written in plain HTML, CSS, and vanilla JavaScript and runs locally in a browser without any server, paid APIs, or complicated setup.

This prototype demonstrates:
- A responsive homepage with hero, search, and featured scholarships
- A searchable and filterable scholarship directory with demonstration data
- A Croatia resources section linking to official university websites
- A student profile form with validation and a simple rule-based matching engine
- A client-side document upload interface (file validation only)
- A frontend-only admin dashboard to add/edit/delete sample listings (uses browser localStorage)
- Accessibility considerations and safe external links

Important: This is a demo/prototype. It is not secure for production and does not store or transmit personal files to a server.

## Files
- `index.html` — Main HTML markup
- `style.css` — Styles (dark navy, white, gold theme)
- `script.js` — Client-side logic: data, search, filters, matching, admin demo
- `README.md` — This file

## How to run locally
1. Clone or download the project folder.
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari).
   - You can double-click the file or use `File -> Open` in your browser.
3. No server or build tools are required for this prototype.

Optional: To serve via a lightweight local server (recommended for some browser features):
- Using Python 3:
  - `python -m http.server 8000`
  - Then open `http://localhost:8000/` in your browser.

## How the prototype works (key behaviors)
- Scholarship listings are stored in browser `localStorage` under a demo key. On first load, sample demonstration listings are seeded.
- Filters and search operate on the local dataset.
- The "Admin (Demo)" panel allows adding/editing/removing listings; these changes persist in your browser only and are not secure.
- The Student Profile form validates inputs, performs a local rule-based match against the dataset, and displays ranked matches with explanations.
- Uploaded documents are validated client-side (file type & size). Files are not uploaded or transmitted anywhere.
- All external official links open in a new tab using `rel="noopener noreferrer"` for safety.

## Data policy & disclaimers
- All scholarship listings in the initial dataset are clearly marked as "Sample" unless marked "Verified" by the demo admin.
- The site does not claim any real-world guarantees (admission, funding, deadlines). Do not treat sample data as verified opportunities.
- The Croatia section links to the official homepages of:
  - University of Zagreb — https://www.unizg.hr
  - University of Split — https://www.unist.hr
  - University of Rijeka — https://www.uniri.hr
  These are starting points for research; consult official university pages for verified scholarship calls.

## How to publish on GitHub Pages
1. Create a new GitHub repository (or push this project to your repo).
2. Commit `index.html`, `style.css`, `script.js`, and `README.md`.
3. In the repository settings -> Pages, choose the branch (e.g., `main`) and root folder (`/`) to publish.
4. Wait a couple minutes and your static site will be available at `https://<your-username>.github.io/<repo>`.

## Next steps for a secure production version (overview)
This prototype is intentionally frontend-only. For a production-ready secure system, the following components and practices should be added in later phases:

1. Secure backend & database
   - Build an API server (Node.js/Express, Django, Rails, etc.) with authentication.
   - Use a reliable database (Postgres, MySQL) to store scholarship data, user profiles, uploads (or store files in secure object storage).
   - Add role-based access control for administrators and staff.

2. Real authentication & authorization
   - Implement secure user accounts (OAuth2 or email/password with hashed passwords).
   - Add admin authentication with multi-factor authentication (MFA) for privileged actions.

3. Verified scholarship feeds & moderation
   - Integrate verified institutional feeds (RSS/JSON) and implement editorial moderation workflows.
   - Track and display verification metadata (verified_by, verification_date, source_id).

4. Secure document handling and OCR (optional)
   - Accept file uploads over HTTPS to a secure server or object storage (S3 or equivalent).
   - Use explicit user consent before processing documents.
   - Use vetted OCR services or on-premise OCR with strict data retention policies. Never send documents to third-party OCR without consent.

5. Notifications & deadline reminders
   - Implement a scheduled job system (cron, background workers) to send email reminders of upcoming deadlines.
   - Allow users to subscribe to notifications; follow GDPR/data-protection best practices.

6. Data protection & compliance
   - Add privacy policy, terms, data retention policies.
   - Secure user data per GDPR, local laws, and best practices; keep personal data minimised.

7. Testing & security
   - Add automated tests, input validation on server-side, rate limiting, and penetration testing.

If you'd like, I can:
- Convert this prototype into a small Node.js/Express app with an API and SQLite for local development.
- Build a secure admin interface with authentication (demo OAuth).
- Integrate a verified feed ingestion flow that flags listings for manual verification.

---

If you want any changes (more sample data, different fields, export/import for admin prototype, or conversion to a simple server-backed version), tell me which feature to implement next and I will update the code accordingly.

What I did: I implemented the full static frontend prototype and all requested interactive features in separated files (HTML/CSS/JS).  
What's next: I can convert this into a lightweight backend prototype (API + DB) or add more advanced matching logic and UI polish — let me know which direction you prefer.
# Demo video script (about 4 minutes)

Before recording: run `pnpm dev`, sign in to `/admin` in one tab, and open `/api/docs` and the live tactyqal.com in others. Record at 1280px wide. Hide the Next.js dev badge, or record a production build (`pnpm --filter web build && pnpm --filter web start`).

## 1. The problem (0:00–0:35)

Show the live tactyqal.com.

> "Tactyqal's homepage has one job: earn a parent's trust. Today a newsletter popup covers the hero before anything can be read. The page has no title or h1, and two sections disagree on how many students you've mentored. The blog is a separate WordPress install: over thirteen hundred posts, more than half of them uncategorized. I rebuilt both: the homepage, and a blog backend the homepage actually uses."

## 2. The homepage (0:35–1:40)

Scroll the new homepage slowly.

> "Every word here is Tactyqal's own copy. I didn't invent a single number or testimonial."

- **Hero:** scroll slowly through the pinned hero. "One promise, then the headline lifts away, the phone zooms, and the scene shrinks into a real student app. 8 weeks, 1:1, two to three hours a week are right there."
- **Student apps:** "Real student apps, with the revenue figures your site already states."
- **Program:** let the sideways track play. "Each of the four stages gets its own panel, with what happens and which of your free tools supports it. For visitors who prefer reduced motion, and on phones, it stacks instead."
- **"Learn from Industry Experts":** "These three posts are live from the new blog API, not hard-coded."
- **Contact form:** submit it empty to show the field errors, then fill it and submit. "That request is now a row in Postgres."
- Resize to phone width for a few seconds.

## 3. The blog platform (1:40–2:50)

Open `/blog`.

> "These are real posts, migrated by an importer that kept every original URL, so links and search rankings survive the switch."

- Click a category chip, then search "startup". "Search is Postgres full-text, ranked so title matches come first."
- Open the "50 No-Code Startup Ideas" post and scroll to the table and the video. "Imported content is sanitized on the way in. Tables and YouTube embeds survive, and the embed uses YouTube's no-cookie domain."
- Switch to the admin tab. Create a post with a `<script>` tag in the body and publish it. Open it on `/blog`: "It's live on the next request, and the script is gone." Delete it and show the 404.

## 4. Under the hood (2:50–3:40)

Show `/api/docs`, then the README architecture diagram.

> "The API is NestJS with Prisma and Postgres. Every error has one shape. Validation rejects unknown fields. Writes need an admin token that never reaches the browser: the site calls the API only from the server."

Run `pnpm test` in a terminal (or show a recent run).

> "Ninety-eight tests, and the end-to-end suite runs every endpoint against a real Postgres database. Along the way I made calls such as Postgres search over Elasticsearch, and a single admin token instead of user accounts. The trade-offs are written up in the README."

## 5. Close (3:40–4:00)

> "There are a few content questions only Tactyqal can answer, like which student count is right. They're listed in the README instead of guessed. Thanks for watching."

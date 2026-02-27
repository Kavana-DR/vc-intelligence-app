# VC Discovery App

A polished VC intelligence web app built with Next.js App Router and Tailwind CSS.

This project helps investors and analysts discover companies, review profiles, add notes, save targets, and enrich company data from public websites.

## Features

- Sidebar app shell with dedicated views:
- `Companies`
- `Lists`
- `Saved Searches`
- Companies directory:
- Search and pagination
- Company profile route (`/companies/[id]`)
- Company profile:
- Core company fields (name, website, industry, location, stage)
- Persistent notes per company (`localStorage`)
- Save company action (`localStorage`)
- AI enrichment workflow:
- Fetches website content
- Extracts metadata (`title`, `meta description`)
- Generates structured enrichment output:
- `summary`
- `whatTheyDo`
- `keywords`
- `signals`
- `sources`
- Displays enrichment as responsive cards
- Client-side caching for enrichment (`localStorage`)
- Lists management (`/lists`) using `localStorage`
- Saved searches (`/saved`) using `localStorage`

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- OpenAI Node SDK
- ESLint

## Project Structure

```text
app/
  api/enrich/route.js
  companies/page.js
  companies/[id]/page.js
  components/CompanyProfileClient.js
  components/CompaniesTable.js
  components/Sidebar.js
  lists/page.js
  saved/page.js
data/
  companies.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_openai_api_key
```

3. Start development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key used by `app/api/enrich/route.js`.

Notes:
- Keep `.env.local` in project root only.
- Never commit secrets.

## Enrichment Flow

1. User opens a company profile.
2. Clicks `Enrich Company`.
3. API route fetches website HTML and extracts metadata.
4. API sends metadata/content to model and receives structured insights.
5. UI renders enrichment cards immediately.
6. Result is cached in `localStorage` for fast reload.

## Example Usage

1. Navigate to `/companies`.
2. Search for a startup and open profile.
3. Add diligence notes.
4. Click `Enrich Company` to generate insights.
5. Save company to your pipeline.

## Error Handling

- Friendly UI errors (no raw technical stack traces shown to users).
- API gracefully falls back to metadata-based enrichment when model calls fail.
- Loading state always resolves (no stuck spinner).

## Deployment (Vercel)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variable in Vercel project settings:
- `OPENAI_API_KEY`
4. Deploy.

Recommended:
- Run `npm run lint` before each deployment.
- Ensure `.env.local` is not committed.

## Screenshots

Add screenshots here before submission:

- `Companies page`
- `Company profile`
- `AI enrichment cards`
- `Lists and Saved Searches`

Note on Enrichment

Due to OpenAI API quota limitations, enrichment is implemented using
public website metadata extraction instead of OpenAI summarization.

The system fetches the company website and extracts:

• Title
• Meta description
• Signals
• Keywords
• Source links

This ensures the enrichment feature works reliably without external API limits.
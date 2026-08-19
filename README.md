# ProjectSphere — National Student Innovation & Novelty Platform

ProjectSphere is a platform designed for academic institutions, students, and faculty to discover, collaborate, and assess student projects with **Global Project Similarity & Novelty Detection**.

---

## 🌟 Key Features

1. **Global Project Similarity & Novelty Discovery**:
   - Multi-source search across **ProjectSphere Database**, **GitHub Repositories**, **Public Web Index**, and **OpenAlex Academic Research Literature**.
   - Multi-dimensional semantic vector cosine similarity across **Problem**, **Methodology**, **Technology**, **Domain**, and **Expected Outcome**.
   - Concept intersection analysis (identifying shared vs. distinct technologies and architectural features).
   - Research Gap Analysis (highlighting over-explored areas, emerging opportunities, and potential literature gaps).
   - Tailored differentiation suggestions.
   - Zero-fake scores: All metrics are derived mathematically from vector embeddings.

2. **Project Upload & Faculty Review Workflow**:
   - Submit projects with structured domain, tech stack, and abstract.
   - Faculty endorsement, peer collaboration requests, and originality verification.

3. **Innovation Insights & Trends**:
   - Track over-explored domains vs. high-growth emerging tech areas across 1,200+ projects.

---

## 🏗️ Architecture: Global Similarity Engine

```
                      +----------------------------------+
                      |   Student Project Input / ref    |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Structured Project Normalization |
                      | (Title, Problem, Domain, Tech,   |
                      |  Methodology, Outcome, Concepts) |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Multi-Perspective Query Gen      |
                      | (Exact, Problem, Tech, Method,   |
                      |  Research Literature Keywords)   |
                      +--------+----+-----+-----+--------+
                               |    |     |     |
            +------------------+    |     |     +------------------+
            |                       |     |                        |
            v                       v     v                        v
     +--------------+        +------------+  +------------+  +-----------------+
     | ProjectSphere|        |   GitHub   |  | Web Search |  | Research Papers |
     |  Database    |        |  REST API  |  |  Provider  |  | (OpenAlex API)  |
     +------+-------+        +-----+------+  +-----+------+  +--------+--------+
            |                      |               |                  |
            +------------------+   |               |   +--------------+
                               |   |               |   |
                               v   v               v   v
                      +----------------------------------+
                      | Normalization -> ExternalProject |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Deduplication & Relevance Filter |
                      | (URL, Repo ID, Title Token Match)|
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Embedding & Vector Cosine Engine |
                      | (Problem 35%, Method 25%,        |
                      |  Tech 20%, Domain 10%, Out 10%)  |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Concept Intersection Analysis    |
                      | (Similarities vs Differences)    |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Research Gap & Suggestions Engine|
                      | (Over-explored, Emerging, Gaps)  |
                      +-----------------+----------------+
                                        |
                                        v
                      +----------------------------------+
                      | Global Similarity Report & UI    |
                      | (Source breakdown, Top matches,  |
                      |  Disclaimer & Actionable tips)   |
                      +-----------------+----------------+
```

---

## 🧮 Similarity Scoring Methodology

The similarity score between the submitted project and each discovered candidate is mathematically computed via **Vector Cosine Similarity** across 5 distinct dimensions:

$$\text{CosineSim}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$

### Weighted Composite Score Formula:
$$\text{Overall Score} = (S_{\text{problem}} \times 0.35) + (S_{\text{methodology}} \times 0.25) + (S_{\text{technology}} \times 0.20) + (S_{\text{domain}} \times 0.10) + (S_{\text{outcome}} \times 0.10)$$

| Dimension | Weight | Description |
| :--- | :--- | :--- |
| **Problem Statement** | **35%** | Semantic alignment of the core challenge / problem being solved |
| **Methodology & Architecture** | **25%** | Deep learning / system design / algorithmic implementation pattern |
| **Technology Stack** | **20%** | Combined vector embedding + Jaccard token overlap of libraries/frameworks |
| **Domain & Subdomain** | **10%** | Topical domain alignment |
| **Expected Outcome** | **10%** | Target capabilities, benchmarks, and deliverables |

### Novelty Interpretation:
- **Low Observed Similarity** (< 35%): Strong originality; minimal public overlap.
- **Moderate Observed Similarity** (35% – 59%): Thematic parallels in domain/tools with distinct execution.
- **High Observed Similarity** (60% – 79%): Substantial overlap in methodology and problem scope.
- **Strong Similarity Detected** (≥ 80%): Severe conceptual overlap; direct pivot/differentiation advised.

> **Official Disclaimer:** *Similarity results are based on publicly accessible sources and should be treated as an indication for further review, not as proof of originality or plagiarism.*

---

## 🌐 External APIs & Providers

1. **GitHub REST API** (`https://api.github.com/search/repositories`)
   - Retrieves repository name, description, owner, stars, topics, languages, and direct URLs.
   - Optional `GITHUB_TOKEN` for higher rate limits.
2. **OpenAlex Academic Metadata API** (`https://api.openalex.org/works`)
   - 100% free open-access index of over 250M scholarly works.
   - Extracts paper title, reconstructed abstract, DOI, venue, and authors.
3. **Web Search Provider Abstraction** (`WebSearchProvider`)
   - Configurable via `WEB_SEARCH_PROVIDER`: `tavily`, `serpapi`, `bing`, `google_custom`, or `open_web` (DuckDuckGo/Wikipedia public endpoints).
4. **Embedding Providers** (`EmbeddingProvider`)
   - `gemini`: Google Gemini `text-embedding-004` (768 dimensions).
   - `openai`: OpenAI `text-embedding-3-small` (1536 dimensions).
   - `local`: Built-in deterministic TF-IDF + subword n-gram vector engine (384 dimensions) — works offline without any paid API keys.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="projectsphere-dev-secret-key"

# GitHub Token (Optional)
GITHUB_TOKEN=""

# Embedding Provider ('local' | 'gemini' | 'openai')
EMBEDDING_PROVIDER="local"
GEMINI_API_KEY=""
OPENAI_API_KEY=""

# Web Search Provider ('open_web' | 'tavily' | 'serpapi' | 'bing' | 'google_custom')
WEB_SEARCH_PROVIDER="open_web"
TAVILY_API_KEY=""
SERPAPI_API_KEY=""
BING_API_KEY=""

# Academic Literature (OpenAlex polite pool)
OPENALEX_EMAIL="admin@projectsphere.dev"
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npm run db:push
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Global Similarity Flow

1. Go to **Similarity Check** (`http://localhost:3000/similarity`).
2. Click **Load Sample Project** (pre-fills *"AI-Based Smart Waste Segregation using Computer Vision and IoT"*).
3. Click **Run Global Similarity & Novelty Discovery**.
4. Observe the real-time multi-step progress indicators.
5. Review the full report:
   - Overall Novelty gauge & score.
   - Multi-source breakdown (ProjectSphere, GitHub, Web, Research Literature).
   - Discovered candidate cards with dimension bars, shared/different concept pills, and clickable source links.
   - Research Gap Analysis (Over-explored, Emerging, Potential gaps).
   - Practical Differentiation suggestions.
   - Click **Export Report (TXT)** to download a formatted report.

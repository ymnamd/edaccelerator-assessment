# EdAccelerator Reading Comprehension Interface

## Project Overview

A session-based reading comprehension interface that replaces multiple-choice questions with AI-generated open-ended questions. The system adapts difficulty and question types based on student performance within a single session, prioritizing genuine understanding over recall.

The core problem: students were disengaged by multiple-choice formats that felt like tests rather than learning experiences. Questions were easy to guess, and students would forget content immediately after completing passages.

## Interpretation of User Feedback

**"It's annoying seeing the entire passage all at once"**
→ Passages are split into logical sections. Students answer one question per section before progressing.

**"Multiple choice is too easy, I can just guess"**
→ All questions require typed responses. AI evaluates answers for comprehension rather than exact wording.

**"I finish and immediately forget what I read"**
→ Questions are tied to specific sections. Students must demonstrate understanding before moving forward.

**"When I get wrong answers, I don't really learn why"**
→ AI provides contextual explanations that reference the passage directly. Students can retry with feedback.

**"It feels like a test, not like learning"**
→ Conversational soft prompts ("Think deeply about what the passage suggests") frame questions as exploration rather than evaluation.

**"I want to re-read specific parts quickly"**
→ Full passage modal is always accessible. Sections remain visible during question answering.

**"My younger brother needs different difficulty"**
→ Adaptive difficulty system generates passages at beginner/intermediate/advanced levels based on performance.

## AI & Learning Design

### Question Generation
- Questions generated on-demand per section using OpenAI GPT-4o-mini
- Three comprehension skill types: Understanding (literal comprehension), Reasoning (inference), Application (real-world connection)
- Questions avoid surface recall and require demonstration of comprehension
- Temperature set to 0.7 for creative question variety

### Answer Evaluation
- AI evaluates typed responses against passage content (not exact matching)
- Accepts correct answers phrased differently than expected
- Temperature set to 0.3 for consistent evaluation
- Explanations reference specific passage text

### Adaptive Learning (Session-Based)
**Question Adaptation:**
- System tracks skill performance (correct/incorrect per skill type)
- Weak skills (< 70% accuracy) are prioritized in subsequent questions
- API prompt includes: `"ADAPTIVE LEARNING: Student needs practice with: Reasoning"`

**Passage Difficulty:**
- Beginner: Simple vocabulary, 10-15 word sentences, concrete concepts (Grades 3-5)
- Intermediate: Mixed vocabulary, 15-20 word sentences, some abstraction (Grades 6-8)
- Advanced: Technical terms, 20+ word sentences, abstract concepts (Grades 9+)
- System recommends next difficulty based on score (≥90% → advanced, ≥70% → intermediate, <70% → beginner)

**Passage Content Adaptation:**
- New passages incorporate student's weak skills into content
- Example: If student struggles with Reasoning, AI generates passages that naturally support inferential questions

**No Persistence:**
- All adaptation happens within a single session
- No user accounts, no stored progress
- Each session starts fresh with default passage

### Learning Outcomes Focus
- Only first attempts count toward score (encourages careful thinking over trial-and-error)
- Retries allowed but marked separately (learning tool, not penalty)
- Completion screen shows skill breakdown (Understanding 50%, Reasoning 100%, Application 100%)
- Detailed feedback emphasizes what was understood vs. missed

## Key Features

- **Sectioned Reading:** Passages split into 3-6 logical paragraphs
- **Typed Answers:** Open-ended text responses required
- **AI Question Generation:** On-demand questions tailored to section content and skill gaps
- **AI Answer Evaluation:** Semantic understanding vs. exact matching
- **Adaptive Difficulty:** Three-tier passage generation (beginner/intermediate/advanced)
- **Skill Tracking:** Performance tracked across Understanding/Reasoning/Application
- **Retry Mechanism:** Students can retry incorrect answers with feedback
- **Progress Navigation:** Jump between sections, visual progress indicators
- **Full Passage Access:** Modal overlay for quick reference
- **Completion Analytics:** Final score with skill-by-skill breakdown
- **Responsive Design:** Works on mobile and desktop

## Technical Decisions

### Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Font:** Lexend (optimized for readability)
- **AI:** OpenAI GPT-4o-mini

### Architecture
**API Routes for AI:**
- `/api/generate-question` – Creates questions per section with skill targeting
- `/api/evaluate-answer` – Evaluates typed responses semantically
- `/api/generate-passage` – Generates new passages at specified difficulty

API routes keep OpenAI API keys server-side and allow fine-tuned prompt engineering without client exposure.

**State Management:**
- React hooks for local state (`useState`, `useCallback`, `useMemo`)
- Custom hooks abstract complex logic:
  - `useQuizState` – Quiz state, scoring, skill tracking
  - `usePassageGenerator` – Passage generation flow
  - `useQuestionFlow` – Question/answer lifecycle
- Service layer (`questionService`, `evaluationService`, `passageService`) abstracts API calls
- No external state management library needed for session-based flow

**Configuration:**
- Centralized constants (`src/config/`) for AI parameters, thresholds, skill definitions
- No magic numbers in components

### Code Organization
- `/src/app` – Pages and API routes
- `/src/components` – UI components (presentational)
- `/src/hooks` – Custom hooks (business logic)
- `/src/services` – API client layer
- `/src/config` – Configuration constants
- `/src/types` – TypeScript interfaces
- `/src/data` – Static passage data

Follows SOLID principles with clear separation between UI, business logic, and data access.

## Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Add your OpenAI API key to .env.local:
# OPENAI_API_KEY=your_key_here

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

## Tradeoffs & Future Improvements

**Adaptive difficulty over time**
Currently adapts within a session. With user accounts, track performance across sessions to better tailor starting difficulty and focus areas.

**Question diversity improvements**
Expand beyond Understanding/Reasoning/Application to include summarization, compare-and-contrast, or sequencing questions. More variety = deeper learning signal.

**Richer feedback on answers**
Highlight relevant passage sentences when explaining correct/incorrect answers. Visual connection to source material strengthens learning.

**Performance optimization**
Questions generated on-demand (~2-3s). Could pre-generate for default passage or cache by section hash to reduce latency.

**Skill granularity**
Three skill types is broad. Could expand to track sub-skills (e.g., vocabulary inference, cause-effect reasoning, tone analysis).

**Passage variety**
Currently one default passage + AI-generated passages. Curated library of passages would allow topic selection and quality control.

**Answer quality detection**
Currently evaluates correctness. Could also evaluate completeness, depth, or use of evidence from text.

## Time Spent

6 hours over 3 days (initial build) + 1 hour refactoring for maintainability.

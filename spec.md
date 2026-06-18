# WYD (What You Doing With Your Life?) - Master Specification

## 🎯 1. Core Objective & Vision
WYD is an action-first career RPG marketplace that completely disrupts traditional education platforms like Udemy or Scrimba. Instead of passively watching videos, users enroll in AI-generated or community-vetted execution roadmaps ("Paths"). Progress is strictly gated by mandatory "Proof of Work" verification.

**The four things that make WYD different from a "shitty platform" (Udemy/Scrimba):**
1. **Proof-gated progress** — you can't unlock the next step until you submit proof you finished the last one.
2. **Completion is the metric** — paths and creators are ranked by how many people actually finish & ship, not by sales or fake star ratings.
3. **Public proof portfolio** — every proof is public on your profile, so a finished path leaves you with real shipped work (useful for jobs), not a worthless certificate.
4. **Skin in the game** — you can stake money/streak on yourself; finish and keep it, ghost and lose it. Kills "buy a course, never open it."

---

## 🎨 2. Design System & UI Rules
- **Theme:** High-end, premium dark-mode. Main background color: `#0B0F19` (matching `image_f2349f.png`).
- **Accents:** Neon colors (e.g., toxic green, neon purple) used sparingly, exclusively for primary Call-to-Action (CTA) buttons.
- **Typography:** Sans-serif, lowercase brand styling (`wyd.`).
- **Layout Rules:** Clean, scannable layouts inspired by modern high-end dashboard design.

---

## 💾 3. Core Data Architecture (Pure JavaScript Objects)

> **Note:** the objects below are the *conceptual* model. The real backend is FastAPI + SQLModel + Postgres (`backend/models.py`). Mapping: `sampleExecutionPath` → the `Path` table (its `days_array`/quests are the existing `Path.steps` JSON), and **per-user proof lives on the enrollment, not the path** — because each user proves the work themselves. That's the `PathPurchase` table (`completed_steps` + the new `step_proofs` map of step-index → proof URL).

```javascript
// User profile data tracking progression
const sampleUserProfile = {
  id: "user_9876",
  username: "indie_grinder",
  streak_count: 5,
  total_hours_logged: 42,
  guild_id: "guild_alpha",
  enrolled_paths: ["path_ai_dev_101"]
};

// Structural blueprint for an individual quest milestone
const sampleQuestDay = {
  day_number: 1,
  quest_title: "Set up local LLM environment and run first inference script",
  estimated_minutes: 45,
  is_completed: false,
  proof_url: null
};

// Structural blueprint for a full path execution engine
const sampleExecutionPath = {
  path_id: "path_ai_dev_101",
  creator_id: "AI", // Can be "AI" or a specific user ID
  title: "Become an AI Developer",
  category: "TECH",
  price: 10,
  enrolled_count: 1,
  total_days: 90,
  days_array: [sampleQuestDay]
};
```

---

## ✅ 4. Proof of Work (the core mechanic)
- To **complete a step**, the user submits a `proof_url` (a link to the deliverable — repo, screenshot, video, etc.).
- **Gating rule:** step `i+1` stays **locked** until step `i` has a proof. You move one step at a time, by proving.
- **Verification (demo MVP):** *self + public*. We don't peer- or AI-review proofs yet — the proof is simply public on the user's profile, so social pressure does the work.
- **Later:** peer review (other learners on the same path verify), then mentor / AI verification.

---

## 🏆 5. Completion is the metric
- Every path shows a real **completion rate** = % of enrollees who proved **all** steps.
- Discovery ("Popular") ranks by completion rate + total proofs, **not** by enrollment count or star ratings.
- A creator's reputation = how many people actually finished their paths. This flips Udemy's "paid per sale" incentive.

---

## 🧑‍🎨 6. Public proof portfolio
- All of a user's proofs render on their **Profile** as a grid → a real portfolio of shipped work.
- This is the thing a certificate isn't: evidence you can show an employer.

---

## 💸 7. Skin in the game (later phase — needs Stripe)
- Optional **stake** when you enroll (money or your streak).
- Finish the path → refunded / kept. Ghost it → forfeited (to the platform or charity).
- Scheduled **after** Phase 1, because it depends on the still-unbuilt Stripe integration.

---

## 📏 8. Path length
- **Flexible** — a creator sets any number of steps/days.
- UI **defaults to short sprints (7 / 14 / 30)** because long paths kill completion rates.

---

## 🗺️ 9. Phasing (what's in the demo vs. later)
- **Phase 1 (building now):** proof-gated progress + public proof portfolio.
- **Phase 2:** completion-rate ranking on discovery.
- **Phase 3:** skin-in-the-game staking (Stripe).
- **Vision / not yet:** AI-generated paths (`creator_id: "AI"`), guilds, peer/AI proof review, focus timers.
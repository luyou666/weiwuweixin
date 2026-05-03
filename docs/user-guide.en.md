# WeiWuWeiXin (围物为心) User Guide

> Visualize your rankings. Build consensus. Share your perspective.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Creating a List](#2-creating-a-list-ranker-studio)
3. [Browse & Discover](#3-browse--discover)
4. [Scoring & Interaction](#4-scoring--interaction)
5. [Profile & Badges](#5-profile--badges)
6. [Share Card Export](#6-share-card-export)
7. [Account & Settings](#7-account--settings)
8. [FAQ](#8-faq)

---

## 1. Core Concepts

### 1.1 What is WeiWuWeiXin?

WeiWuWeiXin is a **subjective rating community**. Here you can:

- 🏷️ Create ranked lists with **custom dimensions** (e.g. "Best Cafés" with dimensions: Taste / Ambiance / Value)
- ✍️ Submit your **author scores** as the list creator (preserving your subjective preferences)
- 👥 Let the community add their **community scores**, refining the collective judgment
- 📊 View **Confidence** — how much the community agrees
- 🎨 Generate beautiful **share cards** and export as PNG for social media

### 1.2 Three Core Principles

| Principle | Meaning |
|-----------|---------|
| **Subjectivity First** | Protect the list creator's personal preferences. The system never claims "this is objectively best" |
| **Explainable** | Every score can answer "why" — because there are dimensions, weights, and algorithms |
| **Confidence ≠ Authority** | The UI calls it "consensus level", not "authority score" — it measures agreement, not quality |

### 1.3 Key Terms

| Term | Description |
|------|-------------|
| **List** | A ranking topic, e.g. "Best Sci-Fi Films of 2024" |
| **Dimension** | An evaluation axis, e.g. "Plot / Acting / Visuals", each with a weight |
| **Item** | What's being rated, e.g. a specific movie |
| **Author Score** | The list creator's own rating |
| **Community Score** | Ratings submitted by other users |
| **Confidence** | 0–100 score measuring community agreement level |
| **Rapport** | Similarity of rating taste with another user |

---

## 2. Creating a List (Ranker Studio)

Click **"+ Create"** in the navbar to enter the list builder (4 steps):

### Step 1: Basic Info

| Field | Description |
|-------|-------------|
| Title | List name, e.g. "Top 10 Tokyo Ramen Shops" |
| Subtitle | One-line summary (optional) |
| Note | Detailed background (optional) |
| Cover | Upload a cover image (optional) |
| Visibility | PUBLIC / LINK_ONLY / PRIVATE |

### Step 2: Dimensions & Weights

- Add evaluation dimensions (e.g. "Broth / Noodles / Toppings / Price")
- Set a **weight** for each dimension (1–5); higher = more important
- Dimensions define the structure of your scoring matrix

### Step 3: Items & Algorithm

- Add items to be rated
- Choose a **scoring algorithm**:

| Algorithm | Best For |
|-----------|----------|
| Weighted Mean | Default, balanced scoring |
| Geometric Mean | Penalizes weak dimensions — one bad dimension drags total down |
| Borda Count | Rank-based; eliminates scale differences between raters |
| TOPSIS | Multi-criteria decision; closest to ideal solution wins |
| Bayesian Shrinkage | Small sample → regresses toward mean, avoids extremes |

### Step 4: Author Scores

- Score each item on each dimension (1–5)
- This is **your subjective judgment** — there's no right answer

### Step 5: Publish

Review everything and click "Publish" — your list is now live!

---

## 3. Browse & Discover

### 3.1 Home Feed

The homepage shows a mix of diversity × high confidence × freshness. Scroll down to load more.

### 3.2 Explore Page

Click "Discover" in the navbar:

- 🔍 **Search**: Find lists by keyword
- 🏷️ **Categories**: Filter by topic tags
- 📱 **Masonry layout**: Browse many lists quickly

### 3.3 Leaderboard

Click "🔥 Hot" to see the current top 20 trending lists.

Hotness formula: **Upvotes × 3 + Community Scores × 2 + Comments × 1.5 + Views × 0.1**

---

## 4. Scoring & Interaction

### 4.1 Rate a List

Open a list detail page → Click "Rate It" → 3-step immersive flow:

1. Confirm your familiarity with the topic
2. Score on each dimension
3. Submit

**Note**:
- One community score per device/account per list per **24 hours**
- Scoring too fast (< 3 seconds) is automatically down-weighted

### 4.2 Upvote / Downvote

Vote at the bottom of any list detail page. Votes influence confidence calculations.

### 4.3 Comments

- Leave comments on any list
- Sentiment is auto-analyzed (positive / neutral / negative)
- Sort by "Latest" or "Hot"

### 4.4 Understanding Confidence

Confidence is a 0–100 score reflecting community agreement. It updates in real time across:

| Context | Meaning |
|---------|---------|
| List Detail | Current consensus level |
| Explore | Used for ranking recommendations |
| Leaderboard | Influences hotness ranking |

Confidence is affected by:
- Number of unique raters
- Alignment between community ranking and author ranking
- Comment sentiment
- Time decay (30-day half-life)

---

## 5. Profile & Badges

### 5.1 Your Profile

Click your avatar (top right) → "Profile" to see:
- All lists you've created
- Your scoring history
- Your badge collection
- Users with similar taste (Rapport)

**Others' profiles**: Click any list author's avatar or link.

### 5.2 Badges

Earned automatically upon reaching milestones:

| Badge | Requirement |
|-------|-------------|
| 🆕 First Steps | Create your first list |
| 🫸 Resonance | Single list reaches Confidence ≥ 80 |
| 📣 Chorus | Single list receives ≥ 100 community scores |
| 🏆 Pioneer | First list in a category |

### 5.3 Rapport

The system computes taste similarity between you and other users. Find your closest matches on your profile page.

---

## 6. Share Card Export

Click "Export" on any list detail page.

### 6.1 Choose a Template (6 styles)

| Template | Style |
|----------|-------|
| 🖌️ Rice Ink | Rice-paper texture + vermillion seals |
| 🎨 Morandi | Low-saturation muted palette + rounded cards |
| 🌃 Cyber Neon | Dark background + neon colors + grid effects |
| 📰 Retro Magazine | Newspaper style + serif fonts + double-line titles |
| ⬜ Minimal White | Ample whitespace + light strokes + fine numbering |
| 📒 Sticker Journal | Washi tape + sticker decorations + dashed borders |

### 6.2 Font Scaling

Use the S / M / L / XL slider to adjust text size to suit different platforms.

### 6.3 Export

Click "Export PNG" to generate a high-resolution image. Long-press to save or share directly.

---

## 7. Account & Settings

### 7.1 Anonymous Use

By default, you can use core features anonymously — browsing and submitting community scores — identified by your device.

### 7.2 Register

Go to Settings → bind email + password to upgrade to a registered account:
- Sync across devices
- Create and manage lists
- Earn badges

### 7.3 Edit Info

In Settings you can change:
- Nickname
- Bio (Handle cannot be changed at this time)

---

## 8. FAQ

### Q: Someone is spamming low scores on my list. What can I do?

A: The system has built-in **anti-cheat**:

- ⚡ Scoring < 3 seconds → weight reduced to 0.2×
- 🖥️ Same device scores same list within 24h → weight 0
- 📏 Low score variance (SD < 0.5) → weight 0.5×
- ⚠️ All-max or all-min scores → flagged for review

### Q: Can I delete my own list?

A: Yes. Click the DELETE button in the top-right corner of the list detail page.

### Q: Can I delete someone else's list?

A: Regular users cannot. Only administrators (ADMIN role) can delete any list.

### Q: What does Confidence = 0 mean?

A: The list doesn't have enough community scores yet for a consensus to emerge. It will rise as more people participate.

### Q: Why doesn't my list appear on the homepage?

A: The Feed algorithm balances diversity, confidence, and freshness. Lists set to PRIVATE or LINK_ONLY won't appear in public feeds.

### Q: Can I edit a published list?

A: Basic info (title, note, etc.) can be edited. Adding/removing items post-publish is under development.

### Q: What languages are supported?

A: Currently **Chinese (Simplified)** and **English**, switchable via `/zh/` / `/en/` URL prefixes. More coming soon.

### Q: How do I report issues or suggest features?

A: Visit our [GitHub Issues](https://github.com/nous-hermes/weiwuweixin/issues). See [Contributing Guide](CONTRIBUTING.md).

---

## 9. Tips & Tricks 💡

### Boosting Your List's Confidence

1. **Add detailed dimension descriptions** — help others understand each axis
2. **Provide thoughtful author scores** — they're the reference for community scoring
3. **Share your list link** — more participants = higher confidence
4. **Stay active** — confidence decays over time (30-day half-life)

### Crafting a Great List

1. **Pick a meaningful scope** — "Best food in the world" is too vague; "Best dumpling shops within 500m of my apartment" is more interesting
2. **Dimensions are everything** — well-designed dimensions make scores convincing
3. **Be honest with your scores** — subjective doesn't mean random; real judgments are valuable

---

*WeiWuWeiXin — Stay subjective. Build consensus. Share your perspective.*

*Last updated: 2026-05-03 · v0.1.0*

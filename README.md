# Wrestling League Table

This website displays a **live wrestling league table** showing how players are performing across multiple wrestling companies.

The table updates automatically whenever the backend data changes.

cd wrestling-ppv-league
npm run dev

**Live Website**
- https://wrestling-ppv-league-69rj.vercel.app/

---

## 🏆 What The Website Does

- Shows a **main league table** with:
  - Player names
  - Points from WWE, AEW, NXT, and TNA
  - Overall total points
  - Automatic ranking by position

- Shows **four separate breakdown tables**:
  - WWE PPVs
  - AEW PPVs
  - NXT PPVs
  - TNA PPVs

- Each breakdown table shows:
  - Points per player for each PPV
  - Total points awarded per PPV
  - Maximum points available for that PPV

- The site is **read-only** for visitors
- All updates come from a single backend JSON file

---

## 🔄 How Updates Work

- Scores are stored in a JSON file
- When the JSON changes, the website updates automatically
- The league table reorders itself based on total points
- Everyone visiting the site sees the same standings

---

## 🧱 Technology Used

- **HTML** – Page structure and layout  
- **CSS** – Styling, layout, and responsive design  
- **JavaScript (Vanilla)** – Data loading, calculations, sorting, and rendering  
- **JSON** – Backend data source (scores and events)

Designed to run on:
- Vercel

---

## 🔒 Security & Editing

- Visitors cannot edit scores
- Frontend changes are temporary and reset on refresh
- The backend JSON file is the only source of truth

Nikhil

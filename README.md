# 📝 Smart To-Do List - Modern Task Manager

A sleek, responsive, and feature-rich **Smart To-Do List Web Application** crafted with clean **HTML5, CSS3, and Vanilla JavaScript**. Designed with a modern lavender/light-purple aesthetic, smooth micro-interactions, dynamic dashboard statistics, progress tracking, and full offline persistence via browser **LocalStorage**.

---

## 🌟 Key Features

- **Intuitive Task Management**:
  - Add tasks with a title, optional description, priority rating, and deadline.
  - Edit existing tasks seamlessly with a focused modal.
  - Mark tasks as completed or pending with smooth check-off animations.
  - Delete tasks with an interactive confirmation modal to avoid accidental data loss.
- **Priority Categorization**:
  - Color-coded badges for **High** (Crimson), **Medium** (Amber), and **Low** (Emerald) priorities.
  - Visual accent border indicators on each task card.
- **Smart Deadline & Overdue Alerts**:
  - Set optional due dates for tasks.
  - Automatic identification of overdue tasks with an alert badge and dashboard counter.
  - Highlights tasks due today.
- **Interactive Dashboard & Progress Tracking**:
  - Live stat cards: **Total Tasks**, **Pending Tasks**, and **Completed Tasks**.
  - Animated progress bar showing real-time completion percentage and motivational messages.
- **Dynamic Search & Filtering**:
  - Real-time search across task titles and descriptions.
  - Filter tabs: **All**, **Pending**, and **Completed** with live counter badges.
  - Secondary filter by Priority level.
  - Sort tasks by: Newest first, Oldest first, Earliest Due Date, Priority (High to Low), or Alphabetical.
- **Storage & State Persistence**:
  - Automatically saves all tasks and changes in browser `LocalStorage`.
  - Initial sample tasks loaded on the very first visit to demonstrate all features.
  - Option to reload sample tasks anytime.
- **Light & Dark Mode**:
  - One-click theme toggle between Lavender Light mode and Deep Slate Dark mode.
  - Remembers user theme preference in `LocalStorage`.
- **Responsive & Accessible**:
  - Built from mobile-first to widescreen desktops (CSS Grid & Flexbox).
  - Keyboard accessible (ESC closes modals, Enter submits forms).
  - Zero external JavaScript frameworks or database dependencies required.

---

## 🎨 Design System & Palette

- **Primary Colors**: Soft Lavender (`#ede9fe`), Vibrant Violet (`#7c3aed`), and Deep Midnight Indigo (`#1e1b4b`).
- **Dark Theme**: Deep Slate Purple (`#0d0b18` & `#17142b`) with vibrant purple accents (`#9333ea`).
- **Typography**: Google Font [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans).
- **Icons**: [Font Awesome 6 CDN](https://cdnjs.com/libraries/font-awesome).

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure, accessible forms, and dialog overlays |
| **CSS3** | Modern styling, CSS custom properties (variables), Grid & Flexbox layouts, keyframe animations |
| **Vanilla JavaScript (ES6+)** | State management, DOM manipulation, event handling, date logic, and LocalStorage |
| **Font Awesome 6** | Modern vector iconography |
| **Google Fonts** | High-readability modern typography |

---

## 📁 Project File Structure

```plaintext
Smart To-Do List/
├── index.html        # Main semantic markup and modal dialogs
├── style.css         # Complete responsive design, animations & light/dark theme variables
├── script.js         # Core application logic, LocalStorage sync & CRUD actions
├── README.md         # Comprehensive project documentation & deployment guide
└── .gitignore        # Git ignore rules for clean repository tracking
```

---

## 🚀 Getting Started Locally

Because this project is built entirely with vanilla client-side technologies, no backend server or package manager installation is required!

### Option 1: Open Directly in Browser
1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/smart-todo-list.git
   ```
2. Navigate into the project folder:
   ```bash
   cd "smart-todo-list"
   ```
3. Double-click `index.html` or open it with your favorite browser (Chrome, Firefox, Safari, Edge).

### Option 2: Run with VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and choose **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500`.

---

## 🌐 Deploying to GitHub Pages

You can host this project completely for free on **GitHub Pages** in under 2 minutes:

1. **Create a GitHub Repository**:
   - Go to [GitHub.com](https://github.com/) and click **New Repository**.
   - Name it `smart-todo-list` (or any name you prefer).
   - Keep it **Public** and leave it empty.

2. **Push the Files to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Smart To-Do List Web Application"
   git branch -M main
   git remote add origin https://github.com/your-username/smart-todo-list.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - In your GitHub repository, click on **Settings** (top tab).
   - In the left sidebar, navigate to **Pages** under *Code and automation*.
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Set the branch to `main` and the folder to `/(root)`.
   - Click **Save**.

4. **View Your Live Web App**:
   - Within 1–2 minutes, GitHub will generate a live URL:
     `https://your-username.github.io/smart-todo-list/`
   - Share this link directly in your resume or portfolio!

---

## 📸 Screenshots & UI Preview

> *You can add screenshots of your live application here after deploying.*

### ☀️ Light Mode Dashboard
*Clean lavender interface with stats cards, progress tracking, and priority badges.*

### 🌙 Dark Mode Dashboard
*Sleek dark theme optimized for eye comfort in low-light environments.*

---

## 💡 Code Highlights & Beginner-Friendly Tips

- **Safe Input Sanitization**: Form inputs are safely escaped (`escapeHTML`) before injecting into the DOM to prevent cross-site scripting (XSS).
- **Graceful Error Handling**: Validates empty task inputs and provides real-time field error highlights.
- **Modular JavaScript**: Functions are organized clearly by responsibility: Initialization, State Management, CRUD Actions, Modal Controllers, and Rendering.

---

## 📄 License

This project is open-source and free to use for personal, academic, or portfolio purposes. Feel free to customize and expand it!

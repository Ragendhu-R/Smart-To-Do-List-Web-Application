/**
 * ==============================================================================
 * SMART TO-DO LIST - MAIN APPLICATION SCRIPT
 * ==============================================================================
 * A modern, responsive vanilla JavaScript task management application.
 * Features:
 *   - Task creation, editing, deletion with confirmation modal
 *   - Status toggle (Pending / Completed) with animations
 *   - Priority management (High, Medium, Low) & optional deadlines
 *   - Overdue task detection & alert badges
 *   - Dynamic filtering (All, Pending, Completed, Priority) & instant search
 *   - Sorting (Newest, Oldest, Due Date, Priority, Title)
 *   - Live dashboard statistics & animated progress bar
 *   - LocalStorage persistence for tasks and theme preference
 *   - First-visit sample task initialization
 *   - Light / Dark mode toggle
 * ==============================================================================
 */

// Strict mode prevents accidental global variables and catches bugs early
"use strict";

/* --------------------------------------------------------------------------
   1. CONSTANTS & STORAGE KEYS
   -------------------------------------------------------------------------- */
const STORAGE_KEYS = {
  TASKS: "smart_todo_tasks_data",
  THEME: "smart_todo_theme_preference",
  HAS_VISITED: "smart_todo_has_visited",
};

/**
 * Starter sample tasks loaded only on the user's very first visit.
 * Showcases High, Medium, Low priorities, deadlines, and completed status.
 */
const SAMPLE_TASKS = [
  {
    id: "sample-1",
    title: "Complete Smart To-Do List project",
    description: "Finalize responsive CSS styles, test light/dark mode, and publish to GitHub Pages.",
    priority: "high",
    dueDate: getRelativeDateString(1), // Tomorrow
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "sample-2",
    title: "Review JavaScript async/await notes",
    description: "Read MDN documentation and practice mini-exercises on Promises and Fetch API.",
    priority: "medium",
    dueDate: getRelativeDateString(-1), // Yesterday (Displays Overdue badge)
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "sample-3",
    title: "Organize desktop workspace & files",
    description: "Clean up project folders, organize assets, and backup important documents.",
    priority: "low",
    dueDate: getRelativeDateString(3), // 3 days from now
    completed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: "sample-4",
    title: "Plan weekly grocery & meal prep",
    description: "List fresh vegetables, proteins, and healthy snacks for the upcoming week.",
    priority: "low",
    dueDate: "",
    completed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
];

/* --------------------------------------------------------------------------
   2. APPLICATION STATE
   -------------------------------------------------------------------------- */
const state = {
  tasks: [],
  currentFilter: "all", // "all" | "pending" | "completed"
  currentPriorityFilter: "all", // "all" | "high" | "medium" | "low"
  currentSort: "createdAt-desc",
  searchQuery: "",
  editingTaskId: null,
  taskToDeleteId: null,
  theme: "light",
};

/* --------------------------------------------------------------------------
   3. DOM ELEMENT REFERENCES
   -------------------------------------------------------------------------- */
const elements = {
  // Theme Toggle
  htmlElement: document.documentElement,
  themeToggleBtn: document.getElementById("themeToggleBtn"),

  // Date & Greeting
  dateText: document.getElementById("dateText"),
  greetingText: document.getElementById("greetingText"),
  currentYear: document.getElementById("currentYear"),

  // Dashboard Statistics
  totalTasksCount: document.getElementById("totalTasksCount"),
  pendingTasksCount: document.getElementById("pendingTasksCount"),
  completedTasksCount: document.getElementById("completedTasksCount"),
  overdueCount: document.getElementById("overdueCount"),
  progressPercentage: document.getElementById("progressPercentage"),
  progressBarFill: document.getElementById("progressBarFill"),
  progressCaption: document.getElementById("progressCaption"),

  // Search & Filter Controls
  taskSearchInput: document.getElementById("taskSearchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  filterTabs: document.querySelectorAll(".filter-tab"),
  tabBadgeAll: document.getElementById("tabBadgeAll"),
  tabBadgePending: document.getElementById("tabBadgePending"),
  tabBadgeCompleted: document.getElementById("tabBadgeCompleted"),
  priorityFilter: document.getElementById("priorityFilter"),
  sortBySelect: document.getElementById("sortBySelect"),
  clearCompletedBtn: document.getElementById("clearCompletedBtn"),

  // Task List & Section Headings
  taskList: document.getElementById("taskList"),
  emptyState: document.getElementById("emptyState"),
  emptyStateTitle: document.getElementById("emptyStateTitle"),
  emptyStateDescription: document.getElementById("emptyStateDescription"),
  taskSectionHeading: document.getElementById("taskSectionHeading"),
  activeFilterCount: document.getElementById("activeFilterCount"),
  loadSampleTasksBtn: document.getElementById("loadSampleTasksBtn"),
  emptyStateAddBtn: document.getElementById("emptyStateAddBtn"),

  // Add / Edit Modal
  taskModalOverlay: document.getElementById("taskModalOverlay"),
  taskForm: document.getElementById("taskForm"),
  taskIdInput: document.getElementById("taskIdInput"),
  taskTitleInput: document.getElementById("taskTitleInput"),
  taskDescInput: document.getElementById("taskDescInput"),
  descCharCount: document.getElementById("descCharCount"),
  taskDueDateInput: document.getElementById("taskDueDateInput"),
  modalTitle: document.getElementById("modalTitle"),
  modalSubtitle: document.getElementById("modalSubtitle"),
  saveBtnText: document.getElementById("saveBtnText"),
  openAddTaskModalBtn: document.getElementById("openAddTaskModalBtn"),
  closeTaskModalBtn: document.getElementById("closeTaskModalBtn"),
  cancelTaskModalBtn: document.getElementById("cancelTaskModalBtn"),
  titleErrorMsg: document.getElementById("titleErrorMsg"),

  // Delete Confirmation Modal
  deleteModalOverlay: document.getElementById("deleteModalOverlay"),
  deleteTaskTitlePreview: document.getElementById("deleteTaskTitlePreview"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

  // Toast Container
  toastContainer: document.getElementById("toastContainer"),
};

/* --------------------------------------------------------------------------
   4. INITIALIZATION & SETUP
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initDateAndGreeting();
  loadTasksFromStorage();
  bindEventListeners();
  renderApp();
});

/**
 * Initializes theme based on localStorage preference or system theme.
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    state.theme = savedTheme;
  } else {
    // Check user's OS color scheme preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    state.theme = prefersDark ? "dark" : "light";
  }
  applyTheme(state.theme);
}

/**
 * Applies the given theme to HTML root element and updates storage.
 * @param {string} theme - "light" or "dark"
 */
function applyTheme(theme) {
  state.theme = theme;
  elements.htmlElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Toggles between light and dark themes.
 */
function toggleTheme() {
  const newTheme = state.theme === "light" ? "dark" : "light";
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme} mode`, "info");
}

/**
 * Sets current formatted date and personalized greeting.
 */
function initDateAndGreeting() {
  const now = new Date();

  // Update footer year dynamically
  if (elements.currentYear) {
    elements.currentYear.textContent = now.getFullYear();
  }

  // Format date display (e.g., "Monday, Oct 11")
  const options = { weekday: "short", month: "short", day: "numeric" };
  if (elements.dateText) {
    elements.dateText.textContent = now.toLocaleDateString(undefined, options);
  }

  // Greeting message based on the hour of the day
  const hour = now.getHours();
  let greeting = "Welcome back! 👋";
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning! ☀️";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon! 🌤️";
  } else {
    greeting = "Good evening! 🌙";
  }

  if (elements.greetingText) {
    elements.greetingText.textContent = greeting;
  }
}

/* --------------------------------------------------------------------------
   5. LOCALSTORAGE MANAGEMENT
   -------------------------------------------------------------------------- */
/**
 * Loads tasks from LocalStorage, or loads sample tasks on first visit.
 */
function loadTasksFromStorage() {
  const hasVisited = localStorage.getItem(STORAGE_KEYS.HAS_VISITED);
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);

  if (!hasVisited && !storedTasks) {
    // First visit: Load friendly starter tasks
    state.tasks = [...SAMPLE_TASKS];
    localStorage.setItem(STORAGE_KEYS.HAS_VISITED, "true");
    saveTasksToStorage();
  } else if (storedTasks) {
    try {
      state.tasks = JSON.parse(storedTasks) || [];
    } catch (error) {
      console.error("Failed to parse tasks from localStorage:", error);
      state.tasks = [];
    }
  } else {
    state.tasks = [];
  }
}

/**
 * Persists current task state into LocalStorage.
 */
function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error);
    showToast("Error saving tasks to browser storage", "danger");
  }
}

/* --------------------------------------------------------------------------
   6. EVENT LISTENERS
   -------------------------------------------------------------------------- */
function bindEventListeners() {
  // Theme Toggle Button
  elements.themeToggleBtn.addEventListener("click", toggleTheme);

  // Modal Open/Close Buttons
  elements.openAddTaskModalBtn.addEventListener("click", () => openTaskModal());
  elements.closeTaskModalBtn.addEventListener("click", closeTaskModal);
  elements.cancelTaskModalBtn.addEventListener("click", closeTaskModal);

  // Close modals on backdrop click
  elements.taskModalOverlay.addEventListener("click", (e) => {
    if (e.target === elements.taskModalOverlay) closeTaskModal();
  });
  elements.deleteModalOverlay.addEventListener("click", (e) => {
    if (e.target === elements.deleteModalOverlay) closeDeleteModal();
  });

  // Close modals via 'Escape' keyboard key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (elements.taskModalOverlay.classList.contains("is-open")) closeTaskModal();
      if (elements.deleteModalOverlay.classList.contains("is-open")) closeDeleteModal();
    }
  });

  // Task Form Submit (Add or Edit)
  elements.taskForm.addEventListener("submit", handleTaskFormSubmit);

  // Description character counter
  elements.taskDescInput.addEventListener("input", (e) => {
    elements.descCharCount.textContent = e.target.value.length;
  });

  // Task List Event Delegation (Handles Complete, Edit, and Delete clicks reliably)
  elements.taskList.addEventListener("click", (event) => {
    // 1. Toggle Task Completion
    const toggleBtn = event.target.closest(".btn-toggle-complete");
    if (toggleBtn) {
      const taskItem = toggleBtn.closest(".task-item");
      if (taskItem) {
        const taskId = taskItem.getAttribute("data-task-id");
        toggleTaskCompletion(taskId);
      }
      return;
    }

    // 2. Edit Task
    const editBtn = event.target.closest(".btn-edit-task");
    if (editBtn) {
      const taskItem = editBtn.closest(".task-item");
      if (taskItem) {
        const taskId = taskItem.getAttribute("data-task-id");
        openTaskModal(taskId);
      }
      return;
    }

    // 3. Delete Task
    const deleteBtn = event.target.closest(".btn-delete-task");
    if (deleteBtn) {
      const taskItem = deleteBtn.closest(".task-item");
      if (taskItem) {
        const taskId = taskItem.getAttribute("data-task-id");
        promptDeleteTask(taskId);
      }
      return;
    }
  });

  // Real-time Search Input
  elements.taskSearchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    elements.clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
    renderApp();
  });

  // Clear Search Button
  elements.clearSearchBtn.addEventListener("click", () => {
    elements.taskSearchInput.value = "";
    state.searchQuery = "";
    elements.clearSearchBtn.style.display = "none";
    elements.taskSearchInput.focus();
    renderApp();
  });

  // Status Filter Tabs (All / Pending / Completed)
  elements.filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.filterTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      state.currentFilter = tab.getAttribute("data-filter");
      renderApp();
    });
  });

  // Priority Dropdown Filter
  elements.priorityFilter.addEventListener("change", (e) => {
    state.currentPriorityFilter = e.target.value;
    renderApp();
  });

  // Sort Order Dropdown
  elements.sortBySelect.addEventListener("change", (e) => {
    state.currentSort = e.target.value;
    renderApp();
  });

  // Clear Completed Tasks
  elements.clearCompletedBtn.addEventListener("click", handleClearCompleted);

  // Delete Modal Actions
  elements.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener("click", handleConfirmDelete);

  // Empty State Buttons
  if (elements.emptyStateAddBtn) {
    elements.emptyStateAddBtn.addEventListener("click", () => openTaskModal());
  }
  if (elements.loadSampleTasksBtn) {
    elements.loadSampleTasksBtn.addEventListener("click", handleLoadSampleTasks);
  }
}

/* --------------------------------------------------------------------------
   7. TASK CRUD OPERATIONS
   -------------------------------------------------------------------------- */

/**
 * Handles adding a new task or saving edits to an existing task.
 * @param {Event} event
 */
function handleTaskFormSubmit(event) {
  event.preventDefault();

  const title = elements.taskTitleInput.value.trim();
  const description = elements.taskDescInput.value.trim();
  const dueDate = elements.taskDueDateInput.value;
  const priorityRadio = document.querySelector('input[name="taskPriority"]:checked');
  const priority = priorityRadio ? priorityRadio.value : "medium";

  // Form Validation: Ensure title is not empty
  if (!title) {
    elements.taskTitleInput.parentElement.parentElement.classList.add("has-error");
    elements.titleErrorMsg.style.display = "block";
    elements.taskTitleInput.focus();
    return;
  }

  // Remove validation error state
  elements.taskTitleInput.parentElement.parentElement.classList.remove("has-error");
  elements.titleErrorMsg.style.display = "none";

  if (state.editingTaskId) {
    // EDIT MODE: Update existing task
    const taskIndex = state.tasks.findIndex((t) => t.id === state.editingTaskId);
    if (taskIndex !== -1) {
      state.tasks[taskIndex] = {
        ...state.tasks[taskIndex],
        title,
        description,
        priority,
        dueDate,
        updatedAt: Date.now(),
      };
      saveTasksToStorage();
      showToast("Task updated successfully! ✨", "success");
    }
  } else {
    // CREATE MODE: Add new task
    const newTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      title,
      description,
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now(),
    };

    state.tasks.unshift(newTask); // Add to beginning of array
    saveTasksToStorage();
    showToast("New task created! 🚀", "success");
  }

  closeTaskModal();
  renderApp();
}

/**
 * Toggles task status between Completed and Pending.
 * @param {string} taskId
 */
function toggleTaskCompletion(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasksToStorage();
  renderApp();

  if (task.completed) {
    showToast(`"${truncateText(task.title, 20)}" marked completed! 🎉`, "success");
  } else {
    showToast(`"${truncateText(task.title, 20)}" marked as pending.`, "info");
  }
}

/**
 * Initiates task deletion by opening confirmation modal.
 * @param {string} taskId
 */
function promptDeleteTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  state.taskToDeleteId = taskId;
  elements.deleteTaskTitlePreview.textContent = `"${task.title}"`;
  elements.deleteModalOverlay.classList.add("is-open");
  elements.confirmDeleteBtn.focus();
}

/**
 * Confirms and executes task deletion.
 */
function handleConfirmDelete() {
  if (!state.taskToDeleteId) return;

  const taskIndex = state.tasks.findIndex((t) => t.id === state.taskToDeleteId);
  if (taskIndex !== -1) {
    const deletedTaskTitle = state.tasks[taskIndex].title;
    state.tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    showToast(`"${truncateText(deletedTaskTitle, 20)}" was deleted.`, "danger");
  }

  closeDeleteModal();
  renderApp();
}

/**
 * Clears all completed tasks from list.
 */
function handleClearCompleted() {
  const completedCount = state.tasks.filter((t) => t.completed).length;
  if (completedCount === 0) return;

  const confirmClear = window.confirm(`Are you sure you want to delete all ${completedCount} completed task(s)?`);
  if (!confirmClear) return;

  state.tasks = state.tasks.filter((t) => !t.completed);
  saveTasksToStorage();
  showToast(`Removed ${completedCount} completed task(s).`, "info");
  renderApp();
}

/**
 * Re-loads sample tasks if user wants them back.
 */
function handleLoadSampleTasks() {
  state.tasks = [...SAMPLE_TASKS];
  saveTasksToStorage();
  showToast("Sample tasks loaded successfully!", "success");
  renderApp();
}

/* --------------------------------------------------------------------------
   8. MODAL CONTROLLERS
   -------------------------------------------------------------------------- */

/**
 * Opens task modal in either Create or Edit mode.
 * @param {string|null} taskId - Task ID if editing, or null for new task
 */
function openTaskModal(taskId = null) {
  state.editingTaskId = taskId;

  // Clear previous errors
  elements.taskTitleInput.parentElement.parentElement.classList.remove("has-error");
  elements.titleErrorMsg.style.display = "none";

  if (taskId) {
    // EDIT MODE
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    elements.modalTitle.textContent = "Edit Task";
    elements.modalSubtitle.textContent = "Make adjustments to your task details";
    elements.saveBtnText.textContent = "Save Changes";
    elements.taskIdInput.value = task.id;
    elements.taskTitleInput.value = task.title;
    elements.taskDescInput.value = task.description || "";
    elements.descCharCount.textContent = (task.description || "").length;
    elements.taskDueDateInput.value = task.dueDate || "";

    // Set priority radio
    const priorityRadio = document.querySelector(`input[name="taskPriority"][value="${task.priority}"]`);
    if (priorityRadio) priorityRadio.checked = true;
  } else {
    // CREATE MODE
    elements.modalTitle.textContent = "Add New Task";
    elements.modalSubtitle.textContent = "Create a task to stay on top of your schedule";
    elements.saveBtnText.textContent = "Save Task";
    elements.taskForm.reset();
    elements.taskIdInput.value = "";
    elements.descCharCount.textContent = "0";

    // Set default priority to Medium
    const defaultPriorityRadio = document.querySelector('input[name="taskPriority"][value="medium"]');
    if (defaultPriorityRadio) defaultPriorityRadio.checked = true;
  }

  elements.taskModalOverlay.classList.add("is-open");
  setTimeout(() => {
    elements.taskTitleInput.focus();
  }, 50);
}

/**
 * Closes the Add / Edit task modal.
 */
function closeTaskModal() {
  elements.taskModalOverlay.classList.remove("is-open");
  state.editingTaskId = null;
  elements.taskForm.reset();
}

/**
 * Closes the Delete Confirmation modal.
 */
function closeDeleteModal() {
  elements.deleteModalOverlay.classList.remove("is-open");
  state.taskToDeleteId = null;
}

/* --------------------------------------------------------------------------
   9. FILTERING, SORTING & RENDERING
   -------------------------------------------------------------------------- */

/**
 * Main render function that updates stats, filtered items, and task cards.
 */
function renderApp() {
  updateDashboardStats();
  renderTaskList();
}

/**
 * Calculates and renders statistics, badges, and progress bar.
 */
function updateDashboardStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  // Calculate overdue tasks (tasks not completed with due date < today)
  const todayDateString = getTodayDateString();
  const overdue = state.tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayDateString
  ).length;

  // Update counters
  elements.totalTasksCount.textContent = total;
  elements.pendingTasksCount.textContent = pending;
  elements.completedTasksCount.textContent = completed;
  elements.overdueCount.textContent = overdue;

  // Update filter tab badges
  elements.tabBadgeAll.textContent = total;
  elements.tabBadgePending.textContent = pending;
  elements.tabBadgeCompleted.textContent = completed;

  // Calculate percentage
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  elements.progressPercentage.textContent = `${percentage}%`;
  elements.progressBarFill.style.width = `${percentage}%`;
  elements.progressBarFill.parentElement.setAttribute("aria-valuenow", percentage);

  // Dynamic progress caption
  if (total === 0) {
    elements.progressCaption.textContent = "No tasks added yet. Ready to get started?";
  } else if (percentage === 100) {
    elements.progressCaption.textContent = "🎉 Amazing! All tasks are completed!";
  } else if (percentage >= 70) {
    elements.progressCaption.textContent = "Almost there! Keep up the great work!";
  } else if (percentage >= 30) {
    elements.progressCaption.textContent = "Making steady progress! Step by step.";
  } else {
    elements.progressCaption.textContent = "Every great journey starts with a single step.";
  }

  // Clear completed button state
  elements.clearCompletedBtn.disabled = completed === 0;
}

/**
 * Filters, sorts, and renders the task list into the DOM.
 */
function renderTaskList() {
  // 1. Filter by Status (all, pending, completed)
  let filtered = state.tasks.filter((task) => {
    if (state.currentFilter === "pending") return !task.completed;
    if (state.currentFilter === "completed") return task.completed;
    return true; // 'all'
  });

  // 2. Filter by Priority (all, high, medium, low)
  if (state.currentPriorityFilter !== "all") {
    filtered = filtered.filter((task) => task.priority === state.currentPriorityFilter);
  }

  // 3. Search Query Filter (Title or Description match)
  if (state.searchQuery) {
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(state.searchQuery) ||
        (task.description && task.description.toLowerCase().includes(state.searchQuery))
    );
  }

  // 4. Sort Tasks
  filtered.sort((a, b) => {
    switch (state.currentSort) {
      case "createdAt-asc":
        return a.createdAt - b.createdAt;
      case "createdAt-desc":
        return b.createdAt - a.createdAt;
      case "dueDate-asc":
        // Put tasks without due date at the end
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case "priority-desc": {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      }
      case "title-asc":
        return a.title.localeCompare(b.title);
      default:
        return b.createdAt - a.createdAt;
    }
  });

  // Update Section Header and Count
  const filterNames = {
    all: "All Tasks",
    pending: "Pending Tasks",
    completed: "Completed Tasks",
  };
  elements.taskSectionHeading.textContent = filterNames[state.currentFilter] || "Tasks";
  elements.activeFilterCount.textContent = `${filtered.length} ${filtered.length === 1 ? "task" : "tasks"}`;

  // Handle Empty State
  if (filtered.length === 0) {
    elements.taskList.innerHTML = "";
    elements.emptyState.style.display = "flex";

    if (state.searchQuery) {
      elements.emptyStateTitle.textContent = "No matches found";
      elements.emptyStateDescription.textContent = `No tasks matching "${escapeHTML(state.searchQuery)}". Try searching with different keywords.`;
    } else if (state.currentFilter === "completed") {
      elements.emptyStateTitle.textContent = "No completed tasks yet";
      elements.emptyStateDescription.textContent = "Tasks you mark as completed will show up here.";
    } else if (state.currentFilter === "pending") {
      elements.emptyStateTitle.textContent = "No pending tasks!";
      elements.emptyStateDescription.textContent = "You're all caught up! Enjoy your free time or add a new goal.";
    } else {
      elements.emptyStateTitle.textContent = "Your task list is empty";
      elements.emptyStateDescription.textContent = "Ready to boost your productivity? Add your first task or load samples!";
    }
    return;
  }

  // Hide empty state when tasks exist
  elements.emptyState.style.display = "none";

  // Build Task List HTML
  elements.taskList.innerHTML = filtered
    .map((task) => createTaskCardHTML(task))
    .join("");

  // Event handling is managed efficiently by delegation on elements.taskList
}

/**
 * Returns HTML string representation of a single task card.
 * @param {Object} task
 */
function createTaskCardHTML(task) {
  const isCompleted = task.completed;
  const todayStr = getTodayDateString();
  const isOverdue = !isCompleted && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !isCompleted && task.dueDate && task.dueDate === todayStr;

  // Priority Label Formats
  const priorityLabels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  const priorityClass = `badge-priority-${task.priority}`;

  // Due Date Badge Logic
  let deadlineHTML = "";
  if (task.dueDate) {
    let deadlineBadgeClass = "badge-deadline";
    let deadlineIcon = '<i class="fa-regular fa-calendar"></i>';
    let formattedDate = formatDueDate(task.dueDate);

    if (isOverdue) {
      deadlineBadgeClass += " is-overdue";
      deadlineIcon = '<i class="fa-solid fa-triangle-exclamation"></i>';
      formattedDate = `Overdue (${formattedDate})`;
    } else if (isDueToday) {
      deadlineBadgeClass += " is-today";
      deadlineIcon = '<i class="fa-solid fa-clock"></i>';
      formattedDate = `Due Today`;
    }

    deadlineHTML = `
      <span class="meta-badge ${deadlineBadgeClass}">
        ${deadlineIcon}
        <span>${escapeHTML(formattedDate)}</span>
      </span>
    `;
  }

  return `
    <li class="task-item priority-${task.priority} ${isCompleted ? "is-completed" : ""}" data-task-id="${task.id}">
      <!-- Complete Checkbox Toggle -->
      <div class="task-checkbox-wrapper">
        <button 
          type="button" 
          class="custom-checkbox btn-toggle-complete" 
          aria-label="${isCompleted ? "Mark as pending" : "Mark as completed"}"
          title="${isCompleted ? "Mark as pending" : "Mark as completed"}"
        >
          <i class="fa-solid fa-check"></i>
        </button>
      </div>

      <!-- Task Content Body -->
      <div class="task-content">
        <div class="task-title-row">
          <span class="task-title">${escapeHTML(task.title)}</span>
        </div>

        ${
          task.description
            ? `<p class="task-description">${escapeHTML(task.description)}</p>`
            : ""
        }

        <!-- Task Metadata Badges -->
        <div class="task-meta">
          <!-- Priority Badge -->
          <span class="meta-badge ${priorityClass}">
            <i class="fa-solid fa-flag"></i>
            <span>${priorityLabels[task.priority] || "Medium"}</span>
          </span>

          <!-- Deadline Badge -->
          ${deadlineHTML}
        </div>
      </div>

      <!-- Action Buttons: Edit & Delete -->
      <div class="task-actions">
        <button 
          type="button" 
          class="btn-task-action action-edit btn-edit-task" 
          title="Edit task" 
          aria-label="Edit task"
        >
          <i class="fa-solid fa-pen"></i>
        </button>
        <button 
          type="button" 
          class="btn-task-action action-delete btn-delete-task" 
          title="Delete task" 
          aria-label="Delete task"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </li>
  `;
}

/* --------------------------------------------------------------------------
   10. TOAST NOTIFICATIONS HELPER
   -------------------------------------------------------------------------- */
/**
 * Displays a toast notification in bottom right corner.
 * @param {string} message
 * @param {"success"|"info"|"warning"|"danger"} type
 * @param {number} duration - Time in milliseconds
 */
function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: "fa-solid fa-circle-check",
    info: "fa-solid fa-circle-info",
    warning: "fa-solid fa-triangle-exclamation",
    danger: "fa-solid fa-circle-xmark",
  };

  const iconClass = iconMap[type] || iconMap.info;

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <span>${escapeHTML(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  // Auto remove toast after duration
  setTimeout(() => {
    toast.classList.add("toast-hiding");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, duration);
}

/* --------------------------------------------------------------------------
   11. DATE & STRING UTILITIES
   -------------------------------------------------------------------------- */

/**
 * Returns today's date in YYYY-MM-DD format based on local time.
 * @returns {string}
 */
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns a date string YYYY-MM-DD relative to today by offset in days.
 * @param {number} dayOffset
 * @returns {string}
 */
function getRelativeDateString(dayOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string into human-friendly format (e.g., "Oct 12, 2026").
 * @param {string} dateString
 * @returns {string}
 */
function formatDueDate(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Truncates a string with ellipsis if longer than maxLength.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncateText(text, maxLength = 25) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

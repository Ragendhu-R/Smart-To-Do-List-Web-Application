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


// Render logic in next commit

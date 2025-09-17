// Initialize default states when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    tasks: [],
    drawerOpen: false
  });
});

// Toggle injected drawer when the extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Proactively inject content script for existing tabs (idempotent: inject.js guards against duplicate)
    if (tab && tab.id && tab.url && /^(https?:|file:)/.test(tab.url)) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['inject.js']
      });
      // Flip global drawer state; inject.js listens to this to open/close
      const { drawerOpen } = await chrome.storage.local.get('drawerOpen');
      const newState = !Boolean(drawerOpen);
      await chrome.storage.local.set({ drawerOpen: newState });
      console.log('Drawer state changed:', drawerOpen, '->', newState);
      return;
    }
  } catch (err) {
    // Ignore injection errors on restricted pages (chrome://, edge://, etc.)
    console.warn('Injection skipped:', err?.message || err);
  }

  // For non-injectable pages, just log the attempt
  console.log('Cannot inject on this page:', tab?.url);
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addTask') {
    // Handle adding a new task
    chrome.storage.local.get('tasks', (result) => {
      const tasks = result.tasks || [];
      const newTask = {
        id: Date.now(),
        text: request.text,
        completed: false
      };
      tasks.push(newTask);
      chrome.storage.local.set({ tasks }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'getTasks') {
    // Return all tasks
    chrome.storage.local.get('tasks', (result) => {
      sendResponse({ tasks: result.tasks || [] });
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'toggleTask') {
    // Toggle task completion status
    chrome.storage.local.get('tasks', (result) => {
      const tasks = result.tasks || [];
      const taskIndex = tasks.findIndex(t => t.id === request.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        chrome.storage.local.set({ tasks }, () => {
          sendResponse({ success: true });
        });
      }
    });
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'deleteTask') {
    // Delete a task
    chrome.storage.local.get('tasks', (result) => {
      const tasks = (result.tasks || []).filter(t => t.id !== request.id);
      chrome.storage.local.set({ tasks }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Will respond asynchronously
  }
});

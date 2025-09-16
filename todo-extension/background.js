// Enable the side panel by default when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default state
  chrome.storage.local.set({
    tasks: [],
    sidePanelOpen: true
  });
  
  // Enable the side panel by default
  chrome.sidePanel.setOptions({
    enabled: true
  });
});

// Open side panel when the extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  // Open the side panel for this tab
  await chrome.sidePanel.open({ tabId: tab.id });
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

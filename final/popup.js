
function showCustomAlert(message) {
  let alertContainer = document.createElement("div");
  alertContainer.classList.add("custom-alert");

  let alertMessage = document.createElement("p");
  alertMessage.textContent = message;

  let closeButton = document.createElement("button");
  closeButton.textContent = "OK";
  closeButton.classList.add("custom-alert-close-btn");
  closeButton.addEventListener("click", function () {
    document.body.removeChild(alertContainer);
  });

  alertContainer.appendChild(alertMessage);
  alertContainer.appendChild(closeButton);
  document.body.appendChild(alertContainer);
}

let currentWorkspaceIndex = null; // Variable to track the currently active workspace

document
  .getElementById("create-workspace-btn")
  .addEventListener("click", createWorkspace);
document
  .getElementById("search-workspace-input")
  .addEventListener("input", searchWorkspaces);

function createWorkspace() {
  let workspaceName = prompt("Enter workspace name:");
  if (workspaceName) {
    chrome.storage.local.get("workspaces", function (data) {
      let workspaces = data.workspaces || [];
      workspaces.push({
        name: workspaceName,
        tabs: [],
        todoList: [], // To-Do List is initialized as an empty array here
        blockedWebsites: [],
        timer: { isRunning: false, startTime: 0, totalTime: 0 },
      });

      chrome.storage.local.set({ workspaces: workspaces }, function () {
        loadWorkspaces();
      });
    });
  }
}

function addTaskToDoList(workspaceIndex, task) {
  if (!task.trim()) {
    showCustomAlert("Task cannot be empty!");
    return;
  }

  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = data.workspaces || [];
    let workspace = workspaces[workspaceIndex];

    if (!workspace.todoList) {
      workspace.todoList = [];
    }

    workspace.todoList.push(task);

    chrome.storage.local.set({ workspaces: workspaces }, function () {
      console.log("Task added successfully!");
      loadWorkspaces(); // Reload the workspaces to reflect changes
    });
  });
}

function deleteTaskFromToDoList(workspaceIndex, taskIndex) {
  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = data.workspaces || [];
    let workspace = workspaces[workspaceIndex];

    if (workspace.todoList && workspace.todoList[taskIndex] !== undefined) {
      workspace.todoList.splice(taskIndex, 1);

      chrome.storage.local.set({ workspaces: workspaces }, function () {
        console.log("Task deleted successfully!");
        loadWorkspaces(); // Reload the workspaces to reflect changes
      });
    }
  });
}

function addBlockedWebsite(workspaceIndex, website) {
  if (!website.trim()) {
  showCustomAlert("Website cannot be empty!");
    return;
  }

  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = data.workspaces || [];
    let workspace = workspaces[workspaceIndex];

    if (!workspace.blockedWebsites) {
      workspace.blockedWebsites = [];
    }

    workspace.blockedWebsites.push(website);

    chrome.storage.local.set({ workspaces: workspaces }, function () {
      console.log("Website added to blocked list successfully!");
      loadWorkspaces(); // Reload the workspaces to reflect changes
    });
  });
}

function loadWorkspaces(filteredWorkspaces = null) {
  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = filteredWorkspaces || data.workspaces || [];
    let workspaceList = document.getElementById("workspace-list");
    workspaceList.innerHTML = "<h2>Your Workspaces</h2>";

    if (workspaces.length === 0) {
      let noWorkspacesMessage = document.createElement("p");
      noWorkspacesMessage.textContent = "No workspaces found.";
      workspaceList.appendChild(noWorkspacesMessage);
      return;
    }

    workspaces.forEach((workspace, index) => {
      let workspaceElement = document.createElement("div");
      workspaceElement.classList.add("workspace-item");

      let workspaceHeader = document.createElement("div");
      workspaceHeader.textContent = `${workspace.name}`;
      workspaceElement.appendChild(workspaceHeader);

      let workspaceButton = document.createElement("button");
      workspaceButton.textContent = "Add Tab";
      workspaceButton.addEventListener("click", function () {
        addTab(index);
      });

      let openWorkspaceButton = document.createElement("button");
      openWorkspaceButton.textContent = "Open Workspace Tabs";
      openWorkspaceButton.addEventListener("click", function () {
        openWorkspaceTabs(index);
      });

      let deleteWorkspaceButton = document.createElement("button");
      deleteWorkspaceButton.textContent = "Delete Workspace";
      deleteWorkspaceButton.addEventListener("click", function () {
        deleteWorkspace(index);
      });

      workspaceElement.appendChild(workspaceButton);
      workspaceElement.appendChild(openWorkspaceButton);
      workspaceElement.appendChild(deleteWorkspaceButton);

      let toggleTodoButton = document.createElement("button");
      toggleTodoButton.textContent = "Show To-Do List";
      toggleTodoButton.classList.add("toggle-todo-btn");
      let toggleBlockedButton = document.createElement("button");
      toggleBlockedButton.textContent = "Show Blocked Websites";
      toggleBlockedButton.classList.add("toggle-blocked-btn");
      let todoListSection = document.createElement("div");
      todoListSection.classList.add("todo-section");
      todoListSection.style.display = "none";
      let blockedWebsitesSection = document.createElement("div");
      blockedWebsitesSection.classList.add("blocked-websites-section");
      blockedWebsitesSection.style.display = "none";
      let todoInput = document.createElement("input");
      todoInput.setAttribute("placeholder", "Add a task...");
      todoInput.classList.add("todo-input");
      let blockedInput = document.createElement("input");
      blockedInput.setAttribute("placeholder", "Add a website...");
      blockedInput.classList.add("blocked-input");
      let addTodoButton = document.createElement("button");
      addTodoButton.textContent = "Add Task";
      addTodoButton.classList.add("todo-add-btn");
      addTodoButton.addEventListener("click", function () {
        addTaskToDoList(index, todoInput.value);
        todoInput.value = ""; // Clear input after adding
      });
      let addBlockedButton = document.createElement("button");
      addBlockedButton.textContent = "Add Website";
      addBlockedButton.classList.add("blocked-add-btn");
      addBlockedButton.addEventListener("click", function () {
        addBlockedWebsite(index, blockedInput.value);
        blockedInput.value = ""; // Clear input after adding
      });
      let todoList = document.createElement("ul");
      todoList.classList.add("todo-list");
      let blockedWebsitesList = document.createElement("ul");
      blockedWebsitesList.classList.add("blocked-websites-list");

      workspace.todoList.forEach((task, taskIndex) => {
        let todoItem = document.createElement("li");
        todoItem.textContent = task;

        let deleteTaskButton = document.createElement("button");
        deleteTaskButton.textContent = "Delete";
        deleteTaskButton.classList.add("delete-task-btn");
        deleteTaskButton.addEventListener("click", function () {
          deleteTaskFromToDoList(index, taskIndex);
        });

        todoItem.appendChild(deleteTaskButton);
        todoList.appendChild(todoItem);
      });

      todoListSection.appendChild(todoInput);
      todoListSection.appendChild(addTodoButton);
      todoListSection.appendChild(todoList);

      toggleTodoButton.addEventListener("click", function () {
        if (todoListSection.style.display === "none") {
          todoListSection.style.display = "block";
          toggleTodoButton.textContent = "Hide To-Do List";
        } else {
          todoListSection.style.display = "none";
          toggleTodoButton.textContent = "Show To-Do List";
        }
      });

      workspaceElement.appendChild(toggleTodoButton);
      workspaceElement.appendChild(todoListSection);

      let toggleTabButton = document.createElement("button");
      toggleTabButton.textContent = "Show Tabs";
      toggleTabButton.classList.add("toggle-tab-btn");

      let tabListSection = document.createElement("div");
      tabListSection.classList.add("tab-section");
      tabListSection.style.display = "none";

      let tabList = document.createElement("ul");
      tabList.classList.add("tab-list");
      workspace.tabs.forEach((tabId) => {
        chrome.tabs.get(tabId, function (tab) {
          if (tab) {
            let tabItem = document.createElement("li");
            tabItem.textContent = tab.title;
            tabList.appendChild(tabItem);
          }
        });
      });
      tabListSection.appendChild(tabList);
      toggleTabButton.addEventListener("click", function () {
        if (tabListSection.style.display === "none") {
          tabListSection.style.display = "block";
          toggleTabButton.textContent = "Hide Tabs";
        } else {
          tabListSection.style.display = "none";
          toggleTabButton.textContent = "Show Tabs";
        }
      });

      workspaceElement.appendChild(toggleTabButton);
      workspaceElement.appendChild(tabListSection);

      workspaceList.appendChild(workspaceElement);
    });
  });
}

function deleteWorkspace(workspaceIndex) {
  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = data.workspaces || [];
    workspaces.splice(workspaceIndex, 1);

    chrome.storage.local.set({ workspaces: workspaces }, function () {
      showCustomAlert("Workspace deleted!");
      loadWorkspaces(); // Reload workspaces after deletion
    });
  });
}

function searchWorkspaces() {
  let searchValue = document
    .getElementById("search-workspace-input")
    .value.toLowerCase();
  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = data.workspaces || [];
    let filteredWorkspaces = workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(searchValue)
    );
    loadWorkspaces(filteredWorkspaces);
  });
}

function addTab(workspaceIndex) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let currentTab = tabs[0];
    chrome.storage.local.get("workspaces", function (data) {
      let workspaces = data.workspaces || [];
      let workspace = workspaces[workspaceIndex];

      if (!workspace.tabs.includes(currentTab.id)) {
        workspace.tabs.push(currentTab.id);
        chrome.storage.local.set({ workspaces: workspaces }, function () {
          showCustomAlert("Tab added to workspace!");
          loadWorkspaces(); // Reload workspaces after update
        });
      } else {
        showCustomAlert("Tab already added to this workspace.");
      }
    });
  });
}

function openWorkspaceTabs(workspaceIndex) {
  chrome.storage.local.get("workspaces", function (data) {
    let workspaces = data.workspaces || [];
    let workspace = workspaces[workspaceIndex];

    if (workspace && workspace.tabs.length > 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let currentTab = tabs[0];

        if (currentWorkspaceIndex === workspaceIndex) {
          showCustomAlert("You are already in this workspace.");
        } else {
          let workspaceUrls = [];
          let tabCount = workspace.tabs.length;
          let tabsLoaded = 0;
          workspace.tabs.forEach(function (tabId) {
            chrome.tabs.get(tabId, function (tab) {
              if (tab && tab.url) {
                workspaceUrls.push(tab.url);
              }
              tabsLoaded++;

              if (tabsLoaded === tabCount) {
                if (workspaceUrls.length > 0) {
                  chrome.windows.create({ url: workspaceUrls, focused: true });
                  currentWorkspaceIndex = workspaceIndex;
                } else {
                  showCustomAlert("No valid URLs found in this workspace.");
                }
              }
            });
          });
        }
      });
    } else {
      showCustomAlert("No tabs in this workspace.");
    }
  });
}

loadWorkspaces(); // Load workspaces when popup is opened
 
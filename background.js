chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get("workspaces", function (data) {
        if (!data.workspaces) {
            chrome.storage.local.set({
                workspaces: [
                    {
                        name: "Default Workspace",
                        tabs: [], // Array to store tab IDs or URLs
                        todoList: [], // To-Do List
                        blockedWebsites: [], // Blocked websites
                        
                    }
                ]
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // retrieve the captured content data from chrome storage
    chrome.storage.local.get("capturedContent", (data) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving captured content:", chrome.runtime.lastError);
        } else {
            console.log("Retrieved Captured Content:\n\n", data.capturedContent); // Log retrieved content
            // append the captured content to the body of the new tab
            if (data.capturedContent) {
                document.getElementById("clonedContentDiv").innerHTML = data.capturedContent;
            }
        }
    });

    // retrieve the document's title
    chrome.storage.local.get("documentTitle", (title) => {
        if (chrome.runtime.lastError) {
            console.error("Error retrieving captured content:", chrome.runtime.lastError);
        } else {
            document.title = title.documentTitle;
            console.log(title.documentTitle);
        }
    });
});

// check if service worker is active.
chrome.runtime.onInstalled.addListener(function () {
    console.log("Service worker is active.");
    // set badge indicator to OFF by default
    chrome.action.setBadgeText({ text: "OFF" });
});

// initialize badge for the first time when the extension is loaded
chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
    if (currentTab) {
        if (isValidUrl(currentTab.url)) {
            chrome.action.setBadgeText({ text: "ON", tabId: currentTab.id });
            console.log("Extension is working on targeted site (dev.to)");
        } else {
            chrome.action.setBadgeText({ text: "OFF", tabId: currentTab.id });
            console.error(`Invalid URL: ${currentTab.url}\nExtension cannot work outside of dev.to and its subdomains.`);
            disableButtons();
            displayErrorMessage("Extension cannot work outside of\ndev.to and its subdomains.");
        }
    } else {
        console.warn("No active tab found.");
    }
});

// add listeners for tab updates and active tab changes to update the badge icon
chrome.tabs.onUpdated.addListener(updateBadgeText);
chrome.tabs.onActivated.addListener(handleActivated);

// function to update the badge text on icon based on the current URL
function updateBadgeText(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        if (isValidUrl(tab.url)) {
            chrome.action.setBadgeText({ text: "ON", tabId: tabId });
        } else {
            chrome.action.setBadgeText({ text: "OFF", tabId: tabId });
            console.error(`Invalid URL: ${tab.url}\nExtension cannot work outside of dev.to and its subdomains.`);
            disableButtons();
            displayErrorMessage("Extension cannot work outside of\ndev.to and its subdomains.");
        }
    }
}

// function to check if the tab URL belongs to dev.to or its subdomains
function isValidUrl(url) {
    if (url.includes("dev.to") || url.includes(".dev.to")) {
        return url;
    } else {
        return console.error("URL doesn't match dev.to")
    }
}

// function to disable buttons on error state
function disableButtons() {
    document.querySelectorAll(".btn").forEach((item) => {
        item.disabled = true;
        item.style.cursor = "not-allowed";
    });
}

// function to display the actual error message
function displayErrorMessage(message) {
    const nodeStyling = {
        nodeClass: ["w-100 bg-warning text-center text-black fs-3 p-2 m-0 rounded font-weight-bold"],
    };

    const errorContainer = document.createElement("div");
    const node = document.createElement("p");
    node.setAttribute("class", nodeStyling.nodeClass.join(" "));

    node.textContent = message;
    errorContainer.appendChild(node);

    document.getElementById("mainContent").appendChild(errorContainer);
}

// function to handle activated tab changes
function handleActivated(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (isValidUrl(tab.url)) {
            chrome.action.setBadgeText({ text: "ON", tabId: activeInfo.tabId });
        } else {
            chrome.action.setBadgeText({ text: "OFF", tabId: activeInfo.tabId });
            console.error(`Invalid URL: ${tab.url}\nExtension cannot work outside of dev.to and its subdomains.`);
            disableButtons();
            displayErrorMessage("Extension cannot work outside of\ndev.to and its subdomains.");
        }
    });
}
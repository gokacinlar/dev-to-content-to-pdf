/**
 * Main script to be injected and
 * manipulate the DOM itself
 */

document.addEventListener("DOMContentLoaded", () => {
    let captureArticleBtn = document.getElementById("articleBtn");

    if (captureArticleBtn) {
        // add event listener for the captureArticleBtn click
        captureArticleBtn.addEventListener("click", async () => {
            // query the active tab
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // inject the main script into the active tab to capture the content
            // and manipulate the DOM
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: captureContentFromActiveTab,
            }, (injectionResults) => {
                // get the captured content from the results
                let capturedContent = injectionResults[0].result;
                console.log("Captured content:", capturedContent); // log captured content

                // store the captured content in chrome storage to pass it to the new tab
                chrome.storage.local.set({ capturedContent: capturedContent }, () => {
                    // create a new tab with content.html
                    chrome.tabs.create({ url: "/src/content.html" }, (tab) => {
                        console.log("New tab have been created:", tab);
                    });
                });
            });
        });
    } else {
        console.error("Button with id 'articleBtn' has not been found.");
    }
});

/**
 *  Function to capture content from the active tab
 */

function captureContentFromActiveTab() {
    // select the article content
    const articleBody = document.querySelector("#article-show-container");
    if (!articleBody) {
        return alert("Content could not be found!")
    } else {
        let clonedNodeContent = articleBody.cloneNode(true); // perform a deep clone

        // return the HTML string of the modified article content
        return clonedNodeContent.outerHTML;
    }
}
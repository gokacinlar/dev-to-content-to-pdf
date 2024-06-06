// retrieve the document's title
chrome.storage.local.get("documentTitle", (title) => {
    if (chrome.runtime.lastError) {
        console.error("Error retrieving captured content:", chrome.runtime.lastError);
    } else {
        // assign article name to later recall it using template literal
        const articleName = title.documentTitle;

        // retrieve the actual content of the DOM
        chrome.storage.local.get("capturedContent", (data) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving captured content:", chrome.runtime.lastError);
            } else {
                /**
                 * Save the content as HTML
                 */

                const saveAsHtmlButton = document.getElementById("saveAsHtml");
                // define the content
                const documentContent = data.capturedContent;
                if (documentContent) {
                    console.log(documentContent);
                } else {
                    console.error("Document content could not be retrieved.");
                    return;
                }

                // define the function to save HTML DOM as plain text via blob
                function downloadBlob(blob, name = "file.txt") {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.style.display = "none";
                    link.href = blobUrl;
                    link.download = name;

                    document.body.appendChild(link);
                    link.click();

                    window.URL.revokeObjectURL(blobUrl);
                }

                const textBlob = new Blob([documentContent], { type: "text/plain" }); // specify the mime type

                saveAsHtmlButton.addEventListener("click", () => {
                    downloadBlob(textBlob, `${articleName}`);
                });
            }
        });
    }
});
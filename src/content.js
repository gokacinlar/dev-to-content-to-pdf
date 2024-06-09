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
                 * Save the content as PDF
                 */
                const saveAsPdfButton = document.getElementById("saveAsPdf");
                if (saveAsPdfButton) {
                    saveAsPdfButton.addEventListener("click", generateArticlePDF);
                }

                // not rendering correctly
                // fix me
                function generateArticlePDF() {
                    const articleSource = document.getElementById("clonedContentDiv");
                    if (articleSource) {
                        html2pdf(articleSource)
                        // html2pdf options
                        var opt = {
                            margin: 0,
                            filename: `${articleName}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 1 },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        };
                        // save with new promise based api
                        html2pdf().set(opt).from(articleSource).save();
                    }
                }

                /**
                 * Save the content as HTML
                 */

                const saveAsHtmlButton = document.getElementById("saveAsHtml");
                if (saveAsHtmlButton) {
                    saveAsHtmlButton.addEventListener("click", () => {
                        downloadHtmlBlob(htmlBlob, `${articleName}`);
                    });
                }

                // define the content
                const documentContent = data.capturedContent;

                // define the function to save HTML DOM as plain text via blob
                function downloadHtmlBlob(blob, name = "file.html") {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.style.display = "none";
                    link.href = blobUrl;

                    // optional code to rename output .htm to .html
                    // fix me
                    // link.download = name.replace(/\.[^.]+$/, ".html");

                    document.body.appendChild(link);
                    link.click();

                    window.URL.revokeObjectURL(blobUrl);
                }

                const htmlBlob = new Blob([documentContent], { type: "text/html" }); // specify the mime type
                /**
                 * Save the content as plain Text
                 */

                // function to format the output of the content on TXT file
                function removeHtmlTags(input) {
                    // ai generated regex
                    let cleanedText = input.replace(/<\/?[^>]+(>|$)/g, " "); // replace HTML tags with a space

                    cleanedText = cleanedText.replace(/\s\s+/g, " ").trim(); // replace multiple spaces with a single space

                    return cleanedText;
                }

                const saveAsTextButton = document.getElementById("saveAsText");

                function downloadTextBlob(blob, name = "file.txt") {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.style.display = "none";
                    link.href = blobUrl;
                    link.download = name;

                    document.body.appendChild(link);
                    link.click();

                    window.URL.revokeObjectURL(blobUrl);
                }

                // use FileReader object to read the blob, format it back in plain txt
                // and then pass onto the saveAsTextButton addEventListener
                const reader = new FileReader();
                reader.onload = function () {
                    const text = reader.result;
                    const cleanedText = removeHtmlTags(text);
                    const cleanedTextBlob = new Blob([cleanedText], { type: "text/plain" });

                    saveAsTextButton.addEventListener("click", () => {
                        downloadTextBlob(cleanedTextBlob, `${articleName}`);
                    });
                }
                reader.readAsText(new Blob([documentContent], { type: "text/plain" }));
            }
        });
    }
});
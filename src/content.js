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

                function generateArticlePDF() {
                    // initialize html2canvas library
                    window.html2canvas = html2canvas;

                    const articleSource = document.getElementById("clonedContentDiv");
                    if (articleSource) {
                        // fix me
                        articleSource.innerHTML = data.capturedContent;
                        // initialize the jspdf object & class
                        const { jsPDF } = window.jspdf;
                        var newPdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size
                        console.log("Starting to generate PDF");

                        newPdf.html(articleSource, {
                            callback: function (doc) {
                                console.log("HTML content added to PDF, now saving...");
                                doc.save("document.pdf");
                                // open PDF in a new window after content is added
                                doc.output("dataurlnewwindow");
                            },
                            x: 15,
                            y: 15,
                            orientation: 'p',
                            unit: 'pt',
                            format: 'letter',
                            putOnlyUsedFonts: true,
                            compress: true,
                            windowWidth: 180
                        });
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
                if (documentContent) {
                    console.log(documentContent);
                } else {
                    console.error("Document content could not be retrieved.");
                    return;
                }

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
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
                const spinner = saveAsPdfButton.querySelector(".spinner-border");
                const buttonText = saveAsPdfButton.querySelector(".button-text");

                if (saveAsPdfButton) {
                    saveAsPdfButton.addEventListener("click", generateArticlePDF);
                }

                spinner.classList.add("d-none");
                buttonText.classList.remove("d-none");

                function generateArticlePDF() {
                    // show the spinner and hide the text
                    spinner.classList.remove("d-none");
                    buttonText.classList.add("d-none");
                    setTimeout(() => {
                        const articleSource = document.getElementById("clonedContentDiv");
                        // article styling
                        // ugly as hell on implementation but works for now
                        articleSource.style.width = "98%";
                        articleSource.style.margin = "0";
                        articleSource.style.padding = ".75em";
                        if (articleSource) {
                            html2pdf(articleSource)
                            // html2pdf options
                            var opt = {
                                margin: 0,
                                filename: `${articleName}.pdf`,
                                image: { type: 'jpeg', quality: 1 },
                                html2canvas: { scale: 1 },
                                pagebreak: { mode: 'avoid-all' },
                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                            };
                            // save with new promise based api
                            html2pdf().set(opt).from(articleSource).save();
                        }
                        // revert back to old button styling
                        spinner.classList.add("d-none");
                        buttonText.classList.remove("d-none");
                    }, 500);
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
                        downloadTextBlob(cleanedTextBlob, `${articleName}.txt`);
                    });
                }
                reader.readAsText(new Blob([documentContent], { type: "text/plain" }));
            }
        });
    }
});
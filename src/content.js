// retrieve the document's title
chrome.storage.local.get("documentTitle", (title) => {
    if (chrome.runtime.lastError) {
        console.error("Error retrieving document title:", chrome.runtime.lastError);
    } else {
        const articleName = title.documentTitle;

        // retrieve the actual content of the DOM
        chrome.storage.local.get("capturedContent", (data) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving captured content:", chrome.runtime.lastError);
            } else {
                const documentContent = data.capturedContent;

                /**
                 * Generate PDF from the article content
                 */

                const saveAsPdfButton = document.getElementById("saveAsPdf");
                const spinner = saveAsPdfButton.querySelector(".spinner-border");
                const buttonText = saveAsPdfButton.querySelector(".button-text");

                saveAsPdfButton.addEventListener("click", () => {
                    initialButtonStage();
                    setTimeout(() => {
                        const articleSource = document.getElementById("clonedContentDiv");
                        stylingArticle(articleSource);
                        if (articleSource) {
                            const opt = {
                                margin: [0, 0, 0, 0],
                                filename: `${articleName}.pdf`,
                                image: { type: 'jpeg', quality: 1 },
                                html2canvas: { scale: 2, letterRendering: true, allowTaint: false, useCORS: true },
                                pagebreak: { mode: ['css', 'avoid-all', 'legacy'] },
                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                                enableLinks: true
                            };
                            html2pdf().set(opt).from(articleSource).save().then(() => {
                                revertArticle(articleSource);
                            });
                        } else {
                            alert("Article source could not be found!");
                        }
                        spinnerStage();
                    }, 250);
                });

                /**
                 * Save the content as HTML
                 */
                const saveAsHtmlButton = document.getElementById("saveAsHtml");
                saveAsHtmlButton.addEventListener("click", () => {
                    const tempContainer = document.createElement("div");
                    tempContainer.innerHTML = documentContent;

                    // remove elements that is unnecessary in here with foreach function
                    const idsToRemove = [
                        "#comments",
                        "#hide-comments-modal",
                        "#hide-comments-modal__form"
                    ];

                    idsToRemove.forEach(id => removeUnnecessaryElementsFromContent(id, tempContainer));

                    const htmlBlob = new Blob([tempContainer.innerHTML], { type: "text/html" });
                    downloadHtmlBlob(htmlBlob, `${articleName}.html`);
                });

                /**
                 * Save the content as plain Text with options of html and without html
                 */

                const saveAsTextButton = document.getElementById("saveAsText");
                const saveAsTextWithHtmlButton = document.getElementById("saveAsTextWithHtml");

                saveAsTextButton.addEventListener("click", () => {
                    const cleanedText = formatTextWithoutHtml(documentContent);
                    const cleanedTextBlob = new Blob([cleanedText], { type: "text/plain" });
                    downloadTextBlob(cleanedTextBlob, `${articleName}.txt`);
                });

                saveAsTextWithHtmlButton.addEventListener("click", () => {
                    const cleanedTextWithHtml = formatTextWithHtml(documentContent);
                    const cleanedTextWithHtmlBlob = new Blob([cleanedTextWithHtml], { type: "text/plain" });
                    downloadTextBlob(cleanedTextWithHtmlBlob, `${articleName}.txt`);
                });

                /**
                 * Helper Functions
                 */

                // function to remove elements from the captured content while saving
                function removeUnnecessaryElementsFromContent(selectorOrElement, container) {
                    if (typeof selectorOrElement === "string") {
                        container.querySelectorAll(selectorOrElement).forEach(elem => elem.remove());
                    } else if (selectorOrElement instanceof Element) {
                        selectorOrElement.remove();
                    } else {
                        console.error("Invalid argument: Must be a CSS selector string or a DOM element");
                    }
                }

                function downloadHtmlBlob(blob, name = "file.html") {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.style.display = "none";
                    link.href = blobUrl;
                    link.download = name;
                    document.body.appendChild(link);
                    link.click();
                    window.URL.revokeObjectURL(blobUrl);
                }

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

                function formatTextWithoutHtml(input) {
                    let originalText = input.replace(/<\/?[^>]+(>|$)/g, " ");
                    return originalText.replace(/^\h\s*[\r\n]/gm, " ");
                }

                function formatTextWithHtml(input) {
                    let cleanedText = input;
                    let divWrapper = document.createElement("div");
                    divWrapper.innerHTML = cleanedText.replace(/(<([^>]+)>)/ig, "");;
                    return cleanedText;
                }

                /**
                 * Styling functions
                 */

                function initialButtonStage() {
                    spinner.classList.remove("d-none");
                    buttonText.classList.add("d-none");
                }

                function spinnerStage() {
                    spinner.classList.add("d-none");
                    buttonText.classList.remove("d-none");
                }

                function stylingArticle(elem) {
                    elem.setAttribute("style", "width: 98%;");
                }

                function revertArticle(elem) {
                    elem.removeAttribute("style", "width: 98%;");
                    elem.setAttribute("class", "col-12 col-sm-12 col-md-8 rounded");
                }
            }
        });
    }
});
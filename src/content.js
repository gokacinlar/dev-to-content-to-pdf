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

                saveAsPdfButton.addEventListener("click", generateArticlePDF);

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
                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                                enableLinks: true
                            };
                            // save with new promise based api
                            html2pdf().set(opt).from(articleSource).save().then();
                        } else {
                            return alert("Article source could not be found!");
                        }
                        // revert back to old button styling
                        spinner.classList.add("d-none");
                        buttonText.classList.remove("d-none");
                    }, 250);
                }

                /**
                 * Save the content as HTML
                 */

                const saveAsHtmlButton = document.getElementById("saveAsHtml");
                saveAsHtmlButton.addEventListener("click", () => {
                    downloadHtmlBlob(htmlBlob, `${articleName}.html`);
                });

                // define the content
                const documentContent = data.capturedContent;

                // define the function to save HTML DOM as plain text via blob
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

                const htmlBlob = new Blob([documentContent], { type: "text/html" }); // specify the mime type
                /**
                 * Save the content as plain Text
                 */

                // function to format the output of the content on TXT file
                function formatTextWithoutHtml(input) {
                    let originalText = input.replace(/<\/?[^>]+(>|$)/g, " ");
                    let cleanedText = originalText.replace(/^\s*[\r\n]/gm, " ");
                    let divWrapper = document.createElement("div");
                    divWrapper.innerHTML = cleanedText;
                    return cleanedText;
                }

                // function to format the output of the content on TXT file
                // including HTML tags
                function formatTextWithHtml(input) {
                    let cleanedText = input;
                    let divWrapper = document.createElement("div");
                    divWrapper.innerHTML = cleanedText.replace(/(<([^>]+)>)/ig, "");;
                    return cleanedText;
                }

                const saveAsTextButton = document.getElementById("saveAsText");
                const saveAsTextWithHtmlButton = document.getElementById("saveAsTextWithHtml");

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
                    const cleanedText = formatTextWithoutHtml(text);
                    const cleanedTextBlob = new Blob([cleanedText], { type: "text/plain" });

                    saveAsTextButton.addEventListener("click", () => {
                        downloadTextBlob(cleanedTextBlob, `${articleName}.txt`);
                    });
                }

                reader.readAsText(new Blob([documentContent], { type: "text/plain" }));

                const readerForHtmlText = new FileReader();
                readerForHtmlText.onload = function () {
                    const text = readerForHtmlText.result;
                    const cleanedTextWithHtml = formatTextWithHtml(text);
                    const cleanedTextWithHtmlBlob = new Blob([cleanedTextWithHtml], { type: "text/plain" });

                    saveAsTextWithHtmlButton.addEventListener("click", () => {
                        downloadTextBlob(cleanedTextWithHtmlBlob, `${articleName}.txt`)
                    })
                }

                readerForHtmlText.readAsText(new Blob([documentContent], { type: "text/plain" }));
            }
        });
    }
});
document.getElementById("saveSettings").addEventListener("click", () => {
    let url = document.getElementById("urlInput").value;
    let numberOfTweets = document.getElementById("numberOfTweets").value;
    let llmApiKey = document.getElementById("llmApiKey").value || "LOCAL-API";

    if (url && numberOfTweets) {
        chrome.storage.local.set(
            {
                tweetPostUrl: url,
                numberOfTweets: parseInt(numberOfTweets, 200),
                llmApiKey: llmApiKey,
            },
            () => {
                document.getElementById("status").textContent =
                    "Settings saved successfully!";
            }
        );
    } else {
        document.getElementById("status").textContent =
            "Please enter valid settings.";
    }
});

document.getElementById("start").addEventListener("click", function () {
    const waitingForRecomendations = "Waiting for Recomendations...";
    // Clear the ollama response in storage
    chrome.storage.local.set({
        ollamaResponse: waitingForRecomendations,
    });
    document.getElementById("serverResponse").innerHTML =
        waitingForRecomendations;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startScrolling" });
    });
});

document.getElementById("stop").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "stopScrolling" });
    });
});

// Load the saved settings and Ollama response when the popup opens
setInterval(() => {
    chrome.storage.local.get(
        ["tweetPostUrl", "scrollAmount", "ollamaResponse"],
        (result) => {
            if (result.ollamaResponse) {
                const htmlContent = marked.parse(result.ollamaResponse);
                if (result.ollamaResponse) {
                    const htmlContent = marked.parse(result.ollamaResponse);
                    document.getElementById("serverResponse").innerHTML = htmlContent;
                }
            }
        }
    );
}, 5000); // Check for changes every 5 second

chrome.storage.local.get(
    ["tweetPostUrl", "scrollAmount", "ollamaResponse"],
    (result) => {
        if (result.tweetPostUrl) {
            document.getElementById("urlInput").value = result.tweetPostUrl;
        }
        if (result.scrollAmount) {
            document.getElementById("scrollAmount").value = result.scrollAmount;
        }
    }
);

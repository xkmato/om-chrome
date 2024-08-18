document.getElementById('saveSettings').addEventListener('click', () => {
    let url = document.getElementById('urlInput').value;
    let scrollAmount = document.getElementById('scrollAmount').value;

    if (url && scrollAmount) {
        chrome.storage.local.set({
            tweetPostUrl: url,
            scrollAmount: parseInt(scrollAmount, 10)
        }, () => {
            document.getElementById('status').textContent = 'Settings saved successfully!';
        });
    } else {
        document.getElementById('status').textContent = 'Please enter valid settings.';
    }
});

document.getElementById('start').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startScrolling" });
    });
});


// Load the saved settings and Ollama response when the popup opens
chrome.storage.local.get(['tweetPostUrl', 'scrollAmount', 'ollamaResponse'], (result) => {
    if (result.tweetPostUrl) {
        document.getElementById('urlInput').value = result.tweetPostUrl;
    }
    if (result.scrollAmount) {
        document.getElementById('scrollAmount').value = result.scrollAmount;
    }
    if (result.ollamaResponse) {
        document.getElementById('serverResponse').value = result.ollamaResponse;
    }
});

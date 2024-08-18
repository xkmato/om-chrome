
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "startScrolling") {
        startTweetCollection();
        sendResponse({ status: "Scrolling started" });
    }
});

// Function to start the tweet collection process
function startTweetCollection() {
    chrome.storage.local.get('scrollAmount', (result) => {
        let scrollAmount = result.scrollAmount || 100;  // Default to 5000 if not set
        loop(scrollAmount);
    });

    chrome.storage.local.get('tweets', (result) => {
        let allTweets = result.tweets || {};
        allTweets = { ...allTweets, ...dict };

        chrome.storage.local.get('tweetPostUrl', (result) => {
            if (result.tweetPostUrl) {
                postTweetsToOllama(allTweets, result.tweetPostUrl);
            }
        });
    });
}

// Function to detect if the user is on Twitter and show an alert
// function checkTwitterAndPrompt() {
//     if (window.location.host.includes("x.com")) {
//         let userConfirmed = confirm("Do you want to start collecting tweets?");
//         if (userConfirmed) {
//             startTweetCollection();
//         } else {
//             console.log("Tweet collection canceled by the user.");
//         }
//     }
// }

// Start monitoring for Twitter page load
// window.addEventListener('load', checkTwitterAndPrompt);

let i = 1;
let dict = {};
let like_regex = /\b(\d+) Like|Likes\b/;
let retweet_regex = /\b(\d+) Retweet|Retweets\b/;
let reply_regex = /\b(\d+) Repl(ies|y)\. Reply\b/;
let time_regex =  /\btime datetime=\"(.*?)\">\b/;
let status_regex = /\b\/status\/(\d+)\b/;

function postTweetsToOllama(tweets, url) {
    let systemPrompt = `
You are a highly knowledgeable AI assistant specializing in literature analysis and cognitive diversity. Your task is to analyze a set of tweets and recommend books that will challenge and expand the author's worldview.

Your primary goals are to:
1. Identify the author's current perspectives, biases, and areas of interest from their tweets.
2. Recommend books that present contrasting viewpoints or introduce entirely new concepts.
3. Ensure recommendations come from diverse cultural, philosophical, and ideological backgrounds.
4. Explain how each recommended book could broaden the author's understanding of the world.

Remember:
- Focus on intellectual growth, not reinforcing existing beliefs.
- Prioritize books that offer unique or unconventional perspectives.
- Consider works from various time periods, cultures, and disciplines.
- Aim for a balance between accessibility and intellectual challenge.

Your recommendations should be thought-provoking and have the potential to significantly alter the author's worldview. Provide a brief, compelling explanation for each recommendation.
`;

    let userPrompt = `
Analyze the following list of tweets:

${tweets.join("\n\n")}

Based on these tweets, recommend 3-5 books that will challenge the author's current worldview and expose them to radically different perspectives. The recommended books should:

1. Present ideas that contrast with or contradict the views expressed in the tweets
2. Introduce novel concepts or ways of thinking not evident in the tweet content
3. Originate from diverse cultural, philosophical, or ideological backgrounds
4. Have the potential to significantly alter the author's understanding of the world

For each book recommendation, briefly explain why it was chosen and how it could expand the author's perspective.
`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            system: systemPrompt,
            user: userPrompt,
            model: "llama3.1",
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from Ollama:', data);
        chrome.storage.local.set({ ollamaResponse: data.response });
    })
    .catch((error) => {
        console.error('Error:', error);
        chrome.storage.local.set({ ollamaResponse: 'Error: ' + error.message });
    });
}

function loop(scrollAmount) {      
    setTimeout(function() {
        window.scrollBy(0, scrollAmount);

        let element = document.getElementsByClassName("css-1dbjc4n r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu");
        let tweets = [];
        
        for (let index = 0; index < element.length; index++) {
            try {
                let reply = element[index].innerHTML.match(reply_regex);
                let like = element[index].innerHTML.match(like_regex);
                let retweet = element[index].innerHTML.match(retweet_regex);
                let time = element[index].innerHTML.match(time_regex);
                let status = element[index].innerHTML.match(status_regex);

                let key = element[index].innerText.split("\n")[1].concat("-" + time[1]);
                dict[key] = {
                    "like": `${like ? like[1] : 0}`,
                    "reply": `${reply ? reply[1] : 0}`,
                    "retweet": `${retweet ? retweet[1] : 0}`,
                    "time": `${time[1]}`,
                    "text": `${element[index].innerText}`,
                    "status": `${status ? status[1] : ''}`
                };

                tweets.push(element[index].innerText);
            } catch (error) {
                console.log(error);
            }
        }

        chrome.storage.local.get('tweets', (result) => {
            let allTweets = result.tweets || {};
            allTweets = { ...allTweets, ...dict };
            chrome.storage.local.set({ tweets: allTweets });
        });

        i++;                
        if (i < 100000) {
            loop(scrollAmount);            
        }                      
    }, 500);
}

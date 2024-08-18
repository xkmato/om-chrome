let isScrolling = false;
let collectedTweets = [];
let tweetLenghth = 100;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  chrome.storage.local.get("numberOfTweets", (result) => {
    tweetLenghth = result.numberOfTweets || 200;
  });
  if (request.action === "startScrolling") {
    isScrolling = true;
    startTweetCollection();
    sendResponse({ status: "Scrolling started" });
  } else if (request.action === "stopScrolling") {
    isScrolling = false;
    chrome.storage.local.get("tweetPostUrl", (result) => {
      postTweetsToOllama(
        collectedTweets,
        result.tweetPostUrl || "http://localhost:1234/v1/chat/completions"
      );
      sendResponse({ status: "Scrolling stopped" });
    });
  }
});

// Function to start the tweet collection process
function startTweetCollection() {
  chrome.storage.local.get("scrollAmount", (result) => {
    let scrollAmount = result.scrollAmount || 100; // Default to 5000 if not set
    loop(scrollAmount);
  });
}

let i = 1;
let dict = {};
let like_regex = /\b(\d+) Like|Likes\b/;
let retweet_regex = /\b(\d+) Retweet|Retweets\b/;
let reply_regex = /\b(\d+) Repl(ies|y)\. Reply\b/;
let time_regex = /\btime datetime=\"(.*?)\">\b/;
let status_regex = /\b\/status\/(\d+)\b/;

function postTweetsToOllama(tweets, url) {
  console.log("Posting tweets to Ollama:", tweets);
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

The responses should all be in properly formated markdown.
`;

  let userPrompt = `
Analyze the following list of tweets:

${tweets.join("\n")}

Based on these tweets, recommend 3-5 books that will challenge the author's current worldview and expose them to radically different perspectives. The recommended books should:

1. Present ideas that contrast with or contradict the views expressed in the tweets
2. Introduce novel concepts or ways of thinking not evident in the tweet content
3. Originate from diverse cultural, philosophical, or ideological backgrounds
4. Have the potential to significantly alter the author's understanding of the world

For each book recommendation, briefly explain why it was chosen and how it could expand the author's perspective.

The response should all be in properly formated markdown.
`;

  collectedTweets = [];
  // Show loading message to the user
  console.log("Waiting for response from Ollama...");

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: false,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      chrome.storage.local.set({
        ollamaResponse: data.choices[0].message.content,
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      chrome.storage.local.set({ ollamaResponse: "Error: " + error.message });
    });
}
const tweetLimit = 200;
function loop(scrollAmount) {
  if (!isScrolling) return;
  if (collectedTweets.length >= tweetLimit) {
    postTweetsToOllama(
      collectedTweets,
      "http://localhost:1234/v1/chat/completions"
    );
    return;
  }

  setTimeout(function () {
    window.scrollBy(0, scrollAmount);

    let elements = document.getElementsByTagName("span");
    for (let index = 0; index < elements.length; index++) {
      try {
        let tweetText = elements[index].innerText
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " ");
        if (!collectedTweets.includes(tweetText)) {
          collectedTweets.push(tweetText);
          console.log(tweetText);
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (isScrolling) {
      loop(scrollAmount);
    }
  }, 500);
}

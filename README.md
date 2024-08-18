# Chrome Extension with Local LLM Support

Welcome to the Chrome Extension with Local LLM Support! This extension is designed allow you use an LLM to analyse your tweets in order to become more aware of your intellectual biases. By default, the app supports **LM Studio**, with ongoing work to support **OpenAI API** and **Ollama**.

## Features
- **Local LLM Integration**: Uses LM Studio by default to analyze and process data.
- **Customizable Scroll Amount**: Adjust the scroll amount within the extension UI.
- **User-Controlled Activation**: Trigger the extension manually when visiting Twitter.
- **Tweet Collection and Posting**: Collect tweets and send them to a specified LLM URL.
- **Stop Scrolling Functionality**: Allows users to stop scrolling and send collected tweets at once.

## Prerequisites
- **LM Studio**: Set up LM Studio as your local LLM environment.
- **Chrome Browser**: The extension is designed for Google Chrome or other Chrome based browsers.

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/xkmato/om-chrome.git
cd om-chrome
```


### 2. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right corner).
3. Click on **Load unpacked** and select the directory where you cloned this repo.
4. Here is more documentation on using chrome extensions

### 3. Configure Local LLM (LM Studio)
- **LM Studio**: By default, the extension is configured to work with LM Studio. To install LM Studio, follow these steps:
    1. Download LM Studio from [LM Studio's official website](https://lmstudio.com).
    2. Follow the installation instructions provided on their website.
    3. Ensure LM Studio is running and accessible before using the extension.


Stay tuned for updates on how to use Ollama or OpenAI API with this extension.

## Usage
1. **Start LM Studio**: Ensure that LM Studio is running locally.
2. **Trigger the Extension**: Visit Twitter and manually activate the extension as per your needs.
3. **Adjust Settings**: Use the extension's UI to customize number of tweets to analyze or set the localhost URL for tweet collection.
4. **Stop Scrolling**: You can optionally stop scrolling if the extension is taking longer to read the number of tweets you set.

## Contribution
Feel free to contribute to the ongoing development, especially if you have experience with Ollama or OpenAI API. Fork the repo, create a new branch, and submit a pull request with your changes.

## License
This project is licensed under the MIT License.

## Contact
For issues or suggestions, please open an issue on the GitHub repository.

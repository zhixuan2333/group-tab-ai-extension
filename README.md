# Group Tab AI extension

<img src="./assets/icon.png" width="32">

Group Tab AI is a browser extension that uses advanced AI technology powered by ChatGPT to group your browser tabs into logical categories. With Group Tab AI, you can easily organize your tabs based on topics, projects, or any other criteria you choose, making it easier to find the information you need and stay focused on your tasks.

## Installation

To install Group Tab AI, follow these steps:

1. Download the [latest release](https://github.com/zhixuan2333/group-tab-ai-extension/releases/latest).
2. Unzip the downloaded file to a folder on your computer.
3. Open your web browser and navigate to the extensions page.
4. Enable developer mode by toggling the switch in the top right corner of the page.
5. Click the "Load unpacked" button and select the folder where you unzipped the extension files.

## Development

To develop Group Tab AI, you'll need to have `Node.js` and `PNPM` installed on your computer. Follow these steps to get started:

```bash
git clone https://github.com/zhixuan2333/group-tab-ai-extension.git
cd group-tab-ai-extension
pnpm install

# To start development server
pnpm dev
# For edge
pnpm dev:edge

# To build extension
pnpm build
# For edge
pnpm build:edge
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`. If you are developing for the edge browser, using manifest v2, use: `build/edge-mv2-dev`.

## Contributing

Contributions to Group Tab AI are always welcome!

## License

Group Tab AI is licensed under the [GPL-3.0 license](LICENSE).

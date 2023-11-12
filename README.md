# Fluentify

This project consists of a Chrome extension and a server, both containerized using Docker, and bundled using Webpack.

## Installation

To install the Chrome extension, follow these steps:

1. Clone the repository: `git clone https://github.com/AdamSchmidty/Fluentify.git`
2. Install the dependencies: `npm install`
3. Build the extension: `npm run build:extension`
4. Open Google Chrome and navigate to `chrome://extensions`
5. Enable Developer mode by toggling the switch in the top right corner
6. Click on "Load unpacked" and select the `dist` folder in the project directory

To run the server, follow these steps:

1. Build the server Docker image: `docker build -t server .`
2. Run the server container: `docker run -p 8080:8080 server`

## Usage

Once the Chrome extension is installed and the server is running, you can use the extension to interact with the server. The extension provides a user interface for sending requests to the server and displaying the responses.

## Contributing

Contributions are welcome! To contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b my-new-feature`
3. Make your changes and commit them: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Docker
* To start the docker compose: `docker-compose up`
* To rebuild docker compose `docker-compose up --build --force-recreate`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

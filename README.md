# LightningChart<sup>&#174;</sup> JS Performance tester

Open source React application for demonstrating the performance of [LightningChart<sup>&#174;</sup> JS](https://www.arction.com/lightningchart-js/) charting library. Measures chart loadup delay and average frames-per-second during various scenarious. Results can be exported in CSV format.

Visit https://www.arction.com/lightningchart-js-performance/ to see the application live.

## Installation and usage instructions

### Requirements

* Node.js 
* Optionally: Git

### How to run

1. Download or clone this repository. 
    * You can download a zip file from GitHub using this [link](https://github.com/Arction/lcjs-performance-tester/archive/master.zip) or clicking the "Clone or download" button and selecting "Download ZIP".
    * To clone this repository click the "Clone or download" button and copy the url given. Then run `git clone <url>` where `<url>` is the url you copied. You need to have git installed to use this method.
2. If you downloaded a zip file, extract it to a folder and open the folder you extracted the package into.
3. Open a command prompt or terminal inside the extracted or cloned folder.
4. Before a local server can be started, the dependencies need to be installed. To do that run `npm install` on the command prompt or terminal.
5. After the dependencies have been installed run `npm start`. This will start a development server locally that can be used to view the performance tester. Open browser to http://localhost:8080/dev/master to see the performance tester.

> NOTE: Port 8080 is required for the app to work correctly.

## Development instructions

The project is developed using TypeScript and React. The build system relies on Node.js. Dependencies are managed with *npm*, therefore, remember to run `npm install` before starting development.

The build system for the project uses Gulp and WebPack to transpile and bundle all needed files.

There are several *npm* scripts, which are used in development process.

| Name        | Command             | Description |
|-------------|---------------------|-------------|
| build       | npm run build       | Creates a distribution ready bundle to /dist folder. |
| build:watch | npm run build:watch | Starts watching for changes in all source files and runs the build system when any changes are detected. |
| lint        | npm run lint        | Runs static analyzer. |
| lint:watch  | npm run lint:watch  | Starts file watcher and runs lint command when changes are detected. |
| pack        | npm run pack        | Creates a standalone bundle than can be opened in browser. |
| start       | npm start           | Builds a development bundle and starts a development server. |
| test        | npm test            | Runs the test suite. |
| test:watch  | npm run test:watch  | Starts file watcher and runs test command when changes are detected. |

For normal development run `npm start` to start the development server. Open a browser to http://localhost:8080/dev/master. The script watches for changes in the source files and recompiles the bundle and reloads your browser.

## Editing tests and creating new ones

First see the [Development instructions](#development-instructions) for normal development instructions.

When editing tests one additional development script must be run. Open a new terminal and run:

```
npm run build:watch
```

The source code of performance tests is located at *content/src* as *.js*-files, which will be fused together to construct *TestItems*. With the *build* script running, editing any of these will apply a hot reload to your application.

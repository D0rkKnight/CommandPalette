# Palette

A command palette for your desktop.
<img width="960" alt="image" src="https://github.com/D0rkKnight/CommandPalette/assets/20606858/a579acc8-c74f-4bc4-b2ef-e1199868f20c">

## Controls
`Ctrl+Shift+Alt+P` opens and closes the Palette \
`Enter` executes the highlighted command \
`Tab` tabs through the available commads \

## Installation

Palette is currently available on Windows and Mac. Go ahead and download from the Releases section!

## Architecture

Palette contains an Electron client that serves the GUI, alongside a Python FastAPI server that provides and executes commands. The Electron renderer uses Next JS to build its UI.
<img width="580" alt="image" src="https://github.com/D0rkKnight/CommandPalette/assets/20606858/4b2c8094-6e35-4f01-a9dc-a956346aba99">

The Palette client can GET commands from the backend and tell the backend to execute a command with POST run-command. When the Palette client spawns, it will spin up the backend server. But in the case that the UI creates before the backend is alive, the client will repeatedly ping the backend's health endpoint, and retrieve the backend's provided commands when it comes to life. \

The Palette client's frontend is generated by Next JS and packaged into the Electron application.

## Contributing

First, pull the repo. \

### Backend setup
Create the python virtual environment (in /backend, most likely). Install pip requirements from /backend/requirements.txt \

Commands to do so: \
```
cd backend
python -m venv .venv

source .venv/bin/activate # mac/linux
source .venv/Scripts/activate # windows

pip install -r requirements.txt
```

You can now start the backend with the following command.
```
# In /
make backend
```
This will spawn the FastAPI server with reload enabled, meaning changes made to the source code will trigger hot reloads.

### Frontend setup
Electron uses Node JS so we will need at least Node 14. Perform the following commands to install the required node modules.
```
cd frontend
npm install
```

To start the frontend, run
```
# In /
make frontend
```
This will spawn the NextJS dev server and the Electron client. In a moment, you should see the Palette appear on screen.

## TODO

- Make it so you can spawn the Palette backend separately, and connect Palette clients to it
- Permit Palette clients to connect to multiple Palette backends

# trace - a traceroute visualizer

## NOTE: this project currently only works locally on Mac.

## Setup
### Autosudo for tcptraceroute
1. Install homebrew if you don't have it already
2. Run `brew install tcptraceroute`
3. Get the outputs from `which tcptraceroute` and `whoami`. I will refer to these as `<tcptraceroute-location>` and `<whoami-result>`.
4. Run `sudo visudo` (and type in your password)
5. Scroll all the way to the bottom of the file and press `i` to insert
6. Add the line `<whoami-result> ALL=(root) NOPASSWD: <tcptraceroute-location>` after the last line of the file
7. Press `esc` to exit insert mode, then type `:wq` and hit enter to save
8. Open a new terminal and run `sudo tcptraceroute google.com`. If it does not ask for a password, you're all set.

### Backend Setup
1. cd into the root directory
2. run `pip install requirements.txt` or `pipenv install -r requirements.txt` (if you hae pipenv)
3. create a `/backend/.env` file
4. get your peeringDB API key and add it to `/backend/.env` as `PEERING_DB_API_KEY=<your_api_key>`
5. run `fastapi dev main.py` to start the backend server

### Frontend setup
1. cd into `/frontend/frontend` and run `npm install`
2. create a `/frontend/frontend/.env` file
3. go to [this link](https://console.mapbox.com/account/access-tokens/) and get your mapbox API key
4. add `VITE_MAPBOX_API_KEY=<your-mapbox-api-key>` to `/frontend/frontend/.env`
5. from `/frontend/frontend` run `npm run dev` to start the frontend server.
6. open your browser and navigate to http://localhost:5173/



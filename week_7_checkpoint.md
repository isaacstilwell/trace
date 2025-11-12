# Week 5 checkpoint

My goals for week 5 were as follows

1. Backend should be capable of obtaining all necessary location information based on a traceroute call.

    - Should be able to identify the address of where each redirect was handled
    - Should be able to figure out who handled the connection (Comcast, for instance, is obvious on some of my traceroute outputs, but I want to hopefully ID the blank IP addresses as well)
    - Should figure out which undersea cable was used for oversea connections

2. Add statistics like "distance traveled", "longest time between connections", etc.

3. Frontend should be set up and capable of rendering locations. Does not need to look good, but need to be capable of iterating through the locations.

My status for each:

- 1a "[Backend] Should be able to identify the address of where each redirect was handled"
    - This was pretty much done last time. This time I added a bit of code to provide only the necessary frontend info instead of returning the entire IP location object, which just makes it a bit easier to parse and avoids sending useless info to the frontend.

- 1b "[Backend] Should be able to figure out who handled the connection"
    - This was also done last time. IP-API has an ISP field that I extract into each IP location instance. This week, I set it up so that it gets passed to the frontend with all of the other location data.

- 1c "[Backend] Should figure out which undersea cable was used for oversea connections"
    - This was the bulk of the backend work for this week, and actually ended up being pretty tricky. There's no API for this (unlike for the datacenters) and I don't think anybody has a 100% success rate on this task in particular because there are so many cables and many of them go to the same places. My algorithm is imperfect for cables with duplicates, since there really isn't a way of knowing which of the duplicate cables your packets traveled on. It works by extracting data from the submarinecablemap.com cable path json to find the endpoints of all of the paths, then referencing the set of endpoints for each cable against two connection endpoints. There's some more info on this in the comments in undersea_cables.py since there logic for extracting endpoints is a little complicated and convoluted due to the structure of that json. There are definitely some things I can do to optimize this workflow more since it feels a little like brute force right now. I will be doing those before the final deadline.

- 1d (extra): while I was working on the undersea stuff, I ran into some bugs with a few traceroutes that I need to try and fix. I added the buggy IPs I found to `problematic-ips.md` with the reason why they cause issues. Hopefully this will help me handle some edge cases in the coming weeks. I think that there will be a pretty decent number of IPs that don't play well with peeringDB, but it's still by far the biggest DB of network facilities. I'm going to check if I can find some alternatives to use as fallbacks for when peeringDB doesn't give me the results I want, but in the worst case, I can always use the lat/long provided by IP-API directly.

- 2a "Add `distance traveled` statistic"
    - There wasn't a ton to do here, but I created a simple distance calculator in `location_math.py`. I use this in the `get_locations` endpoint to set the inbound and outbound distance traveled for each IP location. These values are then returned in the final frontend objects.
- 2b "Add `longest time between connections` statistic"
    - In `traceroute.py`, I implemented this feature with the `_get_hang_times` method. I track the longest time between connections as well as the overall time of the connection (which is just the time attached to the final destination). Since these are directly associated with the execution of `traceroute` and have no relation to location processing, I felt that it was more logical to return these values in the `traceroute` endpoint than it would be to return them at the very end with all of the IP location data.

- 3 "Frontend should be set up and capable of rendering locations. Does not need to look good, but need to be capable of iterating through the locations."
    - I guess I technically didn't set a goal to be able to call the backend and render the output (as opposed to just rendering some hardcoded location data), but that's what I meant with this goal, so that's what I did. I set up some --very-- basic html in `index.html` where one can input an ip address. Then I set up a `main.ts` file to handle the API calls and a `map.ts` file to handle the various locations and other map-related functions. It definitely doesn't look great, but it can render everything that needs to be there. I think you should be able to run this on your computer by cd'ing into `backend` and running `fastapi dev main.py`, then cd'ing into `frontend/frontend` and running `npm run dev`.
thegrid2 (node rework)
=========
Thegrid is a multiplayer RTS game. Your goal is to defeat any other colonies on your grid by placing special tiles and collecting resources.

For updates on the development of the game follow [@thegridsays](http://twitter.com/thegridsays) on Twitter.

![Thegrid in action](http://i.imgur.com/lVJiw.png)

**Now with 100% more hexagons and node.js!**

## Features
It's kind of hard to sum up a game with a feature list, but I'll try anyways:

 * Realtime multiplayer gameplay
 * Customizable maps
 * Defeat others using infectors or destroyers
 * A developer who loves working on this, so feel free to suggest additions
 * Released under the [GNU GPL License](http://www.gnu.org/copyleft/gpl.html). Hooray open source!

## Running a server
Eventually I'll get a guide for getting a production server up, but for now here's how you can setup an easy development server:

Thegrid has a server and a client server (one to run the game, one to serve the client). These could probably be combined but I wanted to separate the two as much as I could to keep the codebase of the server on task.

So to get started, set up the server like so:

    git clone http://github.com/stevenleeg/thegrid2_server
    cd thegrid2_server
    npm install
    node server.js

And now you have a fully functional grid server!

Next up you're going to need the client. This is slightly more complex to get going, as it requires virtualenv and python, but still not anything difficult:

    git clone http://github.com/stevenleeg/thegrid2_client
    cd thegrid2_client
    virtualenv env
    source env/bin/activate
    pip install -r requirements.txt
    python run.py

## About the project
I've always been interested in new technologies and I originally created this project for a fun way to mess around with [tornado](http://tornadoweb.org) and websockets. After showing this to a few friends, all of them seemed to like the concepts of the game so I continued to develop it. I currently don't have the money to turn this into anything big, so I figured it'd be best to share my learning with the world and invite anyone who's interested to learn with me and help develop. This updated version is actually a rewrite of the entire server engine in node.js (which has been a lot of fun to work with). You'll notice that the codebase of this version is significantly cleaner than my original version. It's amazing how much your programming style can change over the course of a few months. 

If you know some Javascript, HTML, CSS, or have any sort of design expertise please feel free to join in by forking the repo. I'd love to have others work on this project with me. If not, you can help just as much by enjoying the game and spreading the word!

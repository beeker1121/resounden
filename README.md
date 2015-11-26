# Resounden

List and play the favorite tracks of any Soundcloud user.

Try it out by visiting [resounden.com](http://resounden.com) on desktop or mobile.

Coded in Golang and React, this project will hopefully help provide insight to other coders on how to create a web application using this language and framework.

## Installation

To build the Resounden binary, you must have Go installed on the machine.

Built with:

Go v1.5.1 linux/amd64  
React (with addons) v0.14.1  
Babel v6.2.0 (babel-core 6.2.1) (babel-preset-react 6.1.18)

1. `go version` to check your Go version.
2. Make sure your `GOPATH` environment variable is set.
3. `go get` to get the required Go packages.
4. `go build` to build the binary.
5. `sudo setcap "cap_net_bind_service=+ep" resounden`  
    Allows the binary to bind port 80 (and &lt;1024) as a non-root user.
6. Enter a valid Soundcloud App Client ID in `config.json` and save.
7. `./resounden` to start Resounden.

To compile the resounden.jsx React code into a regular JavaScript file, you must use Babel with the React preset:

1. `cd public/js` to browse to the JavaScript directory.
2. `npm install babel-preset-react` to install the React preset for Babel.
3. `babel --presets "react" -o resounden.js resounden.jsx`
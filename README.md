# Stremio to Infuse Redirect (iOS Safari Userscript)

A Userscript designed for Safari on iOS (with a Userscripts extension) to automatically open video stream links from Stremio Web (`web.strem.io`) directly in the Infuse app.

## Features
* Intercepts clicks on Stremio stream links.
* Decodes Stremio's player data to extract the direct video URL.
* Constructs an `infuse://x-callback-url/play?url=` link.
* Redirects to Infuse for playback.
* Specifically ignores links pointing to Debrid Media Manager (DMM) to allow normal browser navigation for those.

## Authors
* [Kyospia]
* Yumeko (Conceptual Assistance & Debugging) 

## Compatibility
* **Platform:** iOS / iPadOS
* **Browser:** Safari
* **Required Extension:** A Userscripts manager extension for Safari (e.g., "Userscripts" by quoid).
* **Target Site:** `web.strem.io`

## Installation
1.  Ensure you have a Userscripts manager extension installed and configured in Safari on your iOS device.
2.  Download the `StremioToInfuseIOS.user.js` file from this repository. Save the `StremioToInfuseIOS.user.js` file to the designated folder used by your Userscripts extension in the Files app on your iOS device.
3.  The Userscript manager should automatically detect and enable the script for `web.strem.io`.

## How It Works
The script attaches an event listener to Stremio Web. When a stream link is clicked:
1.  It checks if the link is a Debrid Media Manager link; if so, it allows default browser action.
2.  Otherwise, it prevents Stremio's default player.
3.  It extracts and decodes the Stremio player data from the link's `href` attribute.
4.  It constructs the appropriate `infuse://` URL.
5.  It redirects the browser to this Infuse URL, launching the Infuse app with the video.

## License
This project is licensed under the MIT License - see the (LICENSE) file for details.

## Reporting Issues
If you encounter any bugs or have suggestions, please open an issue in this GitHub repository.

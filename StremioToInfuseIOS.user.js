// ==UserScript==
// @name         Stremio to Infuse (iOS Safari by Yumeko)
// @namespace    yumeko.stremio.infuse.bridge 
// @version      1.0.1 
// @description  Opens Stremio Web video stream links in Infuse.app on iOS Safari, ignoring DMM links.
// @author       [Votre nom/pseudo GitHub ici] & Yumeko
// @match        *://web.strem.io/*
// @grant        none
// @license      MIT
// @downloadURL  [Collez ici l'URL Raw de votre script]
// @updateURL    [Collez ici la MÊME URL Raw de votre script] 
// ==/UserScript==

(function () {
    'use strict';

    const INFUSE_URL_SCHEME_PREFIX = "infuse://x-callback-url/play?url=";
    const STREAM_LINK_SELECTOR = "a.stream-container-JPdah"; // Based on your HTML examples

    function base64UrlDecodeToUtf8(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        try {
            const byteString = atob(base64);
            const bytes = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
                bytes[i] = byteString.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch (e) {
            console.error("Yumeko Script Error (base64UrlDecodeToUtf8):", e, "Input:", str.substring(0,100)+"...", "Error:", e);
            // No alert for this internal function, error handled by caller
            return null;
        }
    }

    function processStremioPlayerLinkForInfuse(stremioPlayerHref) {
        // This function assumes it's definitely a Stremio player link starting with #/player/
        console.log("Yumeko Script: Processing Stremio player link for Infuse:", stremioPlayerHref);
        let pathData = stremioPlayerHref.substring('#/player/'.length); 
        const segments = pathData.split('/');

        if (segments.length > 0) {
            const videoInfoSegmentFromHref = segments[0]; 
            
            let actualBase64String;
            let decodedJsonString;
            let initialCleanedJson;
            let finalCleanedJson;

            try {
                actualBase64String = decodeURIComponent(videoInfoSegmentFromHref);
                decodedJsonString = base64UrlDecodeToUtf8(actualBase64String); 
                
                if (!decodedJsonString) { 
                    console.error("Yumeko Script Error: Base64 decoding function returned null for input:", actualBase64String.substring(0,100)+"...");
                    return; 
                }
                
                const jsonStartMarker = '{"url":';
                let jsonStartIndex = decodedJsonString.indexOf(jsonStartMarker);
                if (jsonStartIndex === -1) { jsonStartIndex = decodedJsonString.indexOf('{'); }

                if (jsonStartIndex !== -1) {
                    initialCleanedJson = decodedJsonString.substring(jsonStartIndex);
                } else {
                    console.error('Yumeko Script Error: Could not find start of JSON object in decoded string:', decodedJsonString.substring(0,100)+"...");
                    return;
                }
                
                const lastBraceIndex = initialCleanedJson.lastIndexOf('}');
                if (lastBraceIndex !== -1) {
                    finalCleanedJson = initialCleanedJson.substring(0, lastBraceIndex + 1);
                } else {
                    console.error("Yumeko Script Error: No closing '}' found in JSON data after initial clean!", initialCleanedJson.substring(0,100)+"...");
                    return;
                }
                                    
                const streamInfo = JSON.parse(finalCleanedJson); 
                
                if (streamInfo && streamInfo.url) {
                    const videoUrl = streamInfo.url;
                    const encodedVideoUrl = encodeURIComponent(videoUrl);
                    const infuseLink = INFUSE_URL_SCHEME_PREFIX + encodedVideoUrl;
                    
                    console.log("Yumeko Script: SUCCESS! Redirecting to Infuse with URL (début): " + infuseLink.substring(0,150) + "..."); 
                    window.location.href = infuseLink; 
                } else {
                    console.error('Yumeko Script Error: "url" field not found in parsed JSON.', streamInfo);
                }
            } catch (e) {
                console.error('Yumeko Script Error: Processing video info failed.', "Error:", e.message);
                if (typeof finalCleanedJson !== 'undefined' && finalCleanedJson) { console.error('Final JSON data (début):', finalCleanedJson.substring(0,100)+"..."); }
                else if (typeof initialCleanedJson !== 'undefined' && initialCleanedJson) { console.error('Initial cleaned data (début):', initialCleanedJson.substring(0,100)+"..."); }
                else if (typeof decodedJsonString !== 'undefined' && decodedJsonString) { console.error('Raw decoded data (début):', decodedJsonString.substring(0,100)+"..."); }
            }
        } else { 
            console.error('Yumeko Script Error: Could not extract video info segment from pathData (processStremioPlayerLinkForInfuse):', pathData);
        }
    }
    
    console.log("Yumeko Script (v1.0.1): Initializing Stremio to Infuse bridge with DMM exclusion...");
    document.body.addEventListener('click', function(event) {
        // Find the closest <a> tag with the specified class that was clicked on or contains the click target
        const clickedLinkElement = event.target.closest(STREAM_LINK_SELECTOR);

        if (clickedLinkElement) {
            const href = clickedLinkElement.getAttribute('href');
            console.log("Yumeko Script: Intercepted click. Link Href:", href ? href.substring(0,100)+"..." : "N/A");

            if (href && (href.startsWith('https://debridmediamanager.com') || href.startsWith('https://x.debridmediamanager.com'))) {
                // It's a DMM link. Allow default browser action.
                console.log("Yumeko Script: DMM link detected. Allowing default browser action.");
                // DO NOT call event.preventDefault() or event.stopPropagation()
                // The browser will handle opening this link (likely in a new tab due to target="_blank")
                return; 
            } else if (href && href.startsWith('#/player/')) {
                // It's a Stremio player link. Prevent default and process for Infuse.
                console.log("Yumeko Script: Stremio player link detected. Preventing default and processing for Infuse.");
                event.preventDefault();
                event.stopPropagation();
                processStremioPlayerLinkForInfuse(href); 
            } else {
                // It's some other link that matched STREAM_LINK_SELECTOR but isn't DMM or Stremio player,
                // or href is null/empty. To be safe, allow default action.
                console.warn("Yumeko Script: Link matched selector but is not recognized as DMM or Stremio player. Allowing default. Href:", href ? href.substring(0,100)+"..." : "N/A");
            }
        }
    }, true); // Use capture phase
    console.log("Yumeko Script (v1.0.1): Stremio to Infuse bridge is ACTIVE.");

})();

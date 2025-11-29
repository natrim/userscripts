// ==UserScript==
// @name         Auto PIP on videos
// @version      2025-11-29
// @description  pips on tab switch - chromium only, ff has own pip implementation, you need to enable and disable auto pip permission in urlbar for the auto thingie to work - google limitations on user interactions...
// @author       Natrim
// @match        http://*/*
// @match        https://*/*
// @exclude      about:blank
// @exclude      chrome://*/*
// @exclude      vivaldi://*/*
// @exclude      helium://*/*
// @exclude      brave://*/*
// @exclude      edge://*/*
// @exclude      opera://*/*
// @downloadURL  https://github.com/natrim/userscripts/raw/main/auto_pip.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/auto_pip.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==


(function() {
    'use strict';

    if (window.pipBoosted) return;
    window.pipBoosted = true;

    // doesnt work on ff so bail
    if (typeof document.createElement("video").requestPictureInPicture !== "function") {
        return;
    }

    //TODO: add autopip toggle like the one in for youtube for other videos
    let isAPipAllowedOnPage = true;
    try {
        if (window.location.href.indexOf("youtube") !== -1) {
            const checkPIPButton = () => {
                if (document.getElementById("autoPipButtonToggle")) {
                    return;
                }
                const parent = document.querySelector(".ytp-right-controls");
                if (!parent) {
                    return;
                }
                try {
                    const btn = document.createElement("button");
                    btn.className = "ytp-button";
                    btn.id = "autoPipButtonToggle";
                    btn.title = "Toggle Auto PIP ON / OFF";
                    //btn.appendChild(text);
                    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
                    svg.setAttribute("viewBox", "0 0 36 36");
                    //svg.setAttribute("fill", "none");
                    svg.setAttribute("fill", isAPipAllowedOnPage ? "green" : "red");
                    svg.setAttribute("width", "100%");
                    svg.setAttribute("height", "100%");
                    svg.setAttribute("style", "padding:0");

                    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                    newElement.setAttribute("d", "M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z");
                    svg.appendChild(newElement);

                    newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                    newElement.setAttribute("d", "M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z");
                    newElement.setAttribute("fill", "#fff");
                    svg.appendChild(newElement);


                    btn.appendChild(svg);
                    btn.addEventListener("click", function () {
                        isAPipAllowedOnPage = !isAPipAllowedOnPage;
                        svg.setAttribute("fill", isAPipAllowedOnPage ? "green" : "red");
                    });
                    parent.appendChild(btn);
                } catch(e) {
                    console.error(e);
                }
            };
            setInterval(checkPIPButton, 1000);
        }
        const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
        navigator.mediaSession.setActionHandler("enterpictureinpicture", () => {
            if (!isAPipAllowedOnPage) return;
            const BreakException = {};
            try{
                document.querySelectorAll("video")?.forEach((video) => {
                    if (!!video.currentSrc && isVideoPlaying(video) && video.requestPictureInPicture) {
                        video.requestPictureInPicture();
                        throw BreakException;
                    }
                });
            } catch (e) {
                if (e !== BreakException) throw e;
            }
        });
    } catch (error) {
        console.log("The enterpictureinpicture action is not yet supported.");
    }
})();

// ==UserScript==
// @name         Twitch Boost
// @version      2025-11-11
// @description  some stuff for Twitch i use (pip button, auto-pip, diable av1, dark pwa title)
// @author       Natrim
// @match        *://www.twitch.tv/*
// @match        *://player.twitch.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @downloadURL  https://github.com/natrim/userscripts/raw/main/twitch_boost.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/twitch_boost.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

// pip button in player
(function() {
    'use strict';

    if (navigator.userAgent.includes("Firefox")) {
        return;
    }

    let pipButtonTries = 0;
    let playerReady = setInterval(function () {
        pipButtonTries++;
        if (pipButtonTries > 30) {
            clearInterval(playerReady);
            playerReady = undefined;
            return;
        }
        if (
            document.getElementsByClassName("player-controls__right-control-group")[1]
        ) {
            clearInterval(playerReady);
            playerReady = undefined;
            var btn = document.createElement("button");
            btn.innerHTML =
                '<div aria-describedby="241f74d967eb4cf412d5ddd29ff2a456" class="Layout-sc-nxg1ff-0 ScAttachedTooltipWrapper-sc-v8mg6d-0 hOVSHb"><div class="ScAttachedTooltip-sc-v8mg6d-1 kqEiJv tw-tooltip" data-a-target="tw-tooltip-label" role="tooltip" id="241f74d967eb4cf412d5ddd29ff2a456" direction="top">📺PIP</div></div>';
            var btn2 = document.createElement("button");
            btn2.innerHTML = btn.innerHTML;
            document
                .getElementsByClassName("player-controls__right-control-group")[0]
                .insertBefore(
                btn2,
                document.getElementsByClassName(
                    "player-controls__right-control-group"
                )[0].lastElementChild
            );
            document
                .getElementsByClassName("player-controls__right-control-group")[1]
                .insertBefore(
                btn,
                document.getElementsByClassName(
                    "player-controls__right-control-group"
                )[1].lastElementChild
            );
            btn2.addEventListener("click", function () {
                document.querySelector(".video-ref video")?.requestPictureInPicture();
            });
        }
    }, 1000);
})();

// PWA title theme
(function() {
    'use strict';
    var theme = document.querySelector("[name=theme-color]")
    if (theme) {
        theme.content = "#9147FF";
        // theme.media= "(prefers-color-scheme: dark)";
    } else {
        var meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = "#9147FF";
        // meta.media= "(prefers-color-scheme: dark)";
        document.getElementsByTagName("head")[0].prepend(meta);
    }
})();

// Disable av1
(function disableAV1() {
    // return a custom MIME type checker that can defer to the original function
    function makeModifiedTypeChecker(origChecker) {
        // Check if a video type is allowed
        return function (type) {
            if (type === undefined || type.indexOf('av01') !== -1) return '';
            // Otherwise, ask the browser
            return origChecker(type);
        };
    }

    function overrideCanPlayType() {
        // Override video element canPlayType() function
        var videoElem = document.createElement('video');
        var origCanPlayType = videoElem.canPlayType.bind(videoElem);
        videoElem.__proto__.canPlayType = makeModifiedTypeChecker(origCanPlayType);
    }

    function overrideIsTypeSuppoerted() {
        // Override media source extension isTypeSupported() function
        var mse = window.MediaSource;
        // Check for MSE support before use
        if (mse === undefined) return;
        var origIsTypeSupported = mse.isTypeSupported.bind(mse);
        mse.isTypeSupported = makeModifiedTypeChecker(origIsTypeSupported);
    }

    overrideCanPlayType();
    overrideIsTypeSuppoerted();
})();

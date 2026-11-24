// ==UserScript==
// @name         Enable Swipe Navigation
// @version      2026-11-20
// @description  Restore native touchpad back/forward swipe navigation.
// @match        http://*/*
// @match        https://*/*
// @downloadURL  https://github.com/natrim/userscripts/raw/main/enable_swipe_back.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/enable_swipe_back.user.js
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const css = `
        *, *::before, *::after {
            overscroll-behavior-x: auto !important;
        }
    `;

    if (typeof GM_addStyle != "undefined") {
        GM_addStyle(css);
    } else if (typeof PRO_addStyle != "undefined") {
        PRO_addStyle(css);
    } else if (typeof addStyle != "undefined") {
        addStyle(css);
    } else {
        var node = document.createElement("style");
        node.type = "text/css";
        node.appendChild(document.createTextNode(css));
        var heads = document.getElementsByTagName("head");
        if (heads.length > 0) {
            heads[0].appendChild(node);
        } else {
            // no head yet, stick it whereever
            document.documentElement.appendChild(node);
        }
    }
})();

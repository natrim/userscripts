// ==UserScript==
// @name         GMAIL Boost
// @version      2025-09-17
// @description  some GMAIL stuff i need (auto pop3 refresh on page load, unread mail badge icon support, dark header for pwa, css ui enhancements)
// @author       Natrim
// @match        https://mail.google.com/*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com&size=64
// @downloadURL  https://github.com/natrim/userscripts/raw/main/gmail_boost.user.js
// @updateURL    https://github.com/natrim/userscripts/raw/main/gmail_boost.user.js
// @grant        GM_addStyle
// ==/UserScript==

function reloadGMAILPOP3() {
    const gmail_acc_number = 0;
    if (window.location.href.indexOf("https://mail.google.com/mail/u/" + gmail_acc_number + "/") === -1) {
        console.log("No allowed GMAIL account found");
        return;
    }
    const button_text = document.querySelector('html').lang === "cs" ? "Zkontrolovat poštu teď" : "Check mail now";
    let isRefreshAvailable = false;
    const hash = window.top.location.hash;
    switch (hash) {
        case "#mbox":
        case "#inbox":
        case "#all":
        case "#imp":
        case "#trash":
        case "#spam":
        case "#chats":
        case "#starred":
        case "#sent":
        case "#outbox":
        case "#snoozed":
        case "#scheduled":
        case "#drafts":
            isRefreshAvailable = true;
            break;
        default:
            if (top.location.hash.match(/#label/gi)) {
                isRefreshAvailable = true;
            } else if (top.location.hash.match(/#category/gi)) {
                isRefreshAvailable = true;
            }
    }

    if (!isRefreshAvailable) {
        console.log("No GMAIL list page, nor reload on details and other");
        return;
    }

    window.location.assign('https://mail.google.com/mail/u/' + gmail_acc_number + '/#settings/accounts');
    let loading = true;
    let limit = 500;
    let limiter = 0;
    const refreshAccounts = () => {
        const currentNode = document.querySelectorAll("span[role=link]");
        if (!Array.prototype.some.call(currentNode, ((a) => {
            return a.textContent.includes(button_text);
        }))) {
            if (limiter > limit) {
                console.log("No GMAIL pop3 import found");
                window.location.assign('https://mail.google.com/mail/u/' + gmail_acc_number + '/' + (isRefreshAvailable ? hash : '#inbox'));
                return;
            }
            limiter++;
            setTimeout(refreshAccounts, 100);
        } else {
            if (loading) {
                loading = false;
                setTimeout(refreshAccounts, 1000);
            } else {
                currentNode.forEach((a) => {
                    if (a.textContent.includes(button_text)) {
                        a.click();
                    }
                });
                window.location.assign('https://mail.google.com/mail/u/' + gmail_acc_number + '/' + (isRefreshAvailable ? hash : '#inbox'));
            }
        }
    };
    setTimeout(refreshAccounts, 100);
};


(function() {
    'use strict';

    setTimeout(reloadGMAILPOP3, 5000);
})();

(function() {
    'use strict';

    let unreadCount;
    const countReg = /<fullcount>([^<]+)/;

    function getUnreadCount(doc) {
        if (!doc) return -1;
        const match = doc.match(countReg);
        if (!match) return -1;
        const count = parseInt(match[1]);
        return isNaN(count) ? -1 : count;
    }

    // Fetch Gmail feed and parse unread count
    async function getAtomFeed(label) {
        const url = `https://mail.google.com/mail/feed/atom${label ? `/${label}` : ''}?_=${new Date().getTime()}`;
        return fetch(url, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } })
            .then(response => response.text())
            .catch(err => {
            console.error('Error fetching Atom feed:', err);
            return null;
        });
    }

    async function updateBadgeIcon() {
        const label = '';
        const feed = await getAtomFeed(label);
        const newUnreadCount = getUnreadCount(feed);
        if (newUnreadCount < 0) return;

        if (newUnreadCount !== unreadCount) {
            unreadCount = newUnreadCount;
            navigator.setAppBadge(unreadCount);
        }
    }

    setInterval(updateBadgeIcon, 30000);

    updateBadgeIcon();
})();

(function() {
    'use strict';
    const theme = document.querySelector("[name=theme-color]")
    if (theme) {
        theme.content = "#111";
        // theme.media= "(prefers-color-scheme: dark)";
    } else {
        const meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = "#111";
        // meta.media= "(prefers-color-scheme: dark)";
        document.getElementsByTagName("head")[0].prepend(meta);
    }
})();

const css = `
/*
  Gmail UI enhancement
  https://github.com/Xilantra/enhanced-gmail
  Last updated: Jan 27 2022
  Modified by Natrim for CZECH Gmail + extra css changes by 2023-02-22
*/
/* Search bar light mode */
/* form.aJf */
/* lg */
/* header.gb_Ca.gb_5a.gb_Ue.gb_Qc #aso_search_form_anchor, */
/* xl */
header.gb_Da.gb_6a.gb_Ue #aso_search_form_anchor
 {
    background-color: #ffffff !important;
}
/* Search bar dark mode */
/* lg */
header.gb_Da.gb_6a.gb_Ue.gb_6.gb_Vd #aso_search_form_anchor,
/* header.gb_ua.gb_6a.gb_Ve.gb_aa.gb_Ud #aso_search_form_anchor, */
/* xl */
header.gb_Da.gb_6a.gb_Ue.gb_6.gb_Sc #aso_search_form_anchor
/* header.gb_ua.gb_6a.gb_Ve.gb_aa.gb_Rc #aso_search_form_anchor  */
{
    background: #000 !important;
}
/* Search bar dark mode input text */
header[role="banner"] [placeholder="Search in mail"],
header[role="banner"] [placeholder="Hledat v poště"]
 {
  color: rgb(226, 226, 226) !important
}
/* Search bar: Dark mode */
header[role="banner"] [placeholder="Search in mail"],
header[role="banner"] [placeholder="Hledat v poště"],
/* Search bar: Light mode */
#gb [placeholder="Search mail"],
#gb [placeholder="Hledat poštu"]
 {
  text-align:center;
}
/* Search bar: Dark mode */
header[role="banner"] [placeholder="Search in mail"]:focus,
header[role="banner"] [placeholder="Hledat v poště"]:focus,
/* Search bar: Light mode */
#gb [placeholder="Search in mail"]:focus,
#gb [placeholder="Hledat v poště"]:focus,
/* Text suggestion input */
input#gs_taif50 {
  text-align: left !important;
}
/* Text suggestion input */
input#gs_taif50 {
  opacity: 0.4;
}
/* Search bar */
.nH .qp .aJf[method="get"][role="search"] {
  margin: 0 auto !important;
}
/* The setting icon on light mode */
header.gb_oa.gb_1a.gb_Qe.gb_Mc:not(header.gb_oa.gb_1a.gb_Qe.gb_4.gb_Mc) svg {
  color: #001d35 !important;
}
/* .gb_Od.gb_Zd */.gb_Re.gb_He [aria-label="Advanced search options"],
/* .gb_Od.gb_Zd */.gb_Re.gb_He [aria-label="Zobrazit všechna nastavení"],
.Yb.dIH7rb,
[data-tooltip="Settings"],
[data-tooltip="Nastavení"]
 {
  opacity: 0.6;
}
/* .gb_Od.gb_Zd */.gb_Re.gb_He [aria-label="Advanced search options"]:hover,
/* .gb_Od.gb_Zd */.gb_Re.gb_He [aria-label="Zobrazit všechna nastavení"]:hover
.Yb.dIH7rb:hover,
[data-tooltip="Settings"]:hover,
[data-tooltip="Nastavení"]:hover
 {
  opacity: 1;
}
/* Right side panel */
.brC-dA-I.aT5-aOt-I-Jp,
/* Left side bar button dark mode */
/* .WR.aeN, */
.aeN.WR.a6o.anZ.nH.oy8Mbf,
/* Active text */
.Yc,
/* google one ad */
.I6agWe,
/* Support */
.zo,
/* Google Apps icon */
[aria-label="Google apps"],
[aria-label="Aplikace Google"],
.gb_Vd.gb_Xa.gb_Kd.gb_Zd .gb_Sc {
  display: none !important;
}
/* Right side panel light mode */
/* .nH.aUx {
  width: 0 !important;
  min-width: 0 !important;
} */
/* Compose Button Design 1: Long button */
/* Comment this if you want to use Design 2 */
.z0>.L3 {
  width: 100%;
  margin-right: 12px !important;
}
/* Compose Button Design 2: Rounded */
/* Uncomment this if you want to use Design 2 */
/* .z0>.L3 {
  font-size: 0 !important;
  padding-right: 4px !important;
  border-radius: 50% !important;
} */
/* Compose Button default */
.z0>.L3 {
  transform: scale(1) translateY(0px);
}
/* Compose Button default */
.z0>.L3:hover {
  transform: scale(1.05);
}
/* Top nav items */
/* .gb_Od.gb_Zd */.gb_Re.gb_He {
  transform: translateY(8px);
}
/* header[role="banner"]:hover .gb_Sc  */
#gb:hover /* .gb_Od.gb_Zd */.gb_Re.gb_He {
  opacity: 1;
  visibility: visible;
  transform: translateY(0px);
}
/* The top right Setting & Status icons */
.gb_qe.gb_oe,
.gb_ve.gb_te {
    min-width: 118px;
    display: flex;
    justify-content: end;
    align-items: center;
}
/* Mail item list dark mode */
.ae4.aTP.aDM.nH.oy8Mbf .zA:hover,
/* Mail item list light mode */
.ae4.aDM.nH.oy8Mbf .zA:hover {
    box-shadow: none !important;
}
/* Mail item list dark mode */
.ae4.aTP.aDM.nH.oy8Mbf .zA.zE:hover {
    background-color: #111111;
}
/* Mail item list light mode */
.ae4.aDM.nH.oy8Mbf:not(.Nu.tf.aZ6 .ae4.aDM.nH.oy8Mbf) .zA:hover {
    background-color: #e4e4e4;
}
/* Mail item read (Everything Else) list dark mode */
.Nu.tf.aZ6 .ae4.aDM.nH.oy8Mbf .zA.yO:hover {
  background-color: #2c2c2c;
}
/* Main frame */
/* .bkK {
  margin-right: 16px !important;
} */
/* Light mode main frame: opened */
.bhZ+.bkK {
    margin-left: 16px !important;
}
/* Top nav items */
/* .gb_Od.gb_Zd */.gb_Re.gb_He,
/* Google Apps */
/* .gb_Sc  */
/* Light mode left sidebar */
.aeN.WR.nH.oy8Mbf.bhZ {
  visibility: hidden;
  opacity: 0;
}
/* Top bar icons */
.nH.aUx,
.gb_Ud.gb_Ne .gb_Se button,
.Yb.dIH7rb,
[aria-label="Advanced search options"],
[data-tooltip="Settings"],
[aria-label="Zobrazit všechna nastavení"],
[data-tooltip="Nastavení"],
/* Compose Button default */
.z0>.L3,
/* Top nav items */
/* .gb_Od.gb_Zd */.gb_Re.gb_He,
/* Google Apps */
.gb_Sc,
/* Light mode main frame */
.bhZ+.bkK,
.bkK,
/* Mail item list */
.zA {
  transition: all .24s ease-in-out;
}
/* Custom logo */
/*header a[aria-label="Gmail"] img {
  content: url(data:image/png;base64,*none*);
}*/
/* Footer */
.l2.pfiaof.V4 {
  display: none;
}
`;


(function() {
    'use strict';

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

// Episode 12 — Harness Feature Management & Experimentation demo app
// A tiny web app whose "new checkout banner" feature is controlled by a
// Harness Feature Flag. Toggle the flag in Harness → the app changes LIVE,
// with NO redeploy. That is the whole point of feature management.
const express = require("express");
const { CfClient, Config } = require("@harnessio/ff-nodejs-server-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

// ← CHANGE: your Harness Feature Flags SERVER SDK key (from AWS SM / env, never hardcode)
const FF_SDK_KEY = process.env.HARNESS_FF_SDK_KEY || "";

// Initialize the Harness Feature Flags client
let ffClient = null;
if (FF_SDK_KEY) {
    ffClient = new CfClient(FF_SDK_KEY, new Config({ enableStream: true }));
}

// A target represents WHO is asking (used for targeting + percentage rollout)
function targetFor(req) {
    return {
        identifier: req.query.user || "anonymous",
        name: req.query.user || "anonymous",
    };
}

app.get("/", async (req, res) => {
    let showBanner = false; // default (flag OFF) — safe fallback if SDK not ready

    if (ffClient) {
        // "new_checkout_banner" is the flag identifier we create in Harness
        showBanner = await ffClient.boolVariation(
            "new_checkout_banner",
            targetFor(req),
            false // default value if the flag can't be evaluated
        );
    }

    res.send(`
    <html><body style="font-family: sans-serif; text-align:center; padding:40px;">
      <h1>Online Store</h1>
      ${showBanner
            ? '<div style="background:#0a7;color:#fff;padding:20px;border-radius:8px;">🎉 NEW: Faster one-click checkout is here!</div>'
            : "<p>Welcome to the store.</p>"
        }
      <p><small>new_checkout_banner flag = <b>${showBanner ? "ON" : "OFF"}</b></small></p>
    </body></html>
  `);
});

app.get("/health", (req, res) => res.json({ status: "healthy" }));

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

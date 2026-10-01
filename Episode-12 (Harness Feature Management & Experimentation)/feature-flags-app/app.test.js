// Basic tests — the app must serve the home page and health with the flag OFF
// (default/fallback) even when no SDK key is set. This runs in CI.
const request = require("supertest");
const app = require("./app");

describe("Feature Flags demo app", () => {
    it("GET / renders the store page (flag OFF by default)", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Online Store");
        expect(res.text).toContain("new_checkout_banner flag");
    });

    it("GET /health returns healthy", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("healthy");
    });
});

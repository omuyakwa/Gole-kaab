from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Sign up and log in
        email = f"test.user.{int(time.time())}@example.com"
        page.goto("http://localhost:8080/auth", timeout=60000)
        page.get_by_role("tab", name="Sign Up").click()
        page.get_by_label("Display Name").fill("Test User")
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Create Account").click()
        expect(page.get_by_text("Account created!")).to_be_visible(timeout=10000)

        page.get_by_role("tab", name="Sign In").click()
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Sign In").click()
        expect(page.get_by_text("Welcome back!")).to_be_visible(timeout=10000)

        # 2. Test Accessibility Settings
        page.goto("http://localhost:8080/settings", timeout=60000)

        # Test large font size
        page.get_by_label("Large").click()
        expect(page.locator("body")).to_have_class("font-size-large")
        page.screenshot(path="jules-scratch/verification/accessibility_1_large_font.png")

        # Test high contrast mode
        page.get_by_label("High Contrast Mode").click()
        expect(page.locator("body")).to_have_class("high-contrast")
        page.screenshot(path="jules-scratch/verification/accessibility_2_high_contrast.png")

        # Reset to default
        page.get_by_label("Default").click()
        page.get_by_label("High Contrast Mode").click()

        # 3. Test Community Channels
        page.goto("http://localhost:8080/", timeout=60000)
        page.evaluate("document.getElementById('community').scrollIntoView()")

        # Post to "Youth Forum"
        page.get_by_placeholder("What's on your mind?").fill("A post for the youth forum.")
        page.locator('select').select_option('youth-forum')
        page.get_by_role("button", name="Post").click()
        expect(page.get_by_text("A post for the youth forum.")).to_be_visible(timeout=10000)

        # Filter by "Youth Forum"
        page.get_by_role("button", name="Youth Forum").click()
        expect(page.get_by_text("A post for the youth forum.")).to_be_visible(timeout=10000)
        expect(page.get_by_text("General")).not_to_be_visible()
        page.screenshot(path="jules-scratch/verification/channels_1_filtered.png")

        # 4. Test Emergency Help Center
        page.get_by_role("button", name="Emergency Help").click()
        expect(page).to_have_url("http://localhost:8080/help", timeout=10000)
        expect(page.get_by_text("National Emergency Hotline")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/help_center_1_page.png")

    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

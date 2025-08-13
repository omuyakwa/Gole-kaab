from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Log in
        page.goto("http://localhost:8080/auth", timeout=60000)
        page.get_by_label("Email").fill("test.user@example.com")
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Sign In").click()

        # We need to handle the case where the user is already signed up
        # For now, we will just check for either a success toast or an error toast
        # and proceed. A better test would handle this more gracefully.
        try:
            expect(page.get_by_text("Welcome back!")).to_be_visible(timeout=10000)
        except AssertionError:
            # If login fails, try to sign up
            page.get_by_role("tab", name="Sign Up").click()
            page.get_by_label("Display Name").fill("Test User")
            page.get_by_label("Email").fill("test.user@example.com")
            page.get_by_label("Password").fill("password123")
            page.get_by_role("button", name="Create Account").click()
            expect(page.get_by_text("Account created!")).to_be_visible(timeout=10000)

            # Now log in again
            page.get_by_role("tab", name="Sign In").click()
            page.get_by_label("Email").fill("test.user@example.com")
            page.get_by_label("Password").fill("password123")
            page.get_by_role("button", name="Sign In").click()
            expect(page.get_by_text("Welcome back!")).to_be_visible(timeout=10000)


        # 2. Navigate to the upload section by scrolling to it
        page.evaluate("document.getElementById('upload').scrollIntoView()")

        # 3. Upload a file
        page.set_input_files('input[type="file"]', 'jules-scratch/test.txt')

        # 4. Click the upload button
        page.get_by_role("button", name="Upload 1 File").click()

        # 5. Verify the upload was successful
        expect(page.get_by_text("Upload successful!")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/upload_success.png")

    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

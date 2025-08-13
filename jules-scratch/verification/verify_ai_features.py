from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Log in
        page.goto("http://localhost:8080/auth", timeout=60000)

        # Use a unique email for each run to avoid conflicts
        email = f"test.user.{int(time.time())}@example.com"

        # Sign up a new user
        page.get_by_role("tab", name="Sign Up").click()
        page.get_by_label("Display Name").fill("Test User")
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Create Account").click()
        expect(page.get_by_text("Account created!")).to_be_visible(timeout=10000)

        # Log in with the new user
        page.get_by_role("tab", name="Sign In").click()
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Sign In").click()
        expect(page.get_by_text("Welcome back!")).to_be_visible(timeout=10000)

        # 2. Navigate to the community section and create a post
        page.evaluate("document.getElementById('community').scrollIntoView()")
        page.get_by_placeholder("Share your thoughts...").fill("This is a test post for comments.")
        page.get_by_role("button", name="Post").click()
        expect(page.get_by_text("This is a test post for comments.")).to_be_visible(timeout=10000)

        # 3. Post a new comment
        page.get_by_placeholder("Write a reply...").first.fill("This is a test comment.")
        page.get_by_role("button", name="Post Reply").first.click()
        expect(page.get_by_text("This is a test comment.")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/ai_features_1_new_comment.png")

        # 4. Test the "Translate" button
        translate_button = page.get_by_role("button", name="Translate").first
        translate_button.click()
        expect(page.get_by_text("[SO] This is a test comment.")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/ai_features_2_translated.png")

        # Toggle back to original
        translate_button.click()
        expect(page.get_by_text("This is a test comment.")).to_be_visible(timeout=10000)

        # 5. Post a "toxic" comment
        page.get_by_placeholder("Write a reply...").first.fill("This is a toxic badword comment.")
        page.get_by_role("button", name="Post Reply").first.click()

        # 6. Verify that the toxic comment is flagged and hidden
        expect(page.get_by_text("This comment has been flagged for review.")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/ai_features_3_flagged.png")

        # Reveal the comment
        page.get_by_role("button", name="Show comment").click()
        expect(page.get_by_text("This is a toxic badword comment.")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/ai_features_4_revealed.png")

        # 7. Test the "Suggest Reply" feature
        page.get_by_placeholder("Write a reply...").first.fill("What do you think?")
        page.get_by_role("button", name="Suggest").click()

        # Verify suggestions appear
        suggestion_button = page.get_by_role("button", name="I completely agree.")
        expect(suggestion_button).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/ai_features_5_suggestions.png")

        # Click a suggestion
        suggestion_button.click()
        expect(page.get_by_placeholder("Write a reply...")).to_have_value("I completely agree.")
        page.screenshot(path="jules-scratch/verification/ai_features_6_suggestion_used.png")

    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

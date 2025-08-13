from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Sign up the first user (will become admin)
        admin_email = f"admin.user.{int(time.time())}@example.com"
        page.goto("http://localhost:8080/auth", timeout=60000)
        page.get_by_role("tab", name="Sign Up").click()
        page.get_by_label("Display Name").fill("Admin User")
        page.get_by_label("Email").fill(admin_email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Create Account").click()
        expect(page.get_by_text("Account created!")).to_be_visible(timeout=10000)

        # 2. Log in as admin
        page.get_by_role("tab", name="Sign In").click()
        page.get_by_label("Email").fill(admin_email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Sign In").click()
        expect(page.get_by_text("Welcome back!")).to_be_visible(timeout=10000)

        # 3. Verify User Dashboard for Admin
        page.wait_for_selector('.text-2xl.font-bold:has-text("0")')
        page.screenshot(path="jules-scratch/verification/dashboards_1_admin_user_view.png")

        # 4. Navigate to Admin Dashboard and verify
        page.goto("http://localhost:8080/admin", timeout=60000)
        expect(page.get_by_text("User Management")).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/dashboards_2_admin_dashboard.png")

        # Verify user management tab
        page.get_by_role("tab", name="User Management").click()
        expect(page.get_by_text(admin_email)).to_be_visible(timeout=10000)
        page.screenshot(path="jules-scratch/verification/dashboards_3_admin_users.png")

        # 5. Sign out
        page.get_by_role("button", name="Profile").click()
        page.get_by_role("menuitem", name="Sign Out").click()
        expect(page.get_by_role("button", name="Sign In")).to_be_visible(timeout=10000)

        # 6. Sign up a second user (will be a regular user)
        user_email = f"normal.user.{int(time.time())}@example.com"
        page.goto("http://localhost:8080/auth", timeout=60000)
        page.get_by_role("tab", name="Sign Up").click()
        page.get_by_label("Display Name").fill("Normal User")
        page.get_by_label("Email").fill(user_email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Create Account").click()
        expect(page.get_by_text("Account created!")).to_be_visible(timeout=10000)

        # 7. Log in as regular user
        page.get_by_role("tab", name="Sign In").click()
        page.get_by_label("Email").fill(user_email)
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Sign In").click()
        expect(page.get_by_text("Welcome back!")).to_be_visible(timeout=10000)

        # 8. Verify User Dashboard for regular user
        page.wait_for_selector('.text-2xl.font-bold:has-text("0")')
        page.screenshot(path="jules-scratch/verification/dashboards_4_regular_user_view.png")

        # 9. Try to access Admin Dashboard (should fail and redirect)
        page.goto("http://localhost:8080/admin", timeout=60000)
        expect(page).to_have_url("http://localhost:8080/", timeout=10000)
        page.screenshot(path="jules-scratch/verification/dashboards_5_admin_redirect.png")

    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

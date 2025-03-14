// reset password
const domain = '202.44.40.179';
const port = 3000

document.addEventListener("DOMContentLoaded", () => {
    const resetToken = window.location.pathname.split('/').pop(); // Extract token from URL
    // console.log("✅ JavaScript Loaded");

    document.getElementById("resetToken").value = resetToken; // Set resetToken in the hidden input field
    // console.log(`http://${domain}:${port}/auth/reset-password/${resetToken}`);
    // Handle form submission
    document.getElementById("resetPasswordForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const newPassword = (document.getElementById("password").value); // Get the new password

        try {
            // Send the new password to the backend
            const response = await fetch(`http://${domain}:${port}/auth/reset-password/${resetToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "newPassword" : newPassword })
            });
            
            const data = await response.json();

            // Handle response
            if (response.ok) {
                alert("✅ Your password has been updated successfully! Please log in.");
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while resetting the password.");
        }
    });
});

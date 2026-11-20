function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    // Smoothly scroll to the booking form when the page opens with #booking-form.
    if (window.location.hash === "#booking-form") {
        const bookingForm = document.getElementById("booking-form");

        if (bookingForm) {
            setTimeout(() => {
                bookingForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                showToast("Booking form is ready.");
            }, 100);
        }
    }
});


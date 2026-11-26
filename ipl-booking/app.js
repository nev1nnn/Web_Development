const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");
const teamFilter = document.querySelector("#team-filter");
const matchList = document.querySelector("#match-list");
const matchCards = document.querySelectorAll(".match-card");
const viewButtons = document.querySelectorAll(".view-button");
import { supabase } from "./src/supabase.js";

/**
 * Displays a temporary notification.
 * Make sure index.html contains:
 * <div id="toast-container" class="toast-container"
 *      aria-live="polite" aria-atomic="true"></div>
 */
function showToast(message) {
    const container = document.querySelector("#toast-container");

    if (container) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.textContent = message;
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
        return;
    }

    const toast = document.querySelector("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3000);
}

// Mobile navigation
if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    // Close the menu after a navigation link is selected.
    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        });
    });
}

// Filter match cards by team code in each card's data-teams attribute.
if (teamFilter) {
    teamFilter.addEventListener("change", () => {
        const selectedTeam = teamFilter.value;
        let visibleCount = 0;

        matchCards.forEach((card) => {
            const teams = (card.dataset.teams || "")
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

            const shouldShow =
                selectedTeam === "all" || teams.includes(selectedTeam);

            card.hidden = !shouldShow;

            if (shouldShow) visibleCount += 1;
        });

        if (visibleCount === 0) {
            showToast("No matches found for that team.");
        }
    });
}

// Switch between grid and list layouts.
viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const isListView = button.dataset.view === "list";

        if (matchList) {
            matchList.classList.toggle("list-view", isListView);
        }

        viewButtons.forEach((viewButton) => {
            const isActive = viewButton === button;
            viewButton.classList.toggle("is-active", isActive);
            viewButton.setAttribute("aria-pressed", String(isActive));
        });

        showToast(isListView ? "List view selected." : "Grid view selected.");
    });
});
(() => {
    const form = document.querySelector("#booking-form");
    if (!form) return;

    const matchSelect = document.querySelector("#match");
    const standSelect = document.querySelector("#stand");
    const quantityInput = document.querySelector("#quantity");
    const successMessage = document.querySelector("#success-message");

    const prices = {
        "match-01": { general: 1500, premium: 3500, vip: 7500 },
        "match-02": { general: 1200, premium: 3000, vip: 6500 },
        "match-03": { general: 1000, premium: 2500, vip: 5500 }
    };

    const formatRs = amount => `Rs. ${amount.toLocaleString("en-IN")}`;

    function updateSummary() {
        const matchId = matchSelect.value;
        const stand = standSelect.value;
        const quantity = Number(quantityInput.value) || 0;
        const matchPrices = prices[matchId];

        document.querySelector("#summary-match").textContent =
            matchSelect.selectedOptions[0]?.textContent || "Not selected";

        document.querySelector("#summary-stand").textContent =
            standSelect.selectedOptions[0]?.textContent || "Not selected";

        document.querySelector("#summary-quantity").textContent =
            String(quantity);

        for (const category of ["general", "premium", "vip"]) {
            document.querySelector(`#${category}-price`).textContent =
                matchPrices ? formatRs(matchPrices[category]) : "—";
        }

        const unitPrice = matchPrices && stand ? matchPrices[stand] : 0;
        const total = unitPrice * quantity;

        document.querySelector("#selected-price").textContent =
            unitPrice ? `Price per ticket: ${formatRs(unitPrice)}` : "Price per ticket: —";

        document.querySelector("#total-price").textContent =
            total ? formatRs(total) : "—";

        document.querySelector("#summary-total").textContent =
            total ? formatRs(total) : "Rs. 0";
    }

    form.addEventListener("input", updateSummary);
    form.addEventListener("change", updateSummary);
    form.addEventListener("reset", () => setTimeout(updateSummary, 0));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;

        try {
            const { data, error } = await supabase.rpc("book_match", {
                p_match_id: matchSelect.value,
                p_full_name: document.querySelector("#name").value.trim(),
                p_email: document.querySelector("#email").value.trim(),
                p_phone: document.querySelector("#phone").value.trim(),
                p_stand: standSelect.value,
                p_ticket_count: Number(quantityInput.value)
            });

            if (error) throw error;

            successMessage.textContent =
                `Booking confirmed. Total: ${formatRs(data.total_price)}.`;
            successMessage.style.display = "block";
            successMessage.focus();
            showToast("Booking saved successfully.");
        } catch (error) {
            console.error("Booking failed:", error);
            showToast(error.message || "Could not save booking.");
        } finally {
            submitButton.disabled = false;
        }
    });

    updateSummary();
})();
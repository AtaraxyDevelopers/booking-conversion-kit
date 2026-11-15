// Change this value, save the file, then reopen intake.html before sharing.
const BUSINESS_EMAIL = "sales@example.com";
document.getElementById("recipient").textContent = BUSINESS_EMAIL;
document.getElementById("intake").addEventListener("submit", (event) => {
  event.preventDefault();
  const d = Object.fromEntries(new FormData(event.target));
  const a = document.getElementById("draft");
  a.href =
    "mailto:" +
    encodeURIComponent(BUSINESS_EMAIL) +
    "?subject=" +
    encodeURIComponent("Consultation request from " + d.name) +
    "&body=" +
    encodeURIComponent(
      "Name: " +
        d.name +
        "\nEmail: " +
        d.email +
        "\nBudget: " +
        d.budget +
        "\nPreferred time (UTC): " +
        d.time +
        "\nNeeds: " +
        d.needs,
    );
  a.hidden = false;
  a.focus();
});

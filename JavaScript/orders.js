
function exportOrders() {
    alert("Exporting Orders...");
    // Add logic to export orders
}

function filterOrders() {
    const searchValue = document.getElementById("orderSearch").value.toLowerCase();
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const userName = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
        const productName = row.querySelector("td:nth-child(3)").textContent.toLowerCase();
        row.style.display = userName.includes(searchValue) || productName.includes(searchValue) ? "" : "none";
    });
}


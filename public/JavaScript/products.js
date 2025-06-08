
        function openAddProductModal() {
            alert("Open Add Product Modal");
            // Add logic to open a modal for adding a new product
        }

        function exportProducts() {
            alert("Exporting Products...");
            // Add logic to export products
        }

        function filterProducts() {
            const searchValue = document.getElementById("productSearch").value.toLowerCase();
            const rows = document.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const productName = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
                row.style.display = productName.includes(searchValue) ? "" : "none";
            });
        }

        function editProduct(button) {
            alert("Edit Product");
            // Add logic to edit the product
        }

        function deleteProduct(button) {
            if (confirm("Are you sure you want to delete this product?")) {
                const row = button.closest("tr");
                row.remove();
            }
        }
        
        // Load products from localStorage and display them in the table
        function loadProducts() {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const tableBody = document.querySelector('#products table tbody');
            tableBody.innerHTML = ''; // Clear existing rows
        
            products.forEach(product => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.price}</td>
                    <td>${product.dateAdded}</td>
                    <td>${product.lastEdited}</td>
                    <td>
                        <button onclick="editProduct(this)">Edit</button>
                        <button onclick="deleteProduct(this)">Delete</button>
                    </td>
                `;
            });
        }
    
        // Call loadProducts when the page loads
        document.addEventListener('DOMContentLoaded', loadProducts);
    
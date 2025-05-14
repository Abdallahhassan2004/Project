// Open Add Product Modal
function openAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.style.display = 'block';
}

// Close Add Product Modal
function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.style.display = 'none';
}

// Add Product Form Submission
document.getElementById('addProductForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;

    // Add the new product to the table dynamically
    const table = document.querySelector('#products table tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td></td>
        <td>${productName}</td>
        <td>${category}</td>
        <td>£${price}</td>
        <td>
            <button onclick="editProduct(this)">Edit</button>
            <button onclick="deleteProduct(this)">Delete</button>
        </td>
    `;

    // Update row numbers dynamically
    updateRowNumbers(table);

    closeAddProductModal();
});

// Update row numbers dynamically
function updateRowNumbers(table) {
    Array.from(table.rows).forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// Edit Product
function editProduct(button) {
    const row = button.parentElement.parentElement;
    const productName = row.cells[1].textContent;
    const category = row.cells[2].textContent;
    const price = row.cells[3].textContent.replace('£', '');

    // Populate the modal with existing data
    document.getElementById('productName').value = productName;
    document.getElementById('category').value = category;
    document.getElementById('price').value = price;

    // Open the modal
    openAddProductModal();

    // Update the form submission to edit the product
    const form = document.getElementById('addProductForm');
    form.onsubmit = function (event) {
        event.preventDefault();
        row.cells[1].textContent = document.getElementById('productName').value;
        row.cells[2].textContent = document.getElementById('category').value;
        row.cells[3].textContent = `£${document.getElementById('price').value}`;
        closeAddProductModal();

        // Reset the form submission to add new products
        form.onsubmit = null;
        form.addEventListener('submit', addProduct);
    };
}

// Delete Product
function deleteProduct(button) {
    const table = document.querySelector('#products table tbody');
    const row = button.parentElement.parentElement;
    if (confirm(`Are you sure you want to delete "${row.cells[1].textContent}"?`)) {
        table.deleteRow(row.rowIndex - 1);
        updateRowNumbers(table);
        alert('Product deleted successfully.');
    }
}

// Update Order Status
function updateOrderStatus(orderId) {
    const status = prompt(`Enter new status for Order ID: ${orderId} (e.g., Pending, Shipped, Delivered):`);
    if (status) {
        const table = document.querySelector('#orders table tbody');
        const row = Array.from(table.rows).find(row => row.cells[0].textContent == orderId);
        if (row) {
            row.cells[3].textContent = status;
            alert(`Order ID: ${orderId} status updated to "${status}".`);
        } else {
            alert(`Order ID: ${orderId} not found.`);
        }
    }
}

// Edit User
function editUser(button) {
    const row = button.parentElement.parentElement;
    const userName = prompt('Enter new name for the user:', row.cells[1].textContent);
    const userEmail = prompt('Enter new email for the user:', row.cells[2].textContent);

    if (userName && userEmail) {
        row.cells[1].textContent = userName;
        row.cells[2].textContent = userEmail;
        alert('User details updated successfully.');
    }
}

// Delete User
function deleteUser(button) {
    const table = document.querySelector('#users table tbody');
    const row = button.parentElement.parentElement;
    if (confirm(`Are you sure you want to delete "${row.cells[1].textContent}"?`)) {
        table.deleteRow(row.rowIndex - 1);
        alert('User deleted successfully.');
    }
}

// Close modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById('addProductModal');
    if (event.target === modal) {
        closeAddProductModal();
    }
};
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
// Add Product Form Submission
document.getElementById('addProductForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;

    const currentDate = new Date().toLocaleString(); // Get the current date and time

    // Create a new product object
    const newProduct = {
        id: Date.now(), // Use a unique ID based on the current timestamp
        name: productName,
        category: category,
        price: `£${price}`,
        dateAdded: currentDate,
        lastEdited: currentDate
    };

    // Save the product to localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    // Add the new product to the table dynamically
    const table = document.querySelector('#products table tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${newProduct.id}</td>
        <td>${newProduct.name}</td>
        <td>${newProduct.category}</td>
        <td>${newProduct.price}</td>
        <td>${newProduct.dateAdded}</td>
        <td>${newProduct.lastEdited}</td>
        <td>
            <button onclick="editProduct(this)">Edit</button>
            <button onclick="deleteProduct(this)">Delete</button>
        </td>
    `;

    closeAddProductModal();
});

// Update row numbers dynamically
function updateRowNumbers(table) {
    Array.from(table.rows).forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// Edit Product
/// Edit Product
function editProduct(button) {
    const validCategories = ["Dining", "Living Room", "Bedroom", "Kitchen"]; // Define valid categories
    const row = button.parentElement.parentElement;

    const productId = row.cells[0].textContent;
    const currentName = row.cells[1].textContent;
    const currentCategory = row.cells[2].textContent;
    const currentPrice = row.cells[3].textContent.replace('£', '');

    // Prompt the admin to edit product details
    const newName = prompt(`Enter new name for Product ID: ${productId} (current: ${currentName}):`, currentName);
    const newCategory = prompt(`Enter new category for Product ID: ${productId} (current: ${currentCategory}):`, currentCategory);
    const newPrice = prompt(`Enter new price for Product ID: ${productId} (current: £${currentPrice}):`, currentPrice);

    // Validate inputs
    if (newName && validCategories.includes(newCategory) && !isNaN(newPrice) && newPrice > 0) {
        // Update the table row
        row.cells[1].textContent = newName;
        row.cells[2].textContent = newCategory;
        row.cells[3].textContent = `£${newPrice}`;
        row.cells[5].textContent = new Date().toLocaleString(); // Update "Last Edited" field

        // Update the product in localStorage
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const productIndex = products.findIndex(product => product.id == productId);
        if (productIndex !== -1) {
            products[productIndex].name = newName;
            products[productIndex].category = newCategory;
            products[productIndex].price = `£${newPrice}`;
            products[productIndex].lastEdited = new Date().toLocaleString();
            localStorage.setItem('products', JSON.stringify(products));
        }

        alert(`Product ID: ${productId} updated successfully!`);
    } else {
        alert(`Invalid input. Please ensure the category is one of the following: ${validCategories.join(", ")} and the price is a valid number.`);
    }
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
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            const result = await response.json();
            showNotification(`Order status updated to ${newStatus}`, 'success');
            // Update the status in the table
            const statusCell = document.querySelector(`tr[data-order-id="${orderId}"] td:nth-child(4)`);
            if (statusCell) {
                statusCell.textContent = newStatus;
                statusCell.className = `status-${newStatus.toLowerCase()}`;
            }
        } else {
            const error = await response.json();
            showNotification(`Error: ${error.message}`, 'error');
        }
    } catch (error) {
        showNotification('Error updating order status: ' + error.message, 'error');
    }
}

// Edit User
function editUser(button) {
    const row = button.parentElement.parentElement;
    const userId = row.cells[0].textContent;
    const userName = row.cells[1].textContent;
    const userEmail = row.cells[2].textContent;

    // Prompt the admin to edit user details
    const newName = prompt('Enter new name for the user:', userName);
    const newEmail = prompt('Enter new email for the user:', userEmail);

    if (newName && newEmail) {
        row.cells[1].textContent = newName;
        row.cells[2].textContent = newEmail;
        row.cells[4].textContent = new Date().toLocaleString(); // Update "Last Edited" field
        alert(`User ID: ${userId} updated successfully.`);
    }
}

// Delete User
function deleteUser(button) {
    const table = document.querySelector('#users table tbody');
    const row = button.parentElement.parentElement;
    if (confirm(`Are you sure you want to delete User ID: ${row.cells[0].textContent}?`)) {
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

    // Update Account Functionality
    document.getElementById('updateAccountForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('adminName').value;
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        // Simulate updating account details
        alert(`Account updated successfully!\nName: ${name}\nEmail: ${email}`);
    });

    // Logout Functionality
    function logout() {
        sessionStorage.removeItem("isAdminLoggedIn");
        alert("You have been logged out.");
        window.location.href = "Login.html";
    }
/////////////////////////////




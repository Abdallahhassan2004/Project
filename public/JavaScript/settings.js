

            function removeDevice(button) {
            const row = button.closest('tr');
            row.remove();
            alert('Device removed successfully.');
            }
     

        
            function addAdmin(event) {
            event.preventDefault();

            const name = document.getElementById('newAdminName').value;
            const email = document.getElementById('newAdminEmail').value;

            const table = document.getElementById('adminHistoryTable');
            const newRow = document.createElement('tr');

            newRow.innerHTML = `
                <td>${name}</td>
                <td>${email}</td>
                <td>${new Date().toLocaleString()}</td>
                <td>Unknown Device</td>
                <td>
                <button onclick="removeDevice(this)">Remove Device</button>
                </td>
            `;

            table.appendChild(newRow);

            // Optionally, clear the form fields
            document.getElementById('addAdminForm').reset();
            }

            function removeDevice(button) {
            const row = button.closest('tr');
            row.remove();
            alert('Device removed successfully.');
            }
       
// cart.js (complete file)

// Function to update the cart item quantity
function updateCartItem(itemId, newQuantity) {
    $.ajax({
        type: 'POST',
        url: '/update-cart', // Replace with your server-side route for updating cart items
        data: { itemId: itemId, quantity: newQuantity },
        success: function (response) {
            // Handle the response from the server, which may include updated cart data
            if (response.success) {
                // Update the cart data on the client side
                updateCartTable(response.cart);
            } else {
                console.error('Failed to update cart item.');
            }
        },
        error: function (error) {
            console.error(error);
        },
    });
}

// Function to remove a cart item
function removeCartItem(itemId) {
    $.ajax({
        type: 'POST',
        url: '/remove-cart', // Replace with your server-side route for removing cart items
        data: { itemId: itemId },
        success: function (response) {
            // Handle the response from the server, which may include updated cart data
            if (response.success) {
                // Update the cart data on the client side
                updateCartTable(response.cart);
            } else {
                console.error('Failed to remove cart item.');
            }
        },
        error: function (error) {
            console.error(error);
        },
    });
}

// Function to update the cart table with new cart data
function updateCartTable(cartData) {
    // Implement logic to update the cart table based on the new cartData
    // You can use JavaScript to manipulate the DOM and display the updated cart contents
    // For example, iterate through cartData and update the table rows

    // Example:
    const cartTable = document.querySelector('.table tbody');
    cartTable.innerHTML = ''; // Clear the existing table rows

    for (let item of cartData) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <input
                    type="number"
                    value="${item.quantity}"
                    min="1"
                    data-item-id="${item.id}"
                    class="quantity-input"
                >
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td>
                <button
                    class="btn btn-primary btn-sm update-cart-item"
                    data-item-id="${item.id}"
                >
                    Update
                </button>
                <button
                    class="btn btn-danger btn-sm remove-cart-item"
                    data-item-id="${item.id}"
                >
                    Remove
                </button>
            </td>
        `;

        cartTable.appendChild(row);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const sections = {
        mainCourse: document.getElementById('mainCourseSection'),
        starters: document.getElementById('startersSection'),
        salads: document.getElementById('saladsSection'),
        desserts: document.getElementById('dessertsSection'),
        beverages: document.getElementById('beveragesSection'),
        breads: document.getElementById('breadsSection'),
        cart: document.getElementById('cartSection'),
        searchResults: document.getElementById('searchResults')
    };

    const socket = io();
    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    const showfeedbackform= ()=> {document.querySelector('.feedback-form').style.display = 'block';}
    const hidefeedbackform= ()=> {document.querySelector('.feedback-form').style.display = 'none';}

//logout
document.getElementById('logoutButton').addEventListener('click', () => {
    fetch('https://digitalmenusrc.onrender.com/logout', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            console.error('Logout failed');
        }
    })
    .catch(error => console.error('Error:', error));
});


//////Feedback form//////
    document.querySelector('.feedback-btn').onclick = e => {
        if(document.querySelector('.feedback-form').style.display === 'block') {
            hidefeedbackform();
        }
        else{
            showfeedbackform();
        }
    };

    document.getElementById('feedbackForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            feedback: formData.get('feedback')
        };

        try {
            const response = await fetch('https://digitalmenusrc.onrender.com/submit-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                alert('Feedback successfully submitted');
                form.reset();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting your feedback.');
        }
    });

    function hideAllSections() {
        Object.values(sections).forEach(section => section.style.display = 'none');
    }

    document.querySelectorAll('.catItem').forEach(item => {
        item.addEventListener('click', function() {
            hideAllSections();
            sections[this.id].style.display = 'flex';
        });
    });

    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function() {
            hideAllSections();
            document.querySelector('.category').style.display = 'flex';
            document.querySelector('.head').style.display = 'block';
            document.querySelector('.search').style.display = 'flex';
        });
    });

    document.querySelector('.cart').addEventListener('click', function() {
        hideAllSections();
        sections.cart.style.display = 'flex';
    });

    const cart = {};

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            const itemName = document.getElementById(itemId).textContent;
        
            if (!cart[itemId]) {
                cart[itemId] = { name: itemName, quantity: 0 };
            }
            cart[itemId].quantity++;
        
            const quantityElement = document.getElementById(`${itemId}_quantity`);
            if (quantityElement) {
                quantityElement.textContent = cart[itemId].quantity;
            }
        
            // Update cart display
            updateCartDisplay();
        });
    });

    function updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';
    
        Object.entries(cart).forEach(([itemId, itemData]) => {
            if (itemData.quantity > 0) {
                const cartItem = document.createElement('div');
                cartItem.classList.add('food-item');
                cartItem.innerHTML = `
                    <span id="${itemId}">${itemData.name}</span>
                    <span class="item-quantity">${itemData.quantity}</span>
                `;
                cartItems.appendChild(cartItem);
            }
        });
    
        // Show or hide submit button based on cart content
        const submitButton = document.getElementById('submitOrderButton');
        submitButton.style.display = (cartItems.children.length > 0) ? 'block' : 'none';
    }

    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResultsSection = sections.searchResults;
    const searchResultsContainer = document.getElementById('searchResultsContainer');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            fetch('https://digitalmenusrc.onrender.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })
            .then(response => response.json())
            .then(results => {
                hideAllSections();
                searchResultsSection.style.display = 'block';
                searchResultsContainer.innerHTML = results.map(result => `
                    <div class="food-item" id="${result.id}">
                        <span>${result.name}</span>
                        <span class="quantity">
                            <button class="minus-btn" type="button" onclick="decrementQuantity('${result.id}')">-</button>
                            <span class="qty">0</span>
                            <button class="plus-btn" type="button" onclick="incrementQuantity('${result.id}')">+</button>
                        </span>
                    </div>
                `).join('');
            });
        }
    });

    window.incrementQuantity = function(id) {
        const item = document.getElementById(id);
        const qtyElement = item.querySelector('.qty');
        let quantity = parseInt(qtyElement.textContent, 10);
        qtyElement.textContent = ++quantity;
    
        // Add to cart
        if (!cart[id]) {
            cart[id] = { name: item.querySelector('span').textContent, quantity: 0 };
        }
        cart[id].quantity++;
    
        // Update cart display
        updateCartDisplay();
    };

    window.decrementQuantity = function(id) {
        const item = document.getElementById(id);
        const qtyElement = item.querySelector('.qty');
        let quantity = parseInt(qtyElement.textContent, 10);
        if (quantity > 0) {
            qtyElement.textContent = --quantity;
            
            // Update cart
            if (cart[id] && cart[id].quantity > 0) {
                cart[id].quantity--;
            }
        
            // Update cart display
            updateCartDisplay();
        }
    };

    document.getElementById('submitOrderButton').addEventListener('click', () => {
        const cartItems = Object.entries(cart).map(([id, itemData]) => {
            return { id, quantity: itemData.quantity };
        });
    
        const tableNumber = document.getElementById('tableNumber').value;
    
        if (!tableNumber) {
            alert("Please enter the table number.");
            return;
        }
    
        fetch('https://digitalmenusrc.onrender.com/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cartItems, tableNumber })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Order submitted successfully!');
                // Clear the cart
                Object.keys(cart).forEach(itemId => {
                    cart[itemId].quantity = 0;
                });
                updateCartDisplay();
                document.getElementById('tableNumber').value = ''; // Clear the table number input
            } else {
                alert('Failed to submit order');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting the order');
        });
    });
});
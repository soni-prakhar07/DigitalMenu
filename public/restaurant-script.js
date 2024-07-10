document.addEventListener('DOMContentLoaded', function() {
    const socket = io();    

    const hideOrdersArea = () => {
        document.querySelector('.orders-area').style.display = 'none';
    };
    
    const showOrdersArea = () => {
        document.querySelector('.orders-area').style.display = 'flex';
    };
    
    const hideFeedbacksArea = () => {
        document.querySelector('.feedbacks-area').style.display = 'none';
    };
    
    const showFeedbacksArea = () => {
        document.querySelector('.feedbacks-area').style.display = 'flex';
    };
    
    const hideAllOrders = () => {
        document.querySelector('.allOrders').style.display = 'none';
    };
    
    const showAllOrders = () => {
        document.querySelector('.allOrders').style.display = 'flex';
    };
    
    document.getElementById('Feedback-btn').onclick = e => {
        if(document.querySelector('.feedbacks-area').style.display === 'flex') {
            showOrdersArea();
            hideAllOrders();
            hideFeedbacksArea();
        }
        else{
            hideOrdersArea();
            hideAllOrders();
            showFeedbacksArea();
        }
    };
    
    document.getElementById('allOrders-btn').onclick = e => {
        if(document.querySelector('.allOrders').style.display === 'flex') {
            showOrdersArea();
            hideAllOrders();
            hideFeedbacksArea();
        }
        else{
            hideOrdersArea();
            showAllOrders();
            hideFeedbacksArea();
        }
    };

    const loadOrders = (orders) => {
        const allOrders = document.querySelector('.allOrders');
        allOrders.innerHTML = orders.map(order => `
            <div class="order">
                <h2>Table Number: ${order.tableNumber}</h2>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.id}: ${item.quantity}</li>
                    `).join('')}
                </ul>
                <p>Order Date: ${new Date(order.date).toLocaleString()}</p>
            </div>
        `).join('');
    };

    // Load Orders
    fetch('/api/orders')
        .then(response => response.json())
        .then(orders => {
            loadOrders(orders);
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            alert('Failed to load orders.');
    });
    
    const addOrderToLiveOrders = (order) => {
        const liveOrders = document.getElementById('liveOrders');
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order');
        orderDiv.innerHTML = `
            <h2>Table Number: ${order.tableNumber}</h2>
            <ul>
                ${order.items.map(item => `<li>${item.id}: ${item.quantity}</li>`).join('')}
            </ul>
            <p>Order Date: ${new Date(order.date).toLocaleString()}</p>
            <button class="queue-btn">Queue</button>
        `;

        liveOrders.appendChild(orderDiv);

        // Add event listener to the "Queue" button
        orderDiv.querySelector('.queue-btn').addEventListener('click', () => {
            addOrderToQueuedOrders(orderDiv);
        });
    };

    const addOrderToQueuedOrders = (orderDiv) => {
        const queuedOrders = document.getElementById('QueuedOrders');
        orderDiv.querySelector('.queue-btn').remove();
        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Order Completed';
        completeBtn.classList.add('complete-btn');
        orderDiv.appendChild(completeBtn);

        queuedOrders.appendChild(orderDiv);

        // Add event listener to the "Order Completed" button
        completeBtn.addEventListener('click', () => {
            orderDiv.remove();
        });
    };

     // Listen for new orders
     socket.on('newOrder', (newOrder) => {
        addOrderToLiveOrders(newOrder);
        fetch('/api/orders')
            .then(response => response.json())
            .then(orders => {
                loadOrders(orders);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                alert('Failed to load orders.');
            });
    })

    //Load Feedbacks
    fetch('/api/feedbacks')
    .then(response => response.json())
    .then(feedbacks => {
        const feedbacksArea = document.querySelector('.feedbacks-area');
        feedbacksArea.innerHTML = feedbacks.map(feedback => `
            <div class="feedback">
                <h2>Name: ${feedback.name}</h2>
                <h2>Email: ${feedback.email}</h2>
                <p><b>Feedback:</b> ${feedback.feedback}</p>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error fetching feedbacks:', error);
        alert('Failed to load feedbacks.');
    });

});

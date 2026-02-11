
if (!sessionStorage.getItem('userType') || sessionStorage.getItem('userType') !== 'student') {
    window.location.href = '/';
}

document.getElementById('userEmailDisplay').textContent = `Logged in as: ${sessionStorage.getItem('userEmail')}`;


async function loadApprovedItems() {
    try {
        const userEmail = sessionStorage.getItem('userEmail');
        const response = await fetch(`/api/items?userEmail=${encodeURIComponent(userEmail)}`);
        const items = await response.json();
        const itemsGrid = document.getElementById('approvedItems');
        itemsGrid.innerHTML = '';
        
        if (items.length === 0) {
            itemsGrid.innerHTML = '<p class="no-items">No matching items found. Post a lost/found item to see matches!</p>';
            return;
        }
        
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            const typeClass = item.type === 'lost' ? 'lost-text' : 'found-text';
            itemCard.innerHTML = `
                <img src="${item.image_path}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <p class="item-details">
                    <span>Type: <span  class="${typeClass}">${item.type}</span></span>
                </p>
                <p class="user-info">Posted by: ${item.user_email}</p>
                <p class="match-badge">✨ AI Matched Item</p>
            `;
            itemsGrid.appendChild(itemCard);
        });
    } catch (error) {
        console.error('Error loading approved items:', error);
        const itemsGrid = document.getElementById('approvedItems');
        itemsGrid.innerHTML = '<p class="error-message">Error loading items. Please try again.</p>';
    }
}


async function loadMyItems() {
    try {
        const userEmail = sessionStorage.getItem('userEmail');
        const response = await fetch(`/api/items/user/${userEmail}`);
        const items = await response.json();
        
        const itemsGrid = document.getElementById('myItems');
        itemsGrid.innerHTML = '';
        
        if (items.length === 0) {
            itemsGrid.innerHTML = '<p class="no-items">You haven\'t posted any items yet.</p>';
            return;
        }
        
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            const typeClass = item.type === 'lost' ? 'lost-text' : 'found-text';
            const statusClass = item.status === 'approved' ? 'approved-text' : 
                              item.status === 'pending' ? 'pending-text' : 'rejected-text';
            
            itemCard.innerHTML = `
                <img src="${item.image_path}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <p class="item-details">
                    <span >Type: <span class="${typeClass}">${item.type}</span></span>
                </p>
                <p class="user-info">
                    Status: <span class="${statusClass}">${item.status}</span>
                </p>
                <div class="action-buttons">
                    <button class="login-btn delete-btn" onclick="deleteMyItem(${item.id})">Delete</button>
                </div>
            `;
            itemsGrid.appendChild(itemCard);
        });
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Error loading your items');
    }
}

async function deleteMyItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-email': sessionStorage.getItem('userEmail')
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Item deleted successfully');
            loadMyItems();
            loadApprovedItems();
        } else {
            alert(data.error || 'Error deleting item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}


async function postItem() {
    const title = document.getElementById('itemTitle').value;
    const description = document.getElementById('itemDescription').value;
    const type = document.getElementById('itemType').value;
    const imageFile = document.getElementById('itemImage').files[0];
    
    if (!title || !description || !type) {
        alert('Please fill in all required fields');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    if (imageFile) {
        formData.append('image', imageFile);
    }
    formData.append('userEmail', sessionStorage.getItem('userEmail'));
    
    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Item posted successfully! Once approved, you\'ll see AI-matched items.');
            document.getElementById('itemTitle').value = '';
            document.getElementById('itemDescription').value = '';
            document.getElementById('itemType').value = '';
            document.getElementById('itemImage').value = '';
 
            loadMyItems();
        } else {
            alert(data.error || 'Error posting item. Please try again.');
        }
    } catch (error) {
        console.error('Error posting item:', error);
        alert('Error posting item. Please check the console for details.');
    }
}

let chatInterval;

function toggleChat() {
    const modal = document.getElementById('chatModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        clearInterval(chatInterval);
    } else {
        modal.style.display = 'block';
        loadMessages();
        chatInterval = setInterval(loadMessages, 2000);
    }
}
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

async function loadMessages() {
    try {
        const userEmail = sessionStorage.getItem('userEmail');
        const response = await fetch(`/api/messages/${userEmail}?other_user=admin@email.com`);
        const messages = await response.json();
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender_email === userEmail ? 'sent' : 'received'}`;
            messageDiv.textContent = msg.message;
            chatMessages.appendChild(messageDiv);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    try {
        const userEmail = sessionStorage.getItem('userEmail');
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender_email: userEmail,
                receiver_email: 'admin@email.com',
                message: message
            })
        });
        
        if (response.ok) {
            messageInput.value = '';
            loadMessages();
        } else {
            alert('Error sending message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message');
    }
}


document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadApprovedItems();
    loadMyItems();
});
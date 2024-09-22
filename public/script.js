const form = document.getElementById("form");
const checkout = document.getElementById("checkout");

let order = {
	dayAndTime: Date,
	email: String,
	phone: String,
	name: String,
	blackHolderAmount: Number,
	grayHolderAmount: Number,
	lanyard1Amount: Number,
	lanyard2Amount: Number,
	lanyard3Amount: Number,
	totalMoney: Number,
}

function updateCheckoutInfo() {
    const qtyLanyard1 = parseInt(document.getElementById('quantity-lanyard-1').value) || 0;
    const qtyLanyard2 = parseInt(document.getElementById('quantity-lanyard-2').value) || 0;
    const qtyLanyard3 = parseInt(document.getElementById('quantity-lanyard-3').value) || 0;
    const qtyBlackHolder = parseInt(document.getElementById('quantity-black-holder').value) || 0;
    const qtyGrayHolder = parseInt(document.getElementById('quantity-gray-holder').value) || 0;

    let totalLanyard = qtyLanyard1 + qtyLanyard2 + qtyLanyard3;
    let totalHolder = qtyBlackHolder + qtyGrayHolder;

    const priceLanyard = 37000;
    const priceHolder = 10000;
    const priceCombo1 = 45000;
    const priceCombo2 = 85000;
    const priceCombo3 = 125000;

    let combo3Count = Math.min(Math.floor(totalLanyard / 3), Math.floor(totalHolder / 3));
    totalLanyard -= combo3Count * 3;
    totalHolder -= combo3Count * 3;

    let combo2Count = Math.min(Math.floor(totalLanyard / 2), Math.floor(totalHolder / 2));
    totalLanyard -= combo2Count * 2;
    totalHolder -= combo2Count * 2;

    let combo1Count = Math.min(totalLanyard, totalHolder);
    totalLanyard -= combo1Count;
    totalHolder -= combo1Count;

    const totalPrice = (combo3Count * priceCombo3) +
                       (combo2Count * priceCombo2) +
                       (combo1Count * priceCombo1) +
                       (totalLanyard * priceLanyard) +
                       (totalHolder * priceHolder);

    updateRow('combo-1', combo1Count, priceCombo1);
    updateRow('combo-2', combo2Count, priceCombo2);
    updateRow('combo-3', combo3Count, priceCombo3);
    updateRow('lanyard', totalLanyard, priceLanyard);
    updateRow('holder', totalHolder, priceHolder);
    updateCheckoutRow('lanyard-1', qtyLanyard1);
    updateCheckoutRow('lanyard-2', qtyLanyard2);
    updateCheckoutRow('lanyard-3', qtyLanyard3);
    updateCheckoutRow('black-holder', qtyBlackHolder);
    updateCheckoutRow('gray-holder', qtyGrayHolder);

    order.lanyard1Amount = qtyLanyard1;
    order.lanyard2Amount = qtyLanyard2;
    order.lanyard3Amount = qtyLanyard3;
    order.blackHolderAmount = qtyBlackHolder;
    order.grayHolderAmount = qtyGrayHolder;
    order.totalMoney = totalPrice;

    document.getElementById('grand-total').textContent = formatCurrency(totalPrice);
    document.getElementById('total').textContent = formatCurrency(totalPrice);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(value);
}

function updateRow(item, quantity, unitPrice) {
    const row = document.getElementById(`${item}-row`);
    const quantityCell = document.getElementById(`${item}-quantity`);
    const totalCell = document.getElementById(`${item}-total`);

    if (quantity > 0) {
        row.style.display = 'table-row'; 
        quantityCell.textContent = quantity;
        totalCell.textContent = formatCurrency(quantity * unitPrice);
    } else {
        row.style.display = 'none';  
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function validateCheckout() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    const qtyLanyard1 = parseInt(document.getElementById('quantity-lanyard-1').value) || 0;
    const qtyLanyard2 = parseInt(document.getElementById('quantity-lanyard-2').value) || 0;
    const qtyLanyard3 = parseInt(document.getElementById('quantity-lanyard-3').value) || 0;
    const qtyBlackHolder = parseInt(document.getElementById('quantity-black-holder').value) || 0;
    const qtyGrayHolder = parseInt(document.getElementById('quantity-gray-holder').value) || 0;

    if (!name) {
        alert("Please enter your name.");
        return false;
    }
    if (!phone) {
        alert("Please enter your phone number.");
        return false;
    }
    if (!isValidPhone(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return false;
    }
    if (!email) {
        alert("Please enter your email.");
        return false;
    }
    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

   
    const totalQuantity = qtyLanyard1 + qtyLanyard2 + qtyLanyard3 + qtyBlackHolder + qtyGrayHolder;
    if (totalQuantity === 0) {
        alert("Please select at least one item to order.");
        return false;
    }

    return true;
}


function updateCustomerInfo() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    document.getElementById('customer-name').innerText = `Name: ${name}`;
    document.getElementById('customer-phone').innerText = `Phone Number: ${phone}`;
    document.getElementById('customer-email').innerText = `Email: ${email}`;
    
    order.name = name;
    order.email = email;
    order.phone = phone;
}

function updateCheckoutRow(rowId, quantity) {
    document.getElementById(`${rowId}-quantity`).innerText = quantity;
    document.getElementById(`${rowId}-row`).style.display = quantity > 0 ? '' : 'none';
}

function setQR() {
	document.getElementById("transfer-message").innerText = `Message: SAB Preorder ${order.phone} ${order.name}`
	document.getElementById("qr_code").setAttribute("src", `https://img.vietqr.io/image/BIDV-0886542499-print.jpg?amount=${order.totalMoney}&addInfo=SAB%20Preorder%20${order.phone}%20${order.name.replace(" ", "%20")}&accountName=Vo%20Thanh%20Tu`)
}

function toggleBody() {
    form.classList.toggle("hide");
    checkout.classList.toggle("hide");
}

async function isOutOfStock() {
	return fetch('http://localhost:3000/storage', {
		method: 'GET',
	}).then(async (response) => {
		const data_map = await response.json();
		if (data_map["lanyard1Amount"] < order.lanyard1Amount)
		{
			alert("Out of stock for lanyard 1");
			return true;
		}
		if (data_map["lanyard2Amount"] < order.lanyard2Amount)
		{
			alert("Out of stock for lanyard 2");
			return true;
		}
		if (data_map["lanyard3Amount"] < order.lanyard3Amount)
		{
			alert("Out of stock for lanyard 3");
			return true;
		}
		if (data_map["blackHolderAmount"] < order.blackHolderAmount)
		{
			alert("Out of stock for black holder");
			return true;
		}
		if (data_map["grayHolderAmount"] < order.grayHolderAmount)
		{
			alert("Out of stock for gray holder");
			return true;
		}
		console.log("Return true");
		return false;
	}).catch(error => {
		alert("An error occurred. Please try again later.");
		console.error(error);	
		return true;
	})
}

function postData() {
    order.dayAndTime = Date.now();
    console.log("Post data now");

    fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    })
    .then(response => {
        if (response.ok) {
            alert("Order placed successfully!");
            setTimeout(() => {
                location.reload(); 
            }, 5000);
        } else {
            throw new Error('Something went wrong');
        }
    })
    .catch(error => {
        alert("An error occurred. Please try again later.");
        setTimeout(() => {
            location.reload();
        }, 5000);
    });
}

const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
    input.addEventListener('input', updateCheckoutInfo);
});

updateCheckoutInfo();

document.getElementById('isTranferred').addEventListener('change', function() {
    const submitButton = document.getElementById('submit-btn');
    submitButton.disabled = !this.checked;
});

document.getElementById('checkout-btn').addEventListener('click', async function(event) {
    event.preventDefault(); 
	let isOutofSTOCK = await isOutOfStock();
	if (!isOutofSTOCK && validateCheckout())
	{
		updateCustomerInfo();
		setQR();
		toggleBody();
	}
});

document.getElementById('back-btn').addEventListener("click", function(event) {
    event.preventDefault();
    toggleBody();
});

document.getElementById('submit-btn').addEventListener("click", function(event) {
    event.preventDefault();
    postData();
});
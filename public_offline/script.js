const form = document.getElementById("form");
const checkout = document.getElementById("checkout");

let order = {
	dayAndTime: Date,
	studentID: String,
	email: String,
	phone: String,
	name: String,
	blackHolderAmount: Number,
	grayHolderAmount: Number,
	lanyard1Amount: Number,
	lanyard2Amount: Number,
	lanyard3Amount: Number,
	totalMoney: Number,
	paymentMethod: String,
}

function isValidID(id) {
	const idRegex = /^2112[0-9]{4}$/;
	return idRegex.test(id);
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

	const totalPrice = 
		(totalLanyard * priceLanyard) +
		(totalHolder * priceHolder);

	updateRow('combo-1', 0, 0);
	updateRow('combo-2', 0, 0);
	updateRow('combo-3', 0, 0);
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
	const studentID = document.getElementById('student-id').value.trim();
	const method = document.getElementById('method').value.trim();

	const qtyLanyard1 = parseInt(document.getElementById('quantity-lanyard-1').value) || 0;
	const qtyLanyard2 = parseInt(document.getElementById('quantity-lanyard-2').value) || 0;
	const qtyLanyard3 = parseInt(document.getElementById('quantity-lanyard-3').value) || 0;
	const qtyBlackHolder = parseInt(document.getElementById('quantity-black-holder').value) || 0;
	const qtyGrayHolder = parseInt(document.getElementById('quantity-gray-holder').value) || 0;

	if (!isValidID(studentID)) {
		alert("Please enter a valid seller studentID.");
		return false;
	}

	if (method === "default") {
		alert("Please select payment method.");
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
	const studentID = document.getElementById('student-id').value.trim();
	const method = document.getElementById('method').value.trim();

	document.getElementById('customer-student-id').innerText = `Seller Student ID: ${studentID}`;

	order.studentID = studentID;
	order.paymentMethod = method;
}

function updateCheckoutRow(rowId, quantity) {
	document.getElementById(`${rowId}-quantity`).innerText = quantity;
	document.getElementById(`${rowId}-row`).style.display = quantity > 0 ? '' : 'none';
}

function setQR() {
	document.getElementById("transfer-message").innerText = `Message: SAB ORDER ${order.studentID} `
	document.getElementById("qr_code").setAttribute("src", `https://img.vietqr.io/image/BIDV-0886542499-print.jpg?amount=${order.totalMoney}&addInfo=SAB%20ORDER%20${order.studentID}&accountName=Vo%20Thanh%20Tu`)
}

function toggleBody() {
	form.classList.toggle("hide");
	checkout.classList.toggle("hide");
}

function postData() {
	order.dayAndTime = Date.now();
	console.log("Post data now");

	fetch(' http://localhost:5000/order', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(order)
	})
		.then(response => {
			if (response.ok) {
				alert("Order placed successfully! This website will reload in 3 seconds.");
				setTimeout(() => {
					location.reload();
				}, 3000);
			} else {
				throw new Error('Something went wrong');
			}
		})
		.catch(error => {
			alert("An error occurred. Please try again later. This website will reload in 3 seconds.");
			setTimeout(() => {
				location.reload();
			}, 3000);
		});
}

const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
	input.addEventListener('input', updateCheckoutInfo);
});

updateCheckoutInfo();

document.getElementById('isTranferred').addEventListener('change', function () {
	const submitButton = document.getElementById('submit-btn');
	submitButton.disabled = !this.checked;
});

document.getElementById('checkout-btn').addEventListener('click', async function (event) {
	event.preventDefault();
	const method = document.getElementById('method').value.trim();
	if (validateCheckout()) {
		if (method === "cash") {
			order.paymentMethod = "cash";
			this.disabled = true;
			postData();
			return;
		}
		updateCustomerInfo();
		setQR();
		toggleBody();
	}
});

document.getElementById('back-btn').addEventListener("click", function (event) {
	event.preventDefault();
	toggleBody();
});

document.getElementById('submit-btn').addEventListener("click", function (event) {
	event.preventDefault();
	this.disabled = true;
	order.paymentMethod = "transfer";
	document.getElementById('back-btn').disabled = true;
	postData();
});
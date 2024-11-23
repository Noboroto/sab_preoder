const form = document.getElementById("form");
const checkout = document.getElementById("checkout");
const DOMAIN = (isSafariOniOS()) ? `http://order.sab.edu.vn` : `https://order.sab.edu.vn`;
const STUDENT_ID_LENGTH = 8;
const ORDER_ID_LENGTH = 6;

function isSafariOniOS() {
	const ua = navigator.userAgent;

	// Kiểm tra xem thiết bị có phải là iOS (iPhone, iPad, iPod)  
	const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

	// Kiểm tra xem trình duyệt có phải là Safari  
	const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);

	return isIOS && isSafari;
}

let order = {
	orderID: String,
	sellerID: String,
	customerID: String,
	customerName: String,
	combo1: Number,
	combo2: Number,
	combo3: Number,
	combo4: Number,
	total: Number,
	paymentMethod: String,
}
const price3Type = 25000;
const price2Type = 20000;

const seller_id_text = document.getElementById('seller-id');
const method_text = document.getElementById('method');
const checkoutButton = document.getElementById('checkout-btn');

function saveSelection() {
	sessionStorage.setItem('seller-id', seller_id_text.value);
	sessionStorage.setItem('method', method_text.value);
}

function restoreSelection() {
	if (sessionStorage.getItem('seller-id')) {
		seller_id_text.value = sessionStorage.getItem('seller-id');
	}
	if (sessionStorage.getItem('method')) {
		method_text.value = sessionStorage.getItem('method');
	}
}

restoreSelection();
seller_id_text.addEventListener('change', saveSelection);
method_text.addEventListener('change', saveSelection);

function isValidID(id) {
	const idRegex = /^[0-9]{8}$/;
	return idRegex.test(id);
}

function updateCheckoutInfo(param = null, prefix = "") {
	const qtyCombo1 = parseInt(document.getElementById('quantity-combo-1').value) || 0;
	const qtyCombo2 = parseInt(document.getElementById('quantity-combo-2').value) || 0;
	const qtyCombo3 = parseInt(document.getElementById('quantity-combo-3').value) || 0;
	const qtyCombo4 = parseInt(document.getElementById('quantity-combo-4').value) || 0;

	const totalPrice = qtyCombo4 * price2Type + (qtyCombo1 + qtyCombo2 + qtyCombo3) * price3Type 

	updateRow(prefix + 'combo-1', qtyCombo1, price3Type);
	updateRow(prefix + 'combo-2', qtyCombo2, price3Type);
	updateRow(prefix + 'combo-3', qtyCombo3, price3Type);
	updateRow(prefix + 'combo-4', qtyCombo4, price2Type);

	order.combo1 = qtyCombo1;
	order.combo2 = qtyCombo2;
	order.combo3 = qtyCombo3;
	order.combo4 = qtyCombo4;
	order.total = totalPrice;

	document.getElementById(prefix + 'grand-total').textContent = formatCurrency(totalPrice);
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
	const sellerID = document.getElementById('seller-id').value.trim();
	const method = document.getElementById('method').value.trim();

	const qtyCombo1 = parseInt(document.getElementById('quantity-combo-1').value) || 0;
	const qtyCombo2 = parseInt(document.getElementById('quantity-combo-2').value) || 0;
	const qtyCombo3 = parseInt(document.getElementById('quantity-combo-3').value) || 0;
	const qtyCombo4 = parseInt(document.getElementById('quantity-combo-4').value) || 0;

	if (!isValidID(sellerID)) {
		alert("Please enter a valid seller studentID.");
		return false;
	}

	if (method === "default") {
		alert("Please select payment method.");
		return false;
	}

	const totalQuantity = qtyCombo1 + qtyCombo2 + qtyCombo3 + qtyCombo4;
	if (totalQuantity === 0) {
		alert("Please select at least one item to order.");
		return false;
	}
	return true;
}


function updateCustomerInfo() {
	const sellerID = document.getElementById('seller-id').value.trim();
	const customerID = document.getElementById('customer-id').value.trim();
	const customerName = document.getElementById('customer-name').value.trim();
	const method = document.getElementById('method').value.trim();

	document.getElementById('seller-student-id').innerText = `MSSV người bán: ${sellerID}`;
	document.getElementById('customer-student-id').innerText = `MSSV người mua: ${customerID}`;
	document.getElementById('customer-fullname').innerText = `Tên người mua: ${customerName}`;

	order.sellerID = sellerID;
	order.customerID = customerID;
	order.customerName = customerName;
	order.paymentMethod = method;
}

function setQR() {
	const namesArr = order.customerName.split(" ");
	const firstName = namesArr[namesArr.length - 1];
	const lastName = namesArr[0];
	const bankAccount = "0795557668"
	const bankOwer = "Nguyen Phuc Tho";
	const bankCode = "MBBank";

	const msg = `KHTN AMD ${order.customerID} ${order.orderID} A${order.combo1} B${order.combo2} C${order.combo3} D${order.combo4} ${firstName} ${lastName}`;
	document.getElementById("transfer-message").innerText = `Message: SAB ORDER ${order.studentID} ${order.orderID}`;
	document.getElementById("qr_code").setAttribute("src", `https://img.vietqr.io/image/${bankCode}-${bankAccount }-print.jpg?amount=${order.total}&addInfo=${msg.replaceAll(" ","%20")}&accountName=${bankOwer.replaceAll(" ","%20")}`);
}

function toggleBody() {
	form.classList.toggle("hide");
	checkout.classList.toggle("hide");
	checkoutButton.disabled = false;
}

async function postData() {
	console.log("Post data now");
	if (!window.fetch) {
		alert("Fetch API không được hỗ trợ trên trình duyệt này.");
		// Nếu fetch không được hỗ trợ, sử dụng XMLHttpRequest hoặc thư viện khác  
		return Promise.reject(new Error('Fetch API không được hỗ trợ trên trình duyệt này.'));
	}

	await fetch(`${DOMAIN}/transaction`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(order)
	})
		.then(async response => {
			if (response.ok) {
				const data = await response.json();
				order.orderID = await data.transactionID;
				console.info(`orderID: ${order.orderID}`);
			} else {
				throw new Error('Something went wrong');
			}
		})
		.catch(error => {
			order.orderID = "0".repeat(ORDER_ID_LENGTH);
			if (isSafariOniOS()) {
				alert(`Error: ${error} - ${error.message} - ${error.stack} - ${error.name} - ${JSON.stringify(error)}`);
				throw new Error(error);
			}
			else {
				alert("An error occurred. Please try again later. This website will reload in 1 second.");
			}
			setTimeout(() => {
				location.reload();
			}, 100000);
		});
}

const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
	input.addEventListener('input', updateCheckoutInfo);
});

updateCheckoutInfo();

checkoutButton.addEventListener('click', async function (event) {
	event.preventDefault();
	const method = document.getElementById('method').value.trim();

	order.name = document.getElementById('seller-id').value.trim();
	order.studentID = document.getElementById('seller-id').value.trim();
	order.paymentMethod = method;
	if (validateCheckout()) {
		const ID_LENGTH = 8;

		order.customerID = (order.customerID.length < ID_LENGTH) ? "x".repeat(ID_LENGTH - order.customerID.length) + order.customerID : order.customerID;
		updateCustomerInfo();
		checkoutButton.disabled = true;

		postData().then(() => {
			if (method === "cash") {
				this.disabled = true;
				alert("Order placed successfully! This website will reload in 1 second.");
				setTimeout(() => {
					location.reload();
				}, 1000);
				return;
			}
			updateCheckoutInfo(null, "cko-");
			setQR();
			toggleBody(); 
		}).finally(() => {
		checkoutButton.disabled = false;
		});
	}
});

document.getElementById('back-btn').addEventListener("click", function (event) {
	event.preventDefault();
	location.reload();
});
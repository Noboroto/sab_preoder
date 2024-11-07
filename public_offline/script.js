const form = document.getElementById("form");
const checkout = document.getElementById("checkout");
const DOMAIN = (isSafariOniOS()) ? `http://fund.sab.edu.vn` : `https://fund.sab.edu.vn`;
const ID_LENGTH = 8;

function isSafariOniOS() {  
  const ua = navigator.userAgent;  
  
  // Kiểm tra xem thiết bị có phải là iOS (iPhone, iPad, iPod)  
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;  
  
  // Kiểm tra xem trình duyệt có phải là Safari  
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);  
  
  return isIOS && isSafari;  
}

let order = {
	lastName: String,
	studentID: String,
	email: String,
	phone: String,
	firstName: String,
	totalMoney: Number,
	events: Map
}

const id_text = document.getElementById('student-id');
const name_text = document.getElementById('student-name');
const method_text = document.getElementById('method');
const checkoutButton = document.getElementById('checkout-btn');

function saveSelection() {
	sessionStorage.setItem('student-id', id_text.value);
	sessionStorage.setItem('student-name', name_text.value);
}

function restoreSelection() {
	if (sessionStorage.getItem('student-id')) {
		id_text.value = sessionStorage.getItem('student-id');
	}
	if (sessionStorage.getItem('student-name')) {
		name_text.value = sessionStorage.getItem('student-name');
	}
}

restoreSelection();
id_text.addEventListener('change', saveSelection);
name_text.addEventListener('change', saveSelection);

function isValidID(id) {
	const idRegex = /^[1-9]\d{7}$/;
	return idRegex.test(id);
}

function updateCheckoutInfo() {
	const cvm = parseInt(document.getElementById('CVM').value) || 0;
	const cs1 = parseInt(document.getElementById('CS1').value) || 0;
	const sip = parseInt(document.getElementById('SIP').value) || 0;
	const olf = parseInt(document.getElementById('OLF').value) || 0;

	let totalMoney = cvm + cs1 + sip + olf;
	const unit = 1000;

	const totalPrice = totalMoney * unit;

	order.events = new Map();
	updateRow('CVM', cvm * unit);
	updateRow('CS1', cs1 * unit);
	updateRow('SIP', sip * unit);
	updateRow('OLF', olf * unit);
	updateCheckoutRow('CVM', cvm * unit);
	updateCheckoutRow('CS1', cs1 * unit);
	updateCheckoutRow('SIP', sip * unit);
	updateCheckoutRow('OLF', olf * unit);

	order.totalMoney = totalPrice;
	order.events.set('CVM', cvm);
	order.events.set('CS1', cs1);
	order.events.set('SIP', sip);
	order.events.set('OLF', olf);

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

function updateRow(item, price) {
	const row = document.getElementById(`${item}-row-info`);
	const totalCell = document.getElementById(`${item}-total-info`);
	if (!row || !totalCell) {
		return;
	}
	if (price > 0) {
		row.style.display = 'table-row';
		totalCell.textContent = formatCurrency(price);
	} else {
		row.style.display = 'none';
	}
}

function validateCheckout() {
	const studentID = document.getElementById('student-id').value.trim();
	const studentName = document.getElementById('student-name').value.trim();
	const cvm = parseInt(document.getElementById('CVM').value) || 0;
	const cs1 = parseInt(document.getElementById('CS1').value) || 0;
	const sip = parseInt(document.getElementById('SIP').value) || 0;
	const olf = parseInt(document.getElementById('OLF').value) || 0;

	if (!isValidID(studentID)) {
		alert("Please enter a valid seller studentID.");
		return false;
	}

	if (studentName === "" || studentName === null) {
		alert("Please enter your name.");
		return false;
	}

	if (studentName.split(" ").length < 3) {
		alert("Please enter your full name.");
		return false;
	}

	const totalMoney = cvm + cs1 + sip + olf;
	if (totalMoney === 0) {
		alert("Please input at least one item.");
		return false;
	}

	return true;
}


function updateCustomerInfo() {
	const studentID = document.getElementById('student-id').value.trim();
	const fullName = document.getElementById('student-name').value.trim();

	document.getElementById('student-id-info').innerText = `Student ID: ${studentID}`;
	document.getElementById('student-name-info').innerText = `Name: ${fullName}`;

	const nameArray = fullName.split(" ");

	const firstName = nameArray[nameArray.length - 1]; 
	const lastName = nameArray[0];

	order.studentID = studentID;
	order.firstName = firstName;
	order.lastName = lastName;
}

function updateCheckoutRow(rowId, totalMoney) {
	document.getElementById(`${rowId}-total`).innerText = formatCurrency(totalMoney);
	document.getElementById(`${rowId}-row`).style.display = totalMoney > 0 ? '' : 'none';
}

function setQR() {
	const selectedKeys = [...order.events.keys()].filter(key => order.events.get(key) > 0);
	const msg = `${order.studentID} ${selectedKeys.join(" ")} ${order.firstName} ${order.lastName}`;
	document.getElementById("transfer-message").innerText = `Message: ${msg}`;
	document.getElementById("qr_code").setAttribute("src", `https://img.vietqr.io/image/BIDV-0886542499-print.jpg?amount=${order.totalMoney}&addInfo=${msg.replaceAll(" ", "%20")}&accountName=Vo%20Thanh%20Tu`)
}

function toggleBody() {
	form.classList.toggle("hide");
	checkout.classList.toggle("hide");
	checkoutButton.disabled = false;
}

const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
	input.addEventListener('input', updateCheckoutInfo);
});

updateCheckoutInfo();

checkoutButton.addEventListener('click', function (event) {
	event.preventDefault();
	if (validateCheckout()) {
		updateCustomerInfo();
		setQR();
		toggleBody();
	}
	checkoutButton.disabled = true;
	postData().catch((e) => {
		console.error(e);
	})
	.finally(() => {
		checkoutButton.disabled = false;
	});
});

document.getElementById('back-btn').addEventListener("click", function (event) {
	event.preventDefault();
	toggleBody();
});

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
}
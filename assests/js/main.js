// --- CART LOGIC START ---

const CART_KEY = "cart";

function getCart() {
	return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function setCart(cart) {
	localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateHeaderCartCount() {
	const cart = getCart();
	const count = cart.reduce((sum, item) => sum + item.quantity, 0);
	const headerCartCount = document.getElementById("headerCartCount");
	if (count > 0) {
		headerCartCount.textContent = count;
		headerCartCount.style.display = "";
	} else {
		headerCartCount.textContent = "0";
		headerCartCount.style.display = "none";
	}
}

function updateProductQuantityUI(productId, quantity) {
	const card = document
		.querySelector(`.product-card__add-to-cart[data-product="${productId}"]`)
		.closest(".product-card");
	const quantityBlock = card.querySelector(".product-card__quantity");
	const quantityValue = card.querySelector(".product-card__quantity-value");
	const addToCartBtn = card.querySelector(".product-card__add-to-cart");
	const buyBtn = card.querySelector(".product-card__buy-btn");

	if (quantity > 0) {
		quantityBlock.style.display = "flex";
		quantityValue.textContent = quantity;
		if (addToCartBtn) addToCartBtn.style.display = "none";
		if (buyBtn) buyBtn.style.display = "";
	} else {
		quantityBlock.style.display = "none";
		quantityValue.textContent = "0";
		if (addToCartBtn) addToCartBtn.style.display = "";
		if (buyBtn) buyBtn.style.display = "none";
	}
}

function getProductInfo(productId) {
	// Получаем данные из DOM
	const card = document
		.querySelector(`.product-card__add-to-cart[data-product="${productId}"]`)
		.closest(".product-card");
	const name = card.querySelector(".product-card__title").textContent.trim();
	const price = parseFloat(card.querySelector(".product-card__prcvalue").textContent.trim());
	return { id: productId, name, price };
}

// Инициализация UI по корзине
function initCartUI() {
	const cart = getCart();
	document.querySelectorAll(".product-card__add-to-cart").forEach((btn) => {
		const productId = btn.getAttribute("data-product");
		const item = cart.find((i) => i.id === productId);
		updateProductQuantityUI(productId, item ? item.quantity : 0);
	});
	updateHeaderCartCount();
}

document.querySelectorAll(".product-card__add-to-cart").forEach((btn) => {
	btn.addEventListener("click", function (e) {
		e.stopPropagation();
		const productId = btn.getAttribute("data-product");
		let cart = getCart();
		let item = cart.find((i) => i.id === productId);
		if (item) {
			item.quantity += 1;
		} else {
			const info = getProductInfo(productId);
			item = { ...info, quantity: 1 };
			cart.push(item);
		}
		setCart(cart);
		updateProductQuantityUI(productId, item.quantity);
		updateHeaderCartCount();
	});
});

document.querySelectorAll(".product-card").forEach((card) => {
	const productId = card.querySelector(".product-card__add-to-cart").getAttribute("data-product");
	const quantityBlock = card.querySelector(".product-card__quantity");

	if (!quantityBlock) return;

	const minusBtn = quantityBlock.querySelector(".product-card__quantity-btn--minus");
	const plusBtn = quantityBlock.querySelector(".product-card__quantity-btn--plus");

	minusBtn.addEventListener("click", function (e) {
		e.stopPropagation();
		let cart = getCart();
		let item = cart.find((i) => i.id === productId);
		if (item) {
			item.quantity -= 1;
			if (item.quantity <= 0) {
				cart = cart.filter((i) => i.id !== productId);
				updateProductQuantityUI(productId, 0);
			} else {
				updateProductQuantityUI(productId, item.quantity);
			}
			setCart(cart);
			updateHeaderCartCount();
		}
	});
	plusBtn.addEventListener("click", function (e) {
		e.stopPropagation();
		let cart = getCart();
		let item = cart.find((i) => i.id === productId);
		if (item) {
			item.quantity += 1;
			updateProductQuantityUI(productId, item.quantity);
			setCart(cart);
			updateHeaderCartCount();
		}
	});
});

// Скрыть все quantity по умолчанию
window.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".product-card__quantity").forEach((q) => (q.style.display = "none"));
	initCartUI();
});
// --- CART LOGIC END ---

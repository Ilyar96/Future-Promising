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

// --- SIDEBAR CART LOGIC ---
const cartSidebar = document.getElementById("cartSidebar");
const cartSidebarOverlay = document.getElementById("cartSidebarOverlay");
const cartSidebarClose = document.getElementById("cartSidebarClose");
const cartSidebarList = document.getElementById("cartSidebarList");
const cartSidebarTotal = document.getElementById("cartSidebarTotal");
const cartSidebarClear = document.getElementById("cartSidebarClear");

function openCartSidebar() {
	cartSidebar.classList.add("active");
	document.body.style.overflow = "hidden";
	renderCartSidebar();
}
function closeCartSidebar() {
	cartSidebar.classList.remove("active");
	document.body.style.overflow = "";
}

// Открытие по кнопке Cart в header
const headerCartBtn = document.querySelector(".header__cart");
if (headerCartBtn) {
	headerCartBtn.addEventListener("click", openCartSidebar);
}
// Открытие по кнопке Buy now на карточках
function addBuyBtnListeners() {
	document.querySelectorAll(".product-card__buy-btn").forEach((btn) => {
		btn.addEventListener("click", openCartSidebar);
	});
}
addBuyBtnListeners();

// Закрытие по overlay и крестику
cartSidebarOverlay.addEventListener("click", closeCartSidebar);
cartSidebarClose.addEventListener("click", closeCartSidebar);

// Рендеринг товаров в sidebar
function renderCartSidebar() {
	const cart = getCart();
	const checkoutBtn = document.getElementById("cartSidebarCheckout");
	cartSidebarList.innerHTML = "";
	let total = 0;

	if (cart.length === 0) {
		checkoutBtn.disabled = true;
		cartSidebarList.innerHTML = '<div style="text-align:center;color:#888;">Cart is empty</div>';
		cartSidebarTotal.textContent = "$0";
		return;
	} else {
		checkoutBtn.disabled = false;
	}
	cart.forEach((item) => {
		total += item.price * item.quantity;
		const productCard = document
			.querySelector(`.product-card__add-to-cart[data-product="${item.id}"]`)
			.closest(".product-card");
		const img = productCard.querySelector("img");
		const imgSrc = img ? img.getAttribute("src") : "";
		const imgAlt = img ? img.getAttribute("alt") : "";
		const div = document.createElement("div");
		div.className = "cart-sidebar__item";
		div.innerHTML = `
			<div class="cart-sidebar__item-img-container"><img class="cart-sidebar__item-img" src="${imgSrc}" alt="${imgAlt}"></div>
			<div class="cart-sidebar__item-info">
				<div class="cart-sidebar__item-title">${item.name}</div>
				<div class="cart-sidebar__item-cart-footer">
					<div class="cart-sidebar__item-quantity">
						<button class="cart-sidebar__item-quantity-btn" data-action="minus" data-id="${item.id}">-</button>
						<span class="cart-sidebar__item-quantity-value">${item.quantity}</span>
						<button class="cart-sidebar__item-quantity-btn" data-action="plus" data-id="${item.id}">+</button>
					</div>
					<div class="cart-sidebar__item-total">$${(item.price * item.quantity).toFixed(2)}</div>
				</div>
			</div>
			<button class="cart-sidebar__item-remove" data-action="remove" data-id="${
				item.id
			}" title="Удалить">&times;</button>
		`;
		cartSidebarList.appendChild(div);
	});
	cartSidebarTotal.textContent = `$${total}`;
}

// Управление количеством и удаление товара в sidebar
cartSidebarList.addEventListener("click", function (e) {
	const btn = e.target.closest("button");
	if (!btn) return;
	const action = btn.getAttribute("data-action");
	const id = btn.getAttribute("data-id");
	let cart = getCart();
	let item = cart.find((i) => i.id === id);
	if (!item) return;
	if (action === "minus") {
		item.quantity -= 1;
		if (item.quantity <= 0) {
			cart = cart.filter((i) => i.id !== id);
		}
		setCart(cart);
		updateProductQuantityUI(id, item.quantity > 0 ? item.quantity : 0);
		updateHeaderCartCount();
		renderCartSidebar();
	} else if (action === "plus") {
		item.quantity += 1;
		setCart(cart);
		updateProductQuantityUI(id, item.quantity);
		updateHeaderCartCount();
		renderCartSidebar();
	} else if (action === "remove") {
		cart = cart.filter((i) => i.id !== id);
		setCart(cart);
		updateProductQuantityUI(id, 0);
		updateHeaderCartCount();
		renderCartSidebar();
	}
});

// Очистить корзину
cartSidebarClear.addEventListener("click", function () {
	setCart([]);
	initCartUI();
	renderCartSidebar();
});

// Перерисовывать sidebar при изменении корзины (например, если изменили количество на карточке)
window.addEventListener("storage", function (e) {
	if (e.key === CART_KEY) {
		renderCartSidebar();
	}
});

// Перерисовать sidebar при открытии страницы, если он открыт
window.addEventListener("DOMContentLoaded", function () {
	if (cartSidebar.classList.contains("active")) {
		renderCartSidebar();
	}
});

// --- CHECKOUT LOGIC ---
const cartSidebarCheckout = document.getElementById("cartSidebarCheckout");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalDetails = document.getElementById("modalDetails");
const modalForm = document.getElementById("modalForm");

function openModalWithCart() {
	const cart = getCart();
	if (!cart.length) return;

	modalTitle.textContent = "Order checkout";

	// Показываем форму
	modalForm.style.display = "";

	modal.classList.add("active");
	document.body.style.overflow = "hidden";
}

cartSidebarCheckout.addEventListener("click", function () {
	if (getCart().length === 0) return;
	closeCartSidebar();
	setTimeout(openModalWithCart, 300); // плавное закрытие sidebar
});

modalClose.addEventListener("click", function () {
	modal.classList.remove("active");
	document.body.style.overflow = "";
});

document.querySelector(".modal__overlay").addEventListener("click", function () {
	modal.classList.remove("active");
	document.body.style.overflow = "";
});

modalForm.addEventListener("submit", function (e) {
	e.preventDefault();

	// Скрываем форму
	modalForm.style.display = "none";

	// Показываем сообщение об успехе
	modalDetails.innerHTML =
		'<div id="modalOrderStatus" style="color:green;text-align:center;font-weight:600;padding:20px;">Your order has been sent successfully!</div>';

	setCart([]);
	initCartUI();

	setTimeout(() => {
		modal.classList.remove("active");
		document.body.style.overflow = "";
		// Возвращаем форму в исходное состояние через небольшую задержку
		setTimeout(() => {
			document.getElementById("modalOrderStatus").remove();
			modalForm.reset();
			modalForm.style.display = "";
		}, 300);
	}, 2000);
});

// --- SIDEBAR CART LOGIC END ---

function checkScroll() {
	const header = document.querySelector(".header");

	if (window.scrollY > 0) {
		header.classList.add("scrolled");
	} else {
		header.classList.remove("scrolled");
	}
}

checkScroll();

window.addEventListener("scroll", checkScroll);

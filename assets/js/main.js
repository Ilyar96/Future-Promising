(function () {
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
		const card = document
			.querySelector(`.product-card__add-to-cart[data-product="${productId}"]`)
			.closest(".product-card");
		const name = card.querySelector(".product-card__title").textContent.trim();
		const price = parseFloat(card.querySelector(".product-card__prcvalue").textContent.trim());
		return { id: productId, name, price };
	}

	// Init Cart UI
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

		// Снимаем все старые обработчики (если вдруг были)
		const newMinusBtn = minusBtn.cloneNode(true);
		const newPlusBtn = plusBtn.cloneNode(true);
		minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
		plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);

		newPlusBtn.addEventListener("click", function (e) {
			e.stopPropagation();
			let cart = JSON.parse(localStorage.getItem("cart")) || [];
			let item = cart.find((i) => i.id === productId);
			if (item) {
				item.quantity++;
			} else {
				const name = card.querySelector(".product-card__title").textContent.trim();
				const price = parseFloat(card.querySelector(".product-card__prcvalue").textContent.trim());
				item = { id: productId, name, price, quantity: 1 };
				cart.push(item);
			}
			localStorage.setItem("cart", JSON.stringify(cart));
			card.querySelector(".product-card__quantity-value").textContent = item.quantity;
			document.getElementById("productModalQuantityValue").textContent = item.quantity;
			updateHeaderCartCount();
			updateProductQuantityUI(productId, item.quantity);
		});
		newMinusBtn.addEventListener("click", function (e) {
			e.stopPropagation();
			let cart = JSON.parse(localStorage.getItem("cart")) || [];
			let item = cart.find((i) => i.id === productId);
			if (item && item.quantity > 0) {
				item.quantity--;
				if (item.quantity <= 0) {
					cart = cart.filter((i) => i.id !== productId);
				}
				localStorage.setItem("cart", JSON.stringify(cart));
				card.querySelector(".product-card__quantity-value").textContent =
					item.quantity > 0 ? item.quantity : 0;
				document.getElementById("productModalQuantityValue").textContent =
					item.quantity > 0 ? item.quantity : 0;
				updateHeaderCartCount();
				updateProductQuantityUI(productId, item.quantity > 0 ? item.quantity : 0);
			}
		});
	});

	// Hide all quantity blocks by default
	window.addEventListener("DOMContentLoaded", () => {
		document.querySelectorAll(".product-card__quantity").forEach((q) => (q.style.display = "none"));
		initCartUI();
	});
	// --- CART LOGIC END ---

	// === UNIVERSAL MODAL LOGIC ===
	function openModal(modal) {
		if (!modal) return;
		modal.classList.add("active");
		lockBodyScroll();
	}
	function closeModal(modal) {
		if (!modal) return;
		modal.classList.remove("active");
		unlockBodyScroll();
	}
	function bindModalEvents(
		modal,
		closeBtnSelector = ".modal__close",
		overlaySelector = ".modal__overlay"
	) {
		if (!modal) return;
		const closeBtn = modal.querySelector(closeBtnSelector);
		const overlay = modal.querySelector(overlaySelector);
		if (closeBtn) {
			closeBtn.addEventListener("click", () => closeModal(modal));
		}
		if (overlay) {
			overlay.addEventListener("click", () => closeModal(modal));
		}
	}

	// --- SIDEBAR CART LOGIC ---
	const cartSidebar = document.getElementById("cartSidebar");
	const cartSidebarOverlay = document.getElementById("cartSidebarOverlay");
	const cartSidebarClose = document.getElementById("cartSidebarClose");
	const cartSidebarList = document.getElementById("cartSidebarList");
	const cartSidebarTotal = document.getElementById("cartSidebarTotal");
	const cartSidebarClear = document.getElementById("cartSidebarClear");

	// === SCROLLBAR FIX ===
	function getScrollbarWidth() {
		var div = document.createElement("div");
		div.style.overflowY = "scroll";
		div.style.width = "50px";
		div.style.height = "50px";
		div.style.visibility = "hidden";
		document.body.appendChild(div);
		var scrollWidth = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);
		return scrollWidth;
	}

	function lockBodyScroll() {
		document.body.style.overflow = "hidden";
		const scrollBarWidth = getScrollbarWidth();
		console.log(scrollBarWidth);
		if (scrollBarWidth > 0) {
			document.body.style.paddingRight = scrollBarWidth + "px";
			document.querySelector(".header").style.paddingRight = scrollBarWidth + "px";
		}
	}
	function unlockBodyScroll() {
		document.body.style.overflow = "";
		document.body.style.paddingRight = "";
		document.querySelector(".header").style.paddingRight = "";
	}

	function openCartSidebar() {
		openModal(cartSidebar);
		renderCartSidebar();
	}
	function closeCartSidebar() {
		closeModal(cartSidebar);
	}

	// Open cart sidebar by clicking on the cart button in the header
	const headerCartBtn = document.querySelector(".header__cart");
	if (headerCartBtn) {
		headerCartBtn.addEventListener("click", openCartSidebar);
	}
	// Open cart sidebar by clicking on the Buy now button on the product cards
	function addBuyBtnListeners() {
		document.querySelectorAll(".product-card__buy-btn").forEach((btn) => {
			btn.addEventListener("click", openCartSidebar);
		});
	}
	addBuyBtnListeners();

	// Close cart sidebar by clicking on the overlay and the close button
	cartSidebarOverlay.addEventListener("click", closeCartSidebar);
	cartSidebarClose.addEventListener("click", closeCartSidebar);

	// Render products in the sidebar
	function renderCartSidebar() {
		const cart = getCart();
		const checkoutBtn = document.getElementById("cartSidebarCheckout");
		const clearBtn = document.getElementById("cartSidebarClear");
		cartSidebarList.innerHTML = "";
		let total = 0;

		if (cart.length === 0) {
			checkoutBtn.disabled = true;
			clearBtn.disabled = true;
			cartSidebarList.innerHTML = '<div style="text-align:center;color:#888;">Cart is empty</div>';
			cartSidebarTotal.textContent = "$0";
			return;
		} else {
			checkoutBtn.disabled = false;
			clearBtn.disabled = false;
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
						<button class="cart-sidebar__item-quantity-btn" data-action="minus" data-id="${item.id}"${
				item.quantity <= 1 ? " disabled" : ""
			}>-</button>
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

	// Manage quantity and remove product in sidebar
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

	// Clear cart
	cartSidebarClear.addEventListener("click", function () {
		setCart([]);
		initCartUI();
		renderCartSidebar();
	});

	// Render sidebar when cart changes (for example, if the quantity is changed on the product card)
	window.addEventListener("storage", function (e) {
		if (e.key === CART_KEY) {
			renderCartSidebar();
		}
	});

	// Render sidebar when page is loaded, if it is open
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

		// Show form
		modalForm.style.display = "";

		openModal(modal);
	}

	cartSidebarCheckout.addEventListener("click", function () {
		if (getCart().length === 0) return;
		closeCartSidebar();
		setTimeout(openModalWithCart, 300); // smooth close sidebar
	});

	bindModalEvents(modal);

	modalForm.addEventListener("submit", async function (e) {
		e.preventDefault();

		// Form loading state
		const submitBtn = modalForm.querySelector("button[type='submit']");
		const submitButtonText = submitBtn.textContent;
		submitBtn.disabled = true;
		submitBtn.textContent = "Sending...";

		await new Promise((resolve) => setTimeout(resolve, 1000));

		submitBtn.disabled = false;
		submitBtn.textContent = submitButtonText;

		// Hide form
		modalForm.style.display = "none";

		// Show success message
		modalDetails.innerHTML =
			'<div id="modalOrderStatus" style="color:var(--color-success,green);text-align:center;font-weight:600;padding:20px;">Your order has been sent successfully!</div>';

		setCart([]);
		initCartUI();

		setTimeout(() => {
			closeModal(modal);
			// Return form to the initial state after a short delay
			setTimeout(() => {
				document.getElementById("modalOrderStatus").remove();
				modalForm.reset();
				modalForm.style.display = "";
			}, 300);
		}, 2000);
	});

	// --- SIDEBAR CART LOGIC END ---

	// === CONTACT FORM LOGIC ===
	const contactForm = document.getElementById("contactForm");
	const contactSuccessModal = document.getElementById("contactSuccessModal");
	const contactSuccessModalClose = document.getElementById("contactSuccessModalClose");
	if (contactForm) {
		contactForm.addEventListener("submit", async function (e) {
			e.preventDefault();
			const submitBtn = contactForm.querySelector("button[type='submit']");
			const submitButtonText = submitBtn.textContent;
			submitBtn.disabled = true;
			submitBtn.textContent = "Sending...";
			await new Promise((resolve) => setTimeout(resolve, 1000));
			submitBtn.disabled = false;
			submitBtn.textContent = submitButtonText;
			contactForm.reset();
			openModal(contactSuccessModal);
			setTimeout(() => {
				closeModal(contactSuccessModal);
			}, 2000);
		});
	}
	bindModalEvents(contactSuccessModal);

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

	// --- Открытие модального окна ---
	document.querySelectorAll(".product-card__title, .product-card__image").forEach((el) => {
		el.addEventListener("click", function () {
			const card = el.closest(".product-card");
			const productId = card
				.querySelector(".product-card__add-to-cart")
				.getAttribute("data-product");
			const title = card.querySelector(".product-card__title").textContent.trim();
			const hashrateMatch = title.match(/([0-9]+\s?T[Hh])/);
			const hashrate = hashrateMatch ? hashrateMatch[1] : "";
			const efficiency = card
				.querySelector(".product-card__info-item:nth-child(3) span")
				.textContent.trim();
			const power = card
				.querySelector(".product-card__info-item:nth-child(2) span")
				.textContent.trim();
			const price = card.querySelector(".product-card__prcvalue").textContent.trim();
			const image = card.querySelector("img").getAttribute("src");
			// Количество из корзины
			const cart = JSON.parse(localStorage.getItem("cart")) || [];
			const cartItem = cart.find((i) => i.id === productId);
			const quantity = cartItem ? cartItem.quantity : 0;

			document.getElementById(
				"productModalImage"
			).innerHTML = `<img src="${image}" alt="${title}">`;
			document.getElementById("productModalTitle").textContent = title;
			document.getElementById(
				"productModalHashrate"
			).innerHTML = `<span class="product-modal__label">Hashrate: </span>${hashrate}`;
			document.getElementById(
				"productModalEfficiency"
			).innerHTML = `<span class="product-modal__label">Power efficiency: </span> <span class="product-modal__accent">${efficiency}</span>`;
			document.getElementById(
				"productModalPriceHashrate"
			).innerHTML = `<span class="product-modal__label">Price/T: </span><span class="product-modal__price-unit">$</span><span class="product-modal__accent">${(
				price / parseFloat(hashrate)
			).toFixed(1)}</span>`;
			document.getElementById(
				"productModalPower"
			).innerHTML = `<span class="product-modal__label">Power: </span>${power}`;
			document.getElementById(
				"productModalPrice"
			).innerHTML = `<span class="product-modal__label">Price: </span><span class="product-modal__price-container"><span class="product-modal__price-unit">$</span><span class="product-modal__price-value">${price}</span></span>`;
			document.getElementById("productModalQuantityValue").textContent = quantity;
			document.getElementById("productModal").setAttribute("data-product-id", productId);
			document.getElementById("productModal").classList.add("active");
			updateModalBuyNowBtnState(quantity);
		});
	});

	document.getElementById("productModalClose").onclick = function () {
		document.getElementById("productModal").classList.remove("active");
	};
	document.querySelector(".product-modal__overlay").onclick = function () {
		document.getElementById("productModal").classList.remove("active");
	};

	// --- Quantity в модалке ---
	document.querySelector(".product-modal__quantity-btn--plus").onclick = function () {
		const modal = document.getElementById("productModal");
		const productId = modal.getAttribute("data-product-id");
		let cart = JSON.parse(localStorage.getItem("cart")) || [];
		let item = cart.find((i) => i.id === productId);
		if (item) {
			item.quantity++;
		} else {
			// Получаем данные из карточки
			const card = document
				.querySelector(`.product-card__add-to-cart[data-product="${productId}"]`)
				.closest(".product-card");
			const name = card.querySelector(".product-card__title").textContent.trim();
			const price = parseFloat(card.querySelector(".product-card__prcvalue").textContent.trim());
			item = { id: productId, name, price, quantity: 1 };
			cart.push(item);
		}
		localStorage.setItem("cart", JSON.stringify(cart));
		document.getElementById("productModalQuantityValue").textContent = item.quantity;
		updateProductQuantityUI(productId, item.quantity);
		updateHeaderCartCount();
		updateModalBuyNowBtnState(item.quantity);
	};
	document.querySelector(".product-modal__quantity-btn--minus").onclick = function () {
		const modal = document.getElementById("productModal");
		const productId = modal.getAttribute("data-product-id");
		let cart = JSON.parse(localStorage.getItem("cart")) || [];
		let item = cart.find((i) => i.id === productId);
		if (item && item.quantity > 0) {
			item.quantity--;
			if (item.quantity <= 0) {
				cart = cart.filter((i) => i.id !== productId);
			}
			localStorage.setItem("cart", JSON.stringify(cart));
			document.getElementById("productModalQuantityValue").textContent =
				item.quantity > 0 ? item.quantity : 0;
			updateProductQuantityUI(productId, item.quantity > 0 ? item.quantity : 0);
			updateHeaderCartCount();
			updateModalBuyNowBtnState(item.quantity > 0 ? item.quantity : 0);
		}
	};

	// --- Открытие корзины из модального окна ---
	const modalBuyNowBtn = document.querySelector(".product-modal__buy-now");
	if (modalBuyNowBtn) {
		modalBuyNowBtn.onclick = function () {
			document.getElementById("productModal").classList.remove("active");
			const cartSidebar = document.getElementById("cartSidebar");
			if (cartSidebar) {
				cartSidebar.classList.add("active");
				if (typeof lockBodyScroll === "function") lockBodyScroll();
				if (typeof renderCartSidebar === "function") renderCartSidebar();
			}
		};
	}

	// Функция для обновления disabled у кнопки Go to Cart в модалке
	function updateModalBuyNowBtnState(quantity) {
		const modalBuyNowBtn = document.querySelector(".product-modal__buy-now");
		if (modalBuyNowBtn) {
			modalBuyNowBtn.disabled = quantity === 0;
		}
	}
})();

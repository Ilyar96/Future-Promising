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

	// Hide all quantity blocks by default
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
		cartSidebar.classList.add("active");
		lockBodyScroll();
		renderCartSidebar();
	}
	function closeCartSidebar() {
		cartSidebar.classList.remove("active");
		unlockBodyScroll();
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

		modal.classList.add("active");
		lockBodyScroll();
	}

	cartSidebarCheckout.addEventListener("click", function () {
		if (getCart().length === 0) return;
		closeCartSidebar();
		setTimeout(openModalWithCart, 300); // smooth close sidebar
	});

	modalClose.addEventListener("click", function () {
		modal.classList.remove("active");
		unlockBodyScroll();
	});

	document.querySelector(".modal__overlay").addEventListener("click", function () {
		modal.classList.remove("active");
		unlockBodyScroll();
	});

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
			'<div id="modalOrderStatus" style="color:green;text-align:center;font-weight:600;padding:20px;">Your order has been sent successfully!</div>';

		setCart([]);
		initCartUI();

		setTimeout(() => {
			modal.classList.remove("active");
			unlockBodyScroll();
			// Return form to the initial state after a short delay
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
})();

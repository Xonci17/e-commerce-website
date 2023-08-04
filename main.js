document.addEventListener("DOMContentLoaded", function () {
  const disclosure = document.getElementById("disclosure");
  const hiddenInfo = document.getElementById("hidden-info");
  const productList = document.getElementById("product-list");
  const paginationContainer = document.querySelector(".pagination");

  // Store the cart items in an array
  let cart = [];

  // Get references to the cart drawer and cart items container
  const cartDrawer = document.getElementById("cart-drawer");
  const cartItemsContainer = document.querySelector(".cart-items");

  function addToCart(product) {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    displayCartItems();
    updateCartTotal();
    saveCartToLocalStorage();
  }

  function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function loadCartFromLocalStorage() {
    const cartData = localStorage.getItem("cart");
    cart = cartData ? JSON.parse(cartData) : [];
  }

  // Call this function at the beginning to load the cart from local storage
  loadCartFromLocalStorage();

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    displayCartItems();
    updateCartTotal();
    saveCartToLocalStorage();
  }

  // Function to update the cart display
  function displayCartItems() {
    cartItemsContainer.innerHTML = "";
    cart.forEach((item) => {
      const cartItem = createCartItemElement(item);
      cartItemsContainer.appendChild(cartItem);
    });
  }

  function createCartItemElement(item) {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item", "flex", "items-center", "py-4");
    const productImage = document.createElement("img");
    productImage.src = item.image;
    productImage.alt = item.title;
    productImage.classList.add(
      "cart-item-img",
      "h-16",
      "w-16",
      "object-cover",
      "mr-4",
      "border-2",
      "rounded",
      "border-white"
    );
    cartItem.appendChild(productImage);

    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add(
      "flex",
      "flex-grow",
      "items-center",
      "justify-between",
      "w-full"
    );

    const productDetails = document.createElement("div");
    productDetails.classList.add("flex", "flex-col");

    const productName = document.createElement("h4");
    productName.textContent = item.title;
    productName.classList.add("text-sm", "font-semibold", "cart-total");
    productDetails.appendChild(productName);

    const productPrice = document.createElement("p");
    productPrice.textContent = `$${item.price.toFixed(2)}`;
    productPrice.classList.add("cart-total", "text-sm", "mt-2");
    productDetails.appendChild(productPrice);

    const quantityContainer = document.createElement("div");
    quantityContainer.classList.add("flex", "items-center", "mt-2");

    const decreaseBtn = document.createElement("button");
    decreaseBtn.innerHTML =
      '<i class="fas fa-minus" style="color: #fcf7e6;"></i>';
    decreaseBtn.classList.add(
      "cart-item-decrease-btn",
      "focus:outline-none",
      "text-sm"
    );
    decreaseBtn.addEventListener("click", () => decreaseQuantity(item.id));
    quantityContainer.appendChild(decreaseBtn);

    const quantityDisplay = document.createElement("p");
    quantityDisplay.textContent = item.quantity;
    quantityDisplay.classList.add(
      "cart-item-quantity",
      "mx-2",
      "cart-total",
      "text-sm"
    );
    quantityContainer.appendChild(quantityDisplay);

    const increaseBtn = document.createElement("button");
    increaseBtn.innerHTML =
      '<i class="fas fa-plus" style="color: #fcf7e6;"></i>';
    increaseBtn.classList.add(
      "cart-item-increase-btn",
      "focus:outline-none",
      "text-sm"
    );
    increaseBtn.addEventListener("click", () => increaseQuantity(item.id));
    quantityContainer.appendChild(increaseBtn);

    productDetails.appendChild(quantityContainer);
    detailsContainer.appendChild(productDetails);

    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = '<img  src="./assets/trash.svg" alt="Delete"></img>';
    removeBtn.classList.add("cart-item-remove-btn", "focus:outline-none");
    removeBtn.dataset.productId = item.id;
    removeBtn.addEventListener("click", () => removeFromCart(item.id));
    detailsContainer.appendChild(removeBtn);

    cartItem.appendChild(detailsContainer);

    return cartItem;
  }

  function increaseQuantity(productId) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      item.quantity++;
      displayCartItems();
      updateCartTotal();
      saveCartToLocalStorage();
    }
  }

  function decreaseQuantity(productId) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      item.quantity--;
      if (item.quantity <= 0) {
        removeFromCart(productId);
      } else {
        displayCartItems();
        updateCartTotal();
        saveCartToLocalStorage();
      }
    }
  }

  function updateCartTotal() {
    const cartTotalDOM = document.getElementById("total-price");
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cartTotalDOM.textContent = `$${total.toFixed(2)}`;
  }

  // Function to open the cart drawer
  function openCartDrawer() {
    cartDrawer.classList.add("open");
    cartDrawer.classList.remove("hidden");
    displayCartItems();
    updateCartTotal();
  }

  // Function to close the cart drawer
  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartDrawer.classList.add("hidden");
  }

  // Attach event listener to the cart icon button
  const cartIconBtn = document.getElementById("cart-icon");
  cartIconBtn.addEventListener("click", openCartDrawer);

  // Attach event listener to the close button in the cart drawer
  const closeCartDrawerBtn = document.getElementById("close-cart-drawer");
  closeCartDrawerBtn.addEventListener("click", closeCartDrawer);

  // Handle disclosure click event
  disclosure.addEventListener("click", function () {
    hiddenInfo.classList.toggle("hidden");
    disclosure.classList.toggle("disclosure-open");
  });

  // Fetch products from the API and display them
  const limit = 24;
  const apiUrl = `https://voodoo-sandbox.myshopify.com/products.json?limit=${limit}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      // Render product cards and append them to the productList container
      data.products.forEach((product) => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
      });

      // Add pagination
      const totalProducts = 461;
      const totalPages = Math.ceil(totalProducts / limit);
      let currentPage = 1;

      paginationContainer.innerHTML = createPagination(currentPage, totalPages);
    })
    .catch((error) => console.error("Error fetching products:", error));

  function createProductCard(product) {
    const defaultVariant = product.variants[0];
    const productCard = document.createElement("div");
    productCard.classList.add(
      "bg-page-color",
      "flex",
      "flex-col",
      "justify-between"
    );

    productCard.insertAdjacentHTML(
      "beforeend",
      `
    <img src="${product.images[0]?.src || ""}" alt="${
        product.title
      }" class="h-72 w-full object-cover border-black border" />
    <h2 class="text-xl font-semibold mt-2">${product.title}</h2>
    ${
      product.body_html
        ? ""
        : `<p class="text-gray-600">${product.body_html || ""}</p>`
    }
    <span class="text-lg font-semibold mt-4">$${defaultVariant.price}</span>
    <button class="mt-2 mb-0 mx-auto container px-4 py-2 bg-black text-white rounded hover:bg-gray-700 hover:shadow-lg transition-all add-to-cart-btn"
      data-title="${product.title}"
      data-price="${defaultVariant.price}"
      data-image="${product.images[0]?.src || ""}"
    >ADD TO CART</button>
  `
    );

    return productCard;
  }

  function createPagination(currentPage, totalPages) {
    let paginationHTML = '<ul class="pagination">';
    const maxVisiblePages = 5;
    const ellipsisHTML = '<li class="pagination-item">...</li>';

    // Helper function to add a page link to the pagination
    function addPageLink(page, label) {
      paginationHTML += `<li class="hover:bg-gray-200 hover:shadow-lg transition-all pagination-item ${
        currentPage === page ? "current-page" : ""
      }" onclick="goToPage(${page})">${label}</li>`;
    }

    // Add first page link
    addPageLink(1, "1");

    if (totalPages <= maxVisiblePages + 2) {
      for (let page = 2; page <= totalPages - 1; page++) {
        addPageLink(page, page);
      }
    } else {
      // Determine the range of visible pages based on current page
      let startPage, endPage;

      if (currentPage <= 4) {
        startPage = 2;
        endPage = startPage + maxVisiblePages - 2;
      } else if (currentPage >= totalPages - 2) {
        endPage = totalPages - 1;
        startPage = endPage - maxVisiblePages + 2;
        if (startPage > 2) {
          paginationHTML += ellipsisHTML;
        }
      } else {
        startPage = currentPage - Math.floor(maxVisiblePages / 2);
        endPage = currentPage + Math.floor(maxVisiblePages / 2);
        paginationHTML += ellipsisHTML;
      }

      // Add visible page links
      for (let page = startPage; page <= endPage; page++) {
        addPageLink(page, page);
      }
    }

    // Add last page link
    if (totalPages > 1 && currentPage < totalPages - 2) {
      paginationHTML += ellipsisHTML;
      addPageLink(totalPages, totalPages);
    } else if (totalPages > 1) {
      addPageLink(totalPages, totalPages);
    }

    paginationHTML += "</ul>";
    return paginationHTML;
  }

  // Function to handle page change
  function goToPage(page) {
    const limit = 24; // Limit of products per page
    const apiUrl = `https://voodoo-sandbox.myshopify.com/products.json?limit=${limit}&page=${page}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const totalProducts = 461;
        const totalPages = Math.ceil(totalProducts / limit);

        // Check if the requested page is within the valid range of existing product pages
        if (page >= 1 && page <= totalPages) {
          const productList = document.getElementById("product-list");
          productList.innerHTML = "";
          data.products.forEach((product) => {
            const productCard = createProductCard(product);
            productList.appendChild(productCard);
          });

          const paginationContainer = document.querySelector(".pagination");
          paginationContainer.innerHTML = createPagination(page, totalPages);

          // Reattach event listeners to pagination buttons
          const paginationItems =
            paginationContainer.querySelectorAll(".pagination-item");
          paginationItems.forEach((item) => {
            item.addEventListener("click", function () {
              const newPage = parseInt(item.textContent);
              if (!isNaN(newPage)) {
                goToPage(newPage);
              }
            });
          });
        } else {
          console.error("Requested page is out of range.");
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  }

  function showPopUpMessage() {
    const popUpMessage = document.querySelector(".pop-up-message");
    popUpMessage.classList.remove("hidden");
    setTimeout(() => {
      popUpMessage.classList.add("hidden");
    }, 2000);
  }

  productList.addEventListener("click", function (event) {
    const clickedElement = event.target;
    if (clickedElement.classList.contains("add-to-cart-btn")) {
      const productTitle = clickedElement.dataset.title;
      const productPrice = parseFloat(clickedElement.dataset.price);
      const productImage = clickedElement.dataset.image;

      const product = {
        id: productTitle,
        title: productTitle,
        price: productPrice,
        image: productImage,
      };

      addToCart(product);
      showPopUpMessage();
    }
  });

  // Make the goToPage function global
  window.goToPage = goToPage;
});

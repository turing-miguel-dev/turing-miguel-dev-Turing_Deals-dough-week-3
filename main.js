document.addEventListener("DOMContentLoaded", function () {

  const CART_KEY = "dealsDoughHubCart";


  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      return [];
    }
  }


  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }


  function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(function (total, item) {
      return total + item.quantity;
    }, 0);

    document.querySelectorAll("[data-cart-count]").forEach(function (element) {
      element.textContent = count;
    });

  }

 


  let audioContext;

  function playClickSound() {

    try {

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      audioContext ||= new AudioContextClass();

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        660,
        audioContext.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        440,
        audioContext.currentTime + 0.07
      );

      gain.gain.setValueAtTime(
        0.10,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.09
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();

      oscillator.stop(audioContext.currentTime + 0.09);

    } catch (error) {
      console.log("Sound unavailable.");
    }

  }



  document.addEventListener("click", function (event) {

    if (
      event.target.closest(
        "button, .btn, .nav a, .text-link, .logo, .footer-logo"
      )
    ) {
      playClickSound();
    }

  });





  document.addEventListener("click", function (event) {

    const button = event.target.closest(".add-to-cart");

    if (!button) return;

    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    const cart = getCart();

    const existingItem = cart.find(function (item) {
      return item.id === id;
    });

    if (existingItem) {

      existingItem.quantity++;

    } else {

      cart.push({
        id: id,
        name: name,
        price: price,
        quantity: 1
      });

    }

    saveCart(cart);

    const originalText = button.textContent;

    button.textContent = "Added ✓";
    button.classList.add("added");

    setTimeout(function () {

      button.textContent = originalText;
      button.classList.remove("added");

    }, 850);

  });


  

  function money(value) {
    return "₱" + Number(value).toFixed(2);
  }






  function renderCart() {

    const container = document.getElementById("cart-items");

    if (!container) return;

    const cart = getCart();

    const totalElement = document.getElementById("cart-total");

    container.innerHTML = "";

    if (cart.length === 0) {

      container.innerHTML = `
        <div class="empty-cart">

          <h2>Your cart is empty.</h2>

          <p>Choose something delicious from our menu.</p>

          <a class="btn" href="orders.html">
            Browse Menu
          </a>

        </div>
      `;

      totalElement.textContent = money(0);

      return;

    }

    let total = 0;

    cart.forEach(function (item) {

      const lineTotal = item.price * item.quantity;

      total += lineTotal;

      const row = document.createElement("article");

      row.className = "cart-row";

      




      const details = document.createElement("div");

      const name = document.createElement("h3");

      name.textContent = item.name;

      const price = document.createElement("p");

      price.textContent = money(item.price) + " each";

      details.append(name, price);

     



      const controls = document.createElement("div");

      controls.className = "quantity-controls";

      const minus = document.createElement("button");

      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Decrease quantity");

      minus.addEventListener("click", function () {

        playClickSound();

        changeQuantity(item.id, -1);

      });

      const quantity = document.createElement("span");

      quantity.textContent = item.quantity;

      const plus = document.createElement("button");

      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Increase quantity");

      plus.addEventListener("click", function () {

        playClickSound();

        changeQuantity(item.id, 1);

      });

      controls.append(minus, quantity, plus);

    




      const line = document.createElement("strong");

      line.className = "line-total";

      line.textContent = money(lineTotal);







      const remove = document.createElement("button");

      remove.type = "button";

      remove.className = "remove-item";

      remove.textContent = "Remove";

      remove.addEventListener("click", function () {

        playClickSound();

        const updatedCart = getCart().filter(function (cartItem) {
          return cartItem.id !== item.id;
        });

        saveCart(updatedCart);

        renderCart();

      });

      row.append(details, controls, line, remove);

      container.append(row);

    });

    totalElement.textContent = money(total);

  }




  function changeQuantity(id, amount) {

    const cart = getCart();

    const item = cart.find(function (entry) {
      return entry.id === id;
    });

    if (!item) return;

    item.quantity += amount;

    const updatedCart = cart.filter(function (entry) {
      return entry.quantity > 0;
    });

    saveCart(updatedCart);

    renderCart();

  }


  const clearButton = document.getElementById("clear-cart");

  if (clearButton) {

    clearButton.addEventListener("click", function () {

      playClickSound();

      saveCart([]);

      renderCart();

    });

  }

 
  const checkoutForm = document.getElementById("checkout-form");

  if (checkoutForm) {

    checkoutForm.addEventListener("submit", function (event) {

      event.preventDefault();

      const cart = getCart();

      if (cart.length === 0) {

        alert("Your cart is empty. Please add menu items first.");

        return;

      }

      const form = new FormData(checkoutForm);

      const total = cart.reduce(function (sum, item) {

        return sum + item.price * item.quantity;

      }, 0);

      const itemLines = cart.map(function (item) {

        return `${item.name} x ${item.quantity} = ${money(
          item.price * item.quantity
        )}`;

      }).join("\n");

      const message = [

        "New Order - Deals Dough Hub Pizza House",

        "",

        itemLines,

        "",

        `TOTAL: ${money(total)}`,

        "",

        `Customer: ${form.get("customerName")}`,

        `Phone: ${form.get("phone")}`,

        `Address: ${form.get("address") || "Pickup"}`,

        `Method: ${form.get("method")}`,

        `Notes: ${form.get("notes") || "None"}`

      ].join("\n");

      const subject = encodeURIComponent(
        "Pizza Order - Deals Dough Hub"
      );

      const body = encodeURIComponent(message);

      window.location.href =
        `mailto:orders@dealsdoughhub.example?subject=${subject}&body=${body}`;

    });

  }

 



  const slider = document.getElementById("slider");

  if (slider) {

    const slides = Array.from(
      slider.querySelectorAll(".slide")
    );

    const dotsContainer = document.getElementById("dots");

    let current = 0;

    slides.forEach(function (slide, index) {

      const dot = document.createElement("button");

      dot.type = "button";

      dot.className = "dot";

      if (index === 0) {
        dot.classList.add("is-active");
      }

      dot.setAttribute("aria-label", "Show slide " + (index + 1));

      dot.addEventListener("click", function () {

        playClickSound();

        showSlide(index);

      });

      dotsContainer.append(dot);

    });

    const dots = Array.from(dotsContainer.children);

    function showSlide(index) {

      slides[current].classList.remove("is-active");

      dots[current].classList.remove("is-active");

      current = index;

      slides[current].classList.add("is-active");

      dots[current].classList.add("is-active");

    }

    if (slides.length > 1) {

      window.setInterval(function () {

        showSlide((current + 1) % slides.length);

      }, 3500);

    }

  }


  updateCartCount();

  renderCart();

});
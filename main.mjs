
// ---------------- IMPORTS -----------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

import product from "./products.mjs";

// ----------------- REGEX -----------------------------
const personalIdRegEx = new RegExp(/^(\d{10}|\d{12}|\d{6}-\d{4}|\d{8}-\d{4}|\d{8} \d{4}|\d{6} \d{4})/);
const creditCardNumberRegEx = new RegExp(/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/); // MasterCard
const phoneRegEx = /^\d{3}-\d{7,10}$/; // "555-0505000"
const zipCodeRegEx = /^\d{5}$/; // "12345"

// ---------------- HTML ELEMENTS -----------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

// ---------------- Product Variables -----------------

// - Header
const cartIconAmountContainer = document.querySelector('#cartIconAmountContainer');

// - Containers
const productsContainer = document.querySelector('#productsContainer');
const cartContainer = document.querySelector('#cartContainer');

// - Sort Buttons
const sortByNameBtn = document.querySelector('#sortByNameBtn');
const sortByPriceBtn = document.querySelector('#sortByPriceBtn');
const sortByRatingBtn = document.querySelector('#sortByRatingBtn');

// - Categories
const categoryFilterRadios = document.querySelectorAll('[name="categoryFilter"]');

// -  Price Range
const priceRangeSlider = document.querySelector('#priceRange');
const currentRangeValue = document.querySelector('#currentRangeValue');

// ---------------- Form Variables -----------------

// - Form
const purchaseForm = document.querySelector('#purchaseForm');

// - Inputs
const nameInput = document.querySelector('#nameInput');
const lastnameInput = document.querySelector('#lastnameInput');
const addressInput = document.querySelector('#addressInput');
const zipCodeInput = document.querySelector('#zipCodeInput');
const townInput = document.querySelector('#townInput');
const phoneInput = document.querySelector('#phoneInput');
const emailInput = document.querySelector('#emailInput');
const termsCheckbox = document.querySelector('#termsCheckbox');
const creditCardNumber = document.querySelector('#creditCardNumber');
const creditCardYear = document.querySelector('#creditCardYear');
const creditCardMonth = document.querySelector('#creditCardMonth');
const creditCardCvc = document.querySelector('#creditCardCvc');
const personalId = document.getElementById('personalID');

// - Inputs Payment ID's
// const inputs = [
//     document.querySelector('#creditCardNumber'),
//     document.querySelector('#creditCardYear'),
//     document.querySelector('#creditCardMonth'),
//     document.querySelector('#creditCardCvc'),
//     document.querySelector('#personalID'),
// ];

// - Payment Opitions
const paymentMethodRadios = Array.from(document.querySelectorAll('input[name="payment-option"]'));

const invoiceInput = document.querySelector('#invoiceInput');

const invoiceOption = document.querySelector('#invoice');
const cardOption = document.querySelector('#card');

// - Default Option
let selectedPaymentOption = 'card';

// - Reset Button
const resetAllBtn = document.querySelector('#resetAllBtn');
// - Order Button
const orderBtn = document.querySelector('#purchaseBtn');

// ---------------- VARIABLES ---------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

const today = new Date();
const isFriday = today.getDay() === 6; // true or false, is it Fredag
const isMonday = today.getDay() === 1; 
const currentHour = today.getHours();

let slownessTimeout = setTimeout(slowCustomerMessage, 1000 * 60 * 15); // Timer 15 min, if customer is to slow

// -------- PRODUCT FILTERING
let filteredProduct = product;
let filteredProductInPriceRange = product;

// ---------------- EVENT LISTENERS  --------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

// - Product Events
categoryFilterRadios.forEach(radio => {
    radio.addEventListener('input', updateCategoryFilter);
});

sortByNameBtn.addEventListener('click', sortByName);
sortByPriceBtn.addEventListener('click', sortByPrice);
sortByRatingBtn.addEventListener('click', sortByRating);

priceRangeSlider.addEventListener('input', changePriceRange);

// - Form Events
// Add event listeners to all fields
[
    nameInput,
    lastnameInput,
    addressInput,
    zipCodeInput,
    townInput,
    phoneInput,
    emailInput,
    termsCheckbox,
    creditCardNumber,
    creditCardYear,
    creditCardMonth,
    creditCardCvc, 
    personalId,
].forEach(input => {
    input.addEventListener('input', activateOrderButton);
});

paymentMethodRadios.forEach(radioBtn => {
    radioBtn.addEventListener('change', switchPaymentMethod);
});

// inputs.forEach(inputs => {
//     inputs.addEventListener('change', activateOrderButton);
//     inputs.addEventListener('focusout', activateOrderButton);
// });

// - Reset Button
resetAllBtn.addEventListener('click', resetAllProducts);

// ---------------- ALL FUNCTIONS -----------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------


// ---------------- MAKE NUMBER RATING INTO STARS
function getRatingHtml(rating) {
    // Separate integer and fractional parts
    const fullStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 !== 0; // Check if there's a decimal part

    let html = '';
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        html += `<span class="material-symbols-outlined star-icon">star</span>`;
    }
    // Add half star if applicable
    if (hasHalfStar) {
        html += `<span class="material-symbols-outlined star-icon">star_half</span>`;
    }
    return html;
}

// ---------------- PRINT AMOUNT ON CART ICON AND HIDE IF EMPTY
function printCartIconAmount() {
    cartIconAmountContainer.innerHTML = '';

    //  Local variabel
    let orderedProductAmount = 0;

    // Check every ordered product amount
    product.forEach(product => {
        orderedProductAmount += product.amount;
    });
    cartIconAmountContainer.innerHTML += `
    <span class="cart-amount">${orderedProductAmount}</span>
    `;

    // Make visible if nr is bigger than 0
    if (orderedProductAmount > 0) {
        cartIconAmountContainer.classList.remove('invisible');
    }
    // Make invisible if nr is 0
    if (orderedProductAmount <= 0) {
        cartIconAmountContainer.classList.add('invisible');
    }
}

// ---------------- FILTER PRICE RANGE w.SLIDER
function changePriceRange() {
    const currentPrice = priceRangeSlider.value;
    currentRangeValue.innerHTML = `${currentPrice} kr`;

    filteredProductInPriceRange = filteredProduct.filter((product) => product.price <= currentPrice);

    printProducts();
}

// ---------------- FILTRERA CATEGORIER
function updateCategoryFilter(e) {
    const selectedCategory = e.currentTarget.value;

    if (selectedCategory === 'All') {
        filteredProduct = product;
    } else {
        filteredProduct = product.filter(prod => prod.category === selectedCategory);
    }
    changePriceRange();
}

// ---------------- PRINT PRODUCTS IN HTML ----------------
// --------------------------------------------------------                         
function printProducts() {
    // CLEAR
    productsContainer.innerHTML = '';

    let priceIncrease = getPriceMultiplier();

    // PRINT HTML - For each product (loop) - print article with product in empty div
    filteredProductInPriceRange.forEach(product => {
        productsContainer.innerHTML += `
            <article class="product">
                <h3>${product.name}</h3>
                <img src="${product.img.url}" alt="${product.img.alt}">
                <div>Price: <span>${product.price * priceIncrease}<span> kr</div>
                <div>Kategori: <span>${product.category}<span></div>
                <div>Rating: ${getRatingHtml(product.rating)}</div>
                <span>Add:</span>
                <div class="amount-row">
                    <button class="decrease amount-btn" id="decrease-${product.id}"> - </button>
                    <div><span id="input-${product.id}">${product.amount}</span></div>
                    <button class="increase amount-btn" id="increase-${product.id}"> + </button>
                </div>
            </article>
        `;
    });

    // INCREASE/DECREASE BTN w. CLICK EVENT
    const increaseButtons = document.querySelectorAll('button.increase');
    increaseButtons.forEach(button => {
        button.addEventListener('click', increaseProductCount);
    });
    const decreaseButtons = document.querySelectorAll('button.decrease');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', decreaseProductCount);
    });

    printCartContainer(); // Print cart to update price and amount etc
}

// ---------------- PRINT & UPDATE CART & COUNT SUM / DISABLE INVOICE ------------
// -------------------------------------------------------------------------------
function printCartContainer() {
    cartContainer.innerHTML = ''; // CLEAR
    const today = new Date(); // Check for date every time we run function

    // Local Variables
    let sum = 0; // sum is when no products have been choosen
    let orderedProductAmount = 0; // Amount of products in the cart
    let msg = ''; // No message to start with
    let priceIncrease = getPriceMultiplier();

    // Cart
    product.forEach(product => {
        orderedProductAmount += product.amount;

        if (product.amount > 0) {
            let productPrice = product.price;
            if (product.amount >= 10) {
                productPrice *= 0.9;
                msg += `
                    <div class="cart-row">
                        <span class="cart-row-item">10 of the same</span>
                        <span class="cart-row-item span-last"> 10% Discount</span>
                    </div>
                `;
            }
            const adjustedProductPrice = productPrice * priceIncrease;
            sum += product.amount * adjustedProductPrice;

            cartContainer.innerHTML += `
                <div class="cart-row">
                    <span class="cart-row-item">${product.name}</span>
                    <span class="cart-row-item">${product.amount}</span>
                    <span class="cart-row-item">${product.amount * adjustedProductPrice} kr</span>
                </div>
            `;
        }
    });

    if (orderedProductAmount === 0) {
        cartContainer.innerHTML = `
            <div class="cart-row">
                <span class="cart-row-item span-full">Your cart is empty</span>
            </div>
        `;
        // Enable button when cart is empty
        document.querySelector('#invoiceInput').enabled = true;
        return;
    }

    // If sum is 0 Show no sum
    if (sum <= 0) {
        return;
    }

    // Discount on monday mornings before 10:00
    if (today.getDay() === 1 && today.getHours() < 10) { // Sunday is nr 0, so therefore monday is day 1!
        sum *= 0.9; // Give 10 % Discount
        msg += `
            <div class="cart-row">
                <span class="cart-row-item">Monday Discount</span>
                <span class="cart-row-item span-last">10% Discount on you purchase</span>
            </div>
        `;
    }

    // HTML CART

    cartContainer.innerHTML += `${msg}`;

    // SHIPPING - over 15 products is free, otherwise 25kr + 10%
    if (orderedProductAmount > 15) {
        cartContainer.innerHTML += `
            <div class="cart-row">
                <span class="cart-row-item">Shipping:</span>
                <span class="cart-row-item span-last">Free Shipping - 0 kr</span>
            </div>
        `;
    } else {
        cartContainer.innerHTML += `
            <div class="cart-row">
                <span class="cart-row-item">Shipping:</span>
                <span class="cart-row-item span-last"> ${Math.round(25 + (0.1 * sum))} kr</span>
            </div>
        `;
    }

    cartContainer.innerHTML += `
        <div class="cart-row">
            <span class="cart-row-item">Total:</span>
            <span class="cart-row-item span-last">${sum} kr</span>
        </div>
    `;

    // Diasble or aneable invoice Input based on sum
    if (invoiceInput) {
        invoiceInput.disabled = sum >= 800;
    }
}

// --- INCREASE / DECREASE PRODUCT AMOUNT & UPDATES CART ICON AMOUNT
function increaseProductCount(e) {
    const productId = Number(e.target.id.replace('increase-', ''));
    // ID of specific buton
    const clickedButtonId = e.target.id;

    // Find product in arrayen with the ID
    const foundProductIndex = product.findIndex(product => product.id === productId);
    // If the product doesnt exist, write an error in the consolen and exit function with "return"
    if (foundProductIndex === -1) {
        console.error('No product in the list! Check id!');
        return;
    }
    product[foundProductIndex].amount += 1; // Increase amount w. +1
    printProducts();
    printCartIconAmount();
    // Focus on button AFTER efter print
    document.querySelector(`#${clickedButtonId}`).focus();

}

function decreaseProductCount(e) {
    const productId = Number(e.target.id.replace('decrease-', ''));
    // ID of specific buton
    const clickedButtonId = e.target.id;

    // Find product in arrayen with the ID
    const foundProductIndex = product.findIndex(product => product.id === productId);
    // If the product doesnt exist, write an error in the consolen and exit function with "return"
    if (foundProductIndex === -1) {
        console.error('No product in the list! Check id!');
        return;
    }
    if (product[foundProductIndex].amount <= 0) { //  If the amount is 0, do nothing!
        product[foundProductIndex].amount = 0;
    } else {
        product[foundProductIndex].amount -= 1; // Decrease amount by -1
    }
    printProducts();
    printCartIconAmount();
    // Focus on button AFTER print!
    document.querySelector(`#${clickedButtonId}`).focus();
}

// --- SORT PRODUCTS
function sortByPrice() {
    filteredProductInPriceRange.sort((prod1, prod2) => prod1.price - prod2.price);
    printProducts();
}

function sortByRating() {
    filteredProductInPriceRange.sort((prod1, prod2) => prod2.rating - prod1.rating);
    printProducts();
}

function sortByName() {
    filteredProductInPriceRange.sort((prod1, prod2) => prod1.name.localeCompare(prod2.name));
    printProducts();
}

// ----- FORM FUNCTIONS -----
// --------------------------

// - PAYMENT OPTION FUNC  - Card/Invoice Hidden/Visible & Selected Payment
function switchPaymentMethod(e) {
    invoiceOption.classList.toggle('hidden');
    cardOption.classList.toggle('hidden');
    selectedPaymentOption = e.target.value;
}

// ----VALIDATION

function isFormValid() {
    // Check required text fields
    const isTextFieldsValid =
        nameInput.value.trim() &&
        lastnameInput.value.trim() &&
        addressInput.value.trim() &&
        zipCodeRegEx.test(zipCodeInput.value) &&
        townInput.value.trim();

    // Validate email and phone
    const isContactFieldsValid =
        phoneRegEx.test(phoneInput.value) &&
        emailInput.checkValidity(); // email validation

    // Validate terms checkbox
    const isTermsAccepted = termsCheckbox.checked;

    return isTextFieldsValid && isContactFieldsValid && isTermsAccepted;
}

function isPersonalIdNumberValid() {
    return personalIdRegEx.exec(personalId.value);
}

// ---- ACTIVATE ORDER BUTTON
function activateOrderButton() {
    orderBtn.setAttribute('disabled', '');

    if (selectedPaymentOption === 'invoice' && !isPersonalIdNumberValid()) {
        return;
    }

    if (selectedPaymentOption === 'card') {
        // Check card number
        if (creditCardNumberRegEx.exec(creditCardNumber.value) === null) {
            console.warn('Credit card number not valid.');
            return;
        }

        // Check card year
        let year = Number(creditCardYear.value);
        const today = new Date();
        const shortYear = Number(String(today.getFullYear()).substring(2));

        if (year > shortYear + 2 || year < shortYear) {
            console.warn('Card year not valid.');
            return;
        }
        // Check Card Month
        creditCardMonth.value = creditCardMonth.value.padStart(2, '0');
        if (creditCardMonth.value > 12 || creditCardMonth.value < 1 || !/^\d{1,2}$/.test(creditCardMonth.value)) {
            console.warn('Card month not valid.');
            return;
        }
        // Check card CVC
        if (creditCardCvc.value.length !== 3) {
            console.warn('CVC not valid.');
            return;
        }
        // Validated Form
        if (!isFormValid()) {
            console.warn('Form not valid')
            return;
        }
    }

    orderBtn.removeAttribute('disabled');
}

// --- Reset all Products and Form
function resetAllProducts() {
    console.log('Reset form and product amount')
    product.forEach(prod => prod.amount = 0);
    printProducts();
    printCartIconAmount();
}

// --- Message if To Slow
function slowCustomerMessage() {
    alert('You were too slow! Your order has been canceled.');
    product.forEach(prod => prod.amount = 0);
    printProducts();
}

// --- Price Multiplier (For special prices) 
function getPriceMultiplier() {
    if ((isFriday && currentHour >= 15) || (isMonday && currentHour <= 3)) {
        return 1.15;
    }
    return 1;
}

printCartIconAmount();

// -- PRINT PAGE
printProducts();
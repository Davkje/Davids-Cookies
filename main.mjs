
// ---------------- IMPORTS -----------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

import product from "./products.mjs";

// ----------------- REGEX -----------------------------
const personalIdRegEx = new RegExp(/^(\d{10}|\d{12}|\d{6}-\d{4}|\d{8}-\d{4}|\d{8} \d{4}|\d{6} \d{4})/);
const creditCardNumberRegEx = new RegExp(/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/); // MasterCard
const phoneRegEx = new RegExp(/^\d{3}-\d{7,10}$/); // "555-0505000"
// const zipCodeRegEx = new RegExp(/^\d{5}$/); // "12345"
const zipCodeRegEx = /^\d{5}$/; // Example: 5-digit zip code
const emailRegEx = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);

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

const form = document.querySelector('#purchaseForm');

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

// Input Errors
const nameError = document.querySelector('#nameError');
const lastnameError = document.querySelector('#lastnameError');
const addressError = document.querySelector('#addressError');
const zipCodeError = document.querySelector('#zipCodeError');
const townError = document.querySelector('#townError');
const phoneError = document.querySelector('#phoneError');
const termsError = document.querySelector('#termsError');
const emailError = document.querySelector('#emailError');

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

//- Confirmation Section Pop Up
const confirmationSection = document.querySelector('#confirmationSection');
//- Confirmation Section Close Button
const closeConfirmationBtn = document.querySelector('#closeConfirmationBtn');

// ---------------- VARIABLES ---------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

const today = new Date();
const isFriday = today.getDay() === 6; // true or false, is it Friday?
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
// Event listeners to all fields input, change or focus out
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
    input.addEventListener('change', activateOrderButton);
    input.addEventListener('focusout', activateOrderButton);
});

paymentMethodRadios.forEach(radioBtn => {
    radioBtn.addEventListener('change', switchPaymentMethod);
});

// - Reset Button
resetAllBtn.addEventListener('click', resetAllProducts);

orderBtn.addEventListener('click', makePurchase);

closeConfirmationBtn.addEventListener('click', closeConfirmation);


// Form Input Reminder Events

nameInput.addEventListener('input', () => isNameValid(nameInput.value));
lastnameInput.addEventListener('input', () => isLastnameValid(lastnameInput.value));
addressInput.addEventListener('input', () => isAddressValid(addressInput.value));
zipCodeInput.addEventListener('input', () => isZipCodeValid(zipCodeInput.value, zipCodeRegEx));
townInput.addEventListener('input', () => isTownValid(townInput.value));
phoneInput.addEventListener('input', () => isPhoneValid(phoneInput.value, phoneRegEx));
emailInput.addEventListener('input', () => isEmailValid(emailInput.value, emailRegEx));
termsCheckbox.addEventListener('input', () => areTermsAccepted(termsCheckbox));

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

function isNameValid(name) {
    if (name.trim() === '') {
        nameError.textContent = 'First name required';
        return false;
    }
    nameError.textContent = '';
    return true;
}

function isLastnameValid(lastname) {
    if (lastname.trim() === '') {
        lastnameError.textContent = 'Last name required';
        return false;
    }
    lastnameError.textContent = '';
    return true;
}

function isAddressValid(address) {
    if (address.trim() === '') {
        addressError.textContent = 'Address required';
        return false;
    }
    addressError.textContent = '';
    return true;
}

function isZipCodeValid(zipCode, zipCodeRegEx) {
    if (!zipCodeRegEx.test(zipCode)) {
        zipCodeError.textContent = 'Required Ex: 12345';
        return false;
    }
    zipCodeError.textContent = '';
    return true;
}

function isTownValid(town) {
    if (town.trim() === '') {
        townError.textContent = 'Town required';
        return false;
    }
    townError.textContent = '';
    return true;
}

function isPhoneValid(phone, phoneRegEx) {
    if (!phoneRegEx.test(phone)) {
        phoneError.textContent = 'Required Ex: 555-0505000';
        return false;
    }
    phoneError.textContent = '';
    return true;
}

function isEmailValid(email, emailRegEx) {
    if (!emailRegEx.test(email)) {
        emailError.textContent = 'Required Ex: mail@mail.com';
        return false;
    }
    emailError.textContent = ''; 
    return true;
}

function areTermsAccepted(termsCheckbox) {
    if (!termsCheckbox.checked) {
        termsError.textContent = 'Required';
        return false;
    }
    termsError.textContent = '';
    return true;
}

function isFormValid() {
    const nameValid = isNameValid(nameInput.value);
    const lastnameValid = isLastnameValid(lastnameInput.value);
    const emailValid = isEmailValid(emailInput.value, emailRegEx);
    const phoneValid = isPhoneValid(phoneInput.value, phoneRegEx);
    const addressValid = isAddressValid(addressInput.value);
    const zipCodeValid = isZipCodeValid(zipCodeInput.value, zipCodeRegEx);
    const townValid = isTownValid(townInput.value);
    const termsAccepted = areTermsAccepted(termsCheckbox);

    // Return overall form validity
    return nameValid && lastnameValid && emailValid && phoneValid && addressValid && zipCodeValid && townValid && termsAccepted;
}

function isPersonalIdNumberValid() {
    return personalIdRegEx.exec(personalId.value);
}

// ---- ACTIVATE ORDER BUTTON
function activateOrderButton() {
    orderBtn.setAttribute('disabled', 'true');

    // Validated Form
    if (!isFormValid()) {
        console.warn('Form not valid');
        return;
    }

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
    }

    orderBtn.removeAttribute('disabled');
}

// --- Reset all Products  and form
function resetAllProducts() {
    console.log('Reset product amount')
    product.forEach(prod => prod.amount = 0);
    form.reset();
    printProducts();
    printCartIconAmount();
}

// --- Purchase Confirmation and Reset
function makePurchase() {
    event.preventDefault();
    confirmationSection.classList.remove('hidden');
    form.reset();
    resetAllProducts();
}

function closeConfirmation() {
    confirmationSection.classList.add('hidden');
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
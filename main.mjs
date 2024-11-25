
// ---------------- IMPORTS -----------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

import product from "./products.mjs";

// ---------------- HTML ELEMENTS -----------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

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
const priceRangeSlider = document.querySelector('#priceRange')
const currentRangeValue = document.querySelector('#currentRangeValue')

// - Form

const carddInvoiceRadios = Array.from(document.querySelectorAll('input[name="payment-option"]'));
carddInvoiceRadios.forEach(radioBtn => {
    radioBtn.addEventListener('change', switchPaymentMethod);
});

const invoiceOption = document.querySelector('#invoice');
const cardOption = document.querySelector('#card');
let selectedPaymentOption = 'card'; 





const personalId = document.querySelector('#personalID');
personalId.addEventListener('change', activateOrderButton);


// REGEX
const personalIdRegEx = new RegExp(/^(\d{10}|\d{12}|\d{6}-\d{4}|\d{8}-\d{4}|\d{8} \d{4}|\d{6} \d{4})/);


function isPersonalIdNumberValid() {
    return personalIdRegEx.exec(personalId.value);
}

const orderBtn = document.querySelector('#purchaseBtn');


function activateOrderButton() {
    if (selectedPaymentOption === 'invoice' && isPersonalIdNumberValid()) {
        // console.log('aktivera');
        orderBtn.removeAttribute('disabled');
    } else if(selectedPaymentOption === 'invoice' && !isPersonalIdNumberValid()) {
        // console.log('inaktivera');
        orderBtn.setAttribute('disabled', '');
    }
}

// - Payment option  - Card or Invoice Hidden/Visible
function switchPaymentMethod(e) { 
    invoiceOption.classList.toggle('hidden');
    cardOption.classList.toggle('hidden');

    selectedPaymentOption = e.target.value;
    console.log(selectedPaymentOption);
}








// - Reset Button
const resetAllBtn = document.querySelector('#resetAllBtn');

// ---------------- VARIABLES ---------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

const today = new Date();
const isFriday = today.getDay() === 6; // true eller false, är det Fredag
const isMonday = today.getDay() === 1; // Måndag
const currentHour = today.getHours();

let slownessTimeout = setTimeout(slowCustomerMessage, 1000 * 60 * 15);

// -------- PRODUCT FILTERING
let filteredProduct = product;
let filteredProductInPriceRange = product; 


// ---------------- EVENT LISTENERS  --------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------


sortByNameBtn.addEventListener('click', sortByName);
sortByPriceBtn.addEventListener('click', sortByPrice);
sortByRatingBtn.addEventListener('click', sortByRating);

categoryFilterRadios.forEach(radio => {
    radio.addEventListener('input', updateCategoryFilter);
});

priceRangeSlider.addEventListener('input', changePriceRange);

resetAllBtn.addEventListener('click', resetAllProducts);

 
// ---------------- ALL FUNCTIONS -----------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------


// ---------------- FILTRERA PRICE RANGE w.SLIDER
function changePriceRange() {
    const currentPrice = priceRangeSlider.value;
    currentRangeValue.innerHTML = currentPrice;

    filteredProductInPriceRange = filteredProduct.filter((product) => product.price <=  currentPrice); 

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
     // console.log(selectedCategory);
    // console.log(product);
    // product.forEach( prod => {
    //     if (prod.category === selectedCategory) {
    //         console.log('its a match!')
    //     } else {
    //         console.log('No match!')
    //     }
    // })
}

// ---------------- PRINT PRODUCTS IN HTML ----------------
// --------------------------------------------------------                         
function printProducts() {
    // RENSA
    productsContainer.innerHTML = '';

    let priceIncrease = getPriceMultiplier();

    // PRINT HTML - För varje product - printa en articel med innehåll i den tomma div'en 
    filteredProductInPriceRange.forEach(product => {
        productsContainer.innerHTML += `
            <article class="product">
                <h3>${product.name}</h3>
                <img src="${product.img.url}" alt="${product.img.alt}">
                <div>Price: <span>${product.price * priceIncrease}<span> kr</div>
                <div>Kategori: <span>${product.category}<span></div>
                <div>Rating: <span>${product.rating}</span></div>
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

// ---------------- PRINT & UPDATE CART -------------------
// -------------------------------------------------------- 
function printCartContainer() {
    cartContainer.innerHTML = ''; // Rensa

    // Lokala Variabler
    let sum = 0; // summan är 0 o inga produkter valts
    let orderedProductAmount = 0; // Antal products i korgen!
    let msg = ''; // Vi har inget message från början
    let priceIncrease = getPriceMultiplier();

    // Cart
    product.forEach(product => {
        orderedProductAmount += product.amount;

        if (product.amount >0 ) {
            let productPrice = product.price;
            if(product.amount >= 10) {
                productPrice *= 0.9;
                msg += '<p>Mängdrabbatt: 10 %, 10 av samma!</p>'
            }
            const adjustedProductPrice = productPrice * priceIncrease;

            sum += product.amount * adjustedProductPrice;
            cartContainer.innerHTML += `
                <article>
                    <span>${product.name}</span> | <span>${product.amount}</span> | <span>${product.amount * adjustedProductPrice} kr</span>
                </article>
            `;
        }
    });

    // Om summan är 0 visas ingen summa
    if (sum <= 0) {
        return;
    }
    // Rabatt på Måndagar
    if (today.getDay() === 1 && today.getHours() < 10) { // Söndag är siffra 0, måndag blir därför siffra 1!
        sum *= 0.9; // ge 10 % rabatt
        msg += '<p>Måndagsrabatt: 10 % på hela beställningen</p>'
    }

    // HTML CART
    cartContainer.innerHTML += `<p>Total sum: ${sum} kr</p>`;
    cartContainer.innerHTML +=  `<div>${msg}</div>`;

    // SHIPPING - över 15 är gratis, annars 25kr + 10%
    if (orderedProductAmount > 15) {
        cartContainer.innerHTML += '<p>Shipping: 0 kr - Free Shipping</p>';
    } else {
        cartContainer.innerHTML += `<p>Shipping: ${Math.round(25 + (0.1 * sum))}kr</p>`;
    }
}

// --- INCREASE / DECREASE PRODUCT AMOUNT
function increaseProductCount(e) {
    const productId = Number(e.target.id.replace('increase-', ''));
    // id på knappen
    const clickedButtonId = e.target.id;

    // Leta rätt på produkten i arrayen som har det id:t
    const foundProductIndex = product.findIndex(product => product.id === productId);
    // Om produkten inte finns, skriv ut felmeddelande i consolen och avbryt att resten av koden körs med "return"
    if (foundProductIndex === -1) {
        console.error('Det finns ingen sådan produkt i produktlistan! Kolla att id:t är rätt.');
        return;
    }
    product[foundProductIndex].amount += 1; // öka dess amount med +1
    printProducts();
    // Focus på knappen efter print
    document.querySelector(`#${clickedButtonId}`).focus();
}

function decreaseProductCount(e) {
    const productId = Number(e.target.id.replace('decrease-', ''));
    // id på knappen
    const clickedButtonId = e.target.id;

    // Leta rätt på produkten i arrayen som har det id:t
    const foundProductIndex = product.findIndex(product => product.id === productId);
    // Om produkten inte finns, skriv ut felmeddelande i consolen och avbryt att resten av koden körs med "return"
    if (foundProductIndex === -1) {
        console.error('Det finns ingen sådan produkt i produktlistan! Kolla att id:t är rätt.');
        return;
    }
    if (product[foundProductIndex].amount <= 0) { //  Om siffran är 0, gör inget!
        product[foundProductIndex].amount = 0;
    } else {
        product[foundProductIndex].amount -= 1; // minska dess amount med -1
    }
    printProducts();
    // Focus på knappen efter print
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

// --- Message - To Slow
function slowCustomerMessage() {
    alert('You were too slow! Your order has been canceled.');
    product.forEach(prod => prod.amount = 0);
    printProducts();
}

// --- Reset all Products and Form
function resetAllProducts() {
    console.log('Reset form and product amount')
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

// -- PRINT PAGE
printProducts();



// ---------------- HTML ELEMENTS
// ----------------

const productsContainer = document.querySelector('#productsContainer');
const cartContainer = document.querySelector('#cartContainer');

// ---------------- VARIABLES
// ----------------

const today = new Date();
const isFriday = today.getDay() === 6; // true eller false, är det Fredag
const isMonday = today.getDay() === 1; // Måndag

const currentHour = today.getHours();

let slownessTimeout = setTimeout(slowCustomerMessage, 1000 * 60 * 15);

// ---------------- PRODUCT ARREY & OBJECTS
// ----------------

const product = [ 
    {
        id: 0,
        name: 'Chocolate Chip',
        price: 10,
        rating: 4,
        amount: 0,
        category: 'Sweet',
        img: {
            url: 'assets/images/cookie.jpg',
            width: 552,
            height: 552,
            alt: 'Chocolate chip cookie'
        },
    },
    {
        id: 1,
        name: 'Mint Chip',
        price: 15,
        rating: 2,
        amount: 0,
        category: 'Salty',
        img: {
            url: 'assets/images/cookie.jpg',
            width: 552,
            height: 552,
            alt: 'Chocolate chip cookie'
        },
    },
];

// ---------------- FUNCTIONS
// ----------------

function slowCustomerMessage() {
    alert('You were too slow! Your order has been canceled.');
}

function getPriceMultiplier() {
    if ((isFriday && currentHour >= 15) || (isMonday && currentHour <= 3)) {
        return 1.15;
    }
    return 1;
}

//---------------- PRINT PRODUCT IN HTML. Func

function printProducts() {
    // RENSA
    productsContainer.innerHTML = '';

    let priceIncrease = getPriceMultiplier();

    // PRINT HTML - För varje product - printa en articel med innehåll i den tomma div'en 
    product.forEach(product => {
        productsContainer.innerHTML += `
            <article class="product">
                <h3>${product.name}</h3>
                <img src="${product.img.url}" alt="${product.img.alt}">
                <div>Price: <span>${product.price * priceIncrease}<span> kr</div>
                <div>Kategori: <span>${product.category}<span></div>
                <div>Rating: <span>${product.rating}</span></div>
                <div>
                    <button class="decrease" id="decrease-${product.id}"> - </button>
                    <input type="number" min="0" value="${product.amount}" id="input-${product.id}">
                    <button class="increase" id="increase-${product.id}"> + </button>
                </div>
            </article>
        `;
    });

    // INCREASE BTN w. CLICK EVENT
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

// INCREASE PRODUCT AMOUNT

function increaseProductCount(e) {
    const productId = Number(e.target.id.replace('increase-', ''));
    // Leta rätt på produkten i arrayen som har det id:t
    const foundProductIndex = product.findIndex(product => product.id === productId);
    // Om produkten inte finns, skriv ut felmeddelande i consolen och avbryt att resten av koden körs med "return"
    if (foundProductIndex === -1) {
        console.error('Det finns ingen sådan produkt i produktlistan! Kolla att id:t är rätt.');
        return;
    }
    product[foundProductIndex].amount += 1; // öka dess amount med +1
    printProducts();
}

// DECREASE PRODUCT AMOUNT

function decreaseProductCount(e) {
    const productId = Number(e.target.id.replace('decrease-', ''));
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
}


// PRINT CART HTML & UPDATE

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
    if (today.getDay() === 1) { // Söndag är siffra 0, måndag blir därför siffra 1!
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

printProducts();

// På måndagar innan kl. 10 ges 10 % rabatt på hela beställningssumman. Detta visas i varukorgssammanställningen som en rad med texten "Måndagsrabatt: 10 % på hela beställningen".
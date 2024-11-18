//---------------- HTML ELEMENTS ------------

const productsContainer = document.querySelector('#productsContainer');

const cartContainer = document.querySelector('#cartContainer');

//---------------- PRODUCT ARREY AND OBJECTS ------------

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

//---------------- PRINT PRODUCT IN HTML ------------

function printProducts() {
    // RENSA
    productsContainer.innerHTML = '';

    // PRINT HTML - För varje product - printa en articel med innehåll i den tomma div'en 
    product.forEach(product => {
        productsContainer.innerHTML += `
            <article class="product">
                <h3>${product.name}</h3>
                <img src="${product.img.url}" alt="${product.img.alt}">
                <div>Price: <span>${product.price}<span> kr</div>
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
    cartContainer.innerHTML = '';

    let sum = 0;

    product.forEach(product => {
        if (product.amount >0 ) {
            sum += product.amount * product.price;
            cartContainer.innerHTML += `
                <article>
                    <span>${product.name}</span> | <span>${product.amount}</span> | <span>${product.amount * product.price} kr</span>
                </article>
            `;
        }
    });

    cartContainer.innerHTML += `<p>Total sum: ${sum} kr</p>`;
}


printProducts();
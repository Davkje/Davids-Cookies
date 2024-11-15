const products = [
    {
        id: 0,
        name: 'Product 1',
        price: 10,
        rating: 4,
        ammount: 0,
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
        name: 'Product 2',
        price: 15,
        rating: 2,
        ammount: 0,
        category: 'Salty',
        img: {
            url: 'assets/images/cookie.jpg',
            width: 552,
            height: 552,
            alt: 'Chocolate chip cookie'
        },
    },
];

//---------------- HTML ELEMENTS ------------

const productsListDiv = document.querySelector('#product-list');

//---------------- PRINT PRODUCT IN HTML ------------

function printProductList() {
    // Rensa först
    productsListDiv.innerHTML = '';

    products.forEach(product => {
        productsListDiv.innerHTML += `
        <article class="product">
        <h3>${product.name}<h3>
        <p>${product.price} kr</p>
        <p>Rating:${product.rating}</p>
        <img src="${product.img.url}" alt="${product.img.alt}">
        `;
    });
}

printProductList();
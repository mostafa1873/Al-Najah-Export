'use strict';

//  NAVBAR TOGGLE

const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const overlay = document.querySelector("[data-overlay]");
const elemArr = [navCloseBtn, overlay, navOpenBtn];

for (let i = 0; i < elemArr.length; i++) {
    elemArr[i].addEventListener("click", function () {
        navbar.classList.toggle("active");
        overlay.classList.toggle("active");
    });
}

const navbarLinks = document.querySelectorAll("[data-navbar-link]");
for (let i = 0; i < navbarLinks.length; i++) {
    navbarLinks[i].addEventListener("click", function () {
        navbar.classList.remove("active");
        overlay.classList.remove("active");
    });
}

//  HEADER ACTIVE ON SCROLL

const header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
    if (window.scrollY >= 400) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }
});

//  Dynamic Language Switcher

const langDropdown = document.querySelector('.language-dropdown');
const langButton = document.getElementById('lang-toggle-btn');
const langMenu = document.getElementById('lang-menu');
const langOptions = document.querySelectorAll('.lang-option');
const langLabel = document.getElementById('current-lang-label');

const mobileLangBtn = document.getElementById('mobile-lang-btn');
const mobileLangMenu = document.querySelector('.lang-menu-mobile');
const mobileLangLabel = document.getElementById('mobile-lang-label');

let currentLang = localStorage.getItem('lang') || 'en';
let currentTranslations = {};

function updateLangLabels() {
    if (langLabel) langLabel.textContent = currentLang.toUpperCase();
    if (mobileLangLabel) mobileLangLabel.textContent = currentLang.toUpperCase();

    langOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.lang === currentLang);
    });

    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = currentLang === 'ar'
        ? "'Cairo', sans-serif"
        : "'Poppins', sans-serif";
}

function getTranslation(key) {
    return currentTranslations[key] || key;
}

if (langButton) {
    langButton.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
    });
}

langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = e.target.dataset.lang;
        if (selectedLang !== currentLang) {
            currentLang = selectedLang;
            localStorage.setItem('lang', currentLang);
            updateLangLabels();
            loadLanguageFile(currentLang);
        }
        langDropdown.classList.remove('open');
    });
});

if (mobileLangBtn) {
    mobileLangBtn.addEventListener('click', () => {
        mobileLangBtn.classList.toggle('open');
        mobileLangMenu.classList.toggle('open');
    });

    mobileLangMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = e.target.dataset.lang;
            if (selectedLang !== currentLang) {
                currentLang = selectedLang;
                localStorage.setItem('lang', currentLang);
                updateLangLabels();
                loadLanguageFile(currentLang);
            }
            mobileLangBtn.classList.remove('open');
            mobileLangMenu.classList.remove('open');
        });
    });
}

document.addEventListener('click', (e) => {
    if (langDropdown && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
    }
});

// JSON FILE TRANSLATIONS PATH + AUTO REFRESH FOR PRODUCTS

function loadLanguageFile(lang) {
    const langPath = window.location.pathname.includes('/pages/')
        ? '../lang/'
        : './lang/';

    fetch(`${langPath}${lang}.json`)
        .then(res => res.json())
        .then(data => {
            currentTranslations = data;
            applyTranslations(data);
            updateLangLabels();

            if (document.querySelector('.listProduct') && allProducts.length > 0) {
                addDataToHTML(currentFilter);
            }

            if (document.querySelector('.detail') && allProducts.length > 0) {
                showDetail();
            }
        })
        .catch(err => console.error('Error loading language file:', err));
}

//  TRANSLATE USING data-lang

function applyTranslations(data) {
    for (const key in data) {
        const elements = document.querySelectorAll(`[data-lang="${key}"]`);
        elements.forEach(el => {
            el.textContent = data[key];
        });
    }
}

//  PRODUCTS DATA HANDLER 

let allProducts = [];
let currentFilter = "all";

const productPath = window.location.pathname.includes('/pages/')
    ? '../products.json'
    : './products.json';

async function loadProducts() {
    try {
        const response = await fetch(productPath);
        if (!response.ok) throw new Error(`❌ Products file not found (${response.status})`);

        const data = await response.json();
        allProducts = data.products || [];

        if (document.querySelector('.listProduct')) addDataToHTML(currentFilter);
        if (document.querySelector('.detail')) showDetail();

        setupFilterButtons();
    } catch (error) {
        console.error('🚨 Error loading products:', error);
    }
}

//  LIST ALL PRODUCTS + FILTER SUPPORT

function addDataToHTML(filter = "all") {
    const listProductHTML = document.querySelector('.listProduct');
    if (!listProductHTML || !allProducts.length) return;

    listProductHTML.innerHTML = '';

    const filteredProducts = filter === "all"
        ? allProducts
        : allProducts.filter(p => p.category === filter);

    filteredProducts.forEach(product => {
        const linkPrefix = window.location.pathname.includes('/pages/') ? '' : './pages/';
        const newProduct = document.createElement('a');
        newProduct.href = `${linkPrefix}productdetails.html?id=${product.id}`;
        newProduct.classList.add('item');

        newProduct.innerHTML = `
      <div class="img-container"> 
        <img src="${product.image}" alt="${product[`name_${currentLang}`]}">
      </div>
      <h2>${product[`name_${currentLang}`]}</h2>
      <button class="details-button">
        ${getTranslation("details_page_button_details")}
      </button>
    `;

        listProductHTML.appendChild(newProduct);
    });
}

//  FILTER BUTTONS

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            addDataToHTML(currentFilter);
        });
    });
}

//  PRODUCT DETAILS PAGE

function showDetail() {
    const detail = document.querySelector('.detail');
    if (!detail || !allProducts.length) return;

    const productId = new URLSearchParams(window.location.search).get('id');
    const thisProduct = allProducts.find(p => p.id == productId);
    if (!thisProduct) return;

    const mainImage = detail.querySelector('.image img');
    const nameElement = detail.querySelector('.name');
    const descElement = detail.querySelector('.description');

    if (mainImage) mainImage.src = thisProduct.image || '';
    if (nameElement) nameElement.textContent = thisProduct[`name_${currentLang}`] || '';
    if (descElement) descElement.textContent = thisProduct[`description_${currentLang}`] || '';

    const extraImagesContainer = detail.querySelector('.extra-images');
    if (extraImagesContainer) {
        extraImagesContainer.innerHTML = '';
        if (Array.isArray(thisProduct.images) && thisProduct.images.length) {
            thisProduct.images.forEach(img => {
                const smallImg = document.createElement('img');
                smallImg.src = img;
                smallImg.alt = `${thisProduct[`name_${currentLang}`]} extra image`;
                smallImg.classList.add('small-img');

                smallImg.addEventListener('click', () => {
                    const popup = document.createElement('div');
                    popup.classList.add('image-popup');
                    popup.innerHTML = `<img src="${img}" alt="">`;
                    document.body.appendChild(popup);

                    setTimeout(() => popup.classList.add('active'), 10);

                    popup.addEventListener('click', () => {
                        popup.classList.remove('active');
                        setTimeout(() => popup.remove(), 300);
                    });
                });

                extraImagesContainer.appendChild(smallImg);
            });
        }
    }

    const listProduct = document.querySelector('.listProduct');
    if (listProduct) {
        listProduct.innerHTML = '';
        const similarProducts = allProducts.filter(p => p.id != productId);
        similarProducts.forEach(product => {
            const newProduct = document.createElement('a');
            newProduct.href = `../pages/productdetails.html?id=${product.id}`;
            newProduct.classList.add('item');
            newProduct.innerHTML = `
        <img src="${product.image}" alt="">
        <h2>${product[`name_${currentLang}`]}</h2>
      `;
            listProduct.appendChild(newProduct);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateLangLabels();
    loadLanguageFile(currentLang);
    loadProducts();

    const orderButton = document.querySelector('.action-button');
    if (orderButton) {
        orderButton.addEventListener('click', () => {
            window.location.href = '../pages/contact.html';
        });
    }
});

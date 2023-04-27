let varId = new URLSearchParams(window.location.search).get('id');

searchProduct();


// récuperation du produit par son id
async function searchProduct() {
	await fetch('http://localhost:3000/api/products/' + varId)
		.then((res) => res.json())
		.then((data) => loadCard(data))
		.catch((error) => {
			console.log(error);
			window.alert('Connexion au serveur impossible !');
		});
}

// traitement des données récupérées
function loadCard(data) {
	if (data != null) {
		let parent = document.querySelector('.item__img');
		parent.innerHTML += `<img src="${data.imageUrl}" alt="${data.altTxt}">`;

		parent = document.querySelector('#title');
		parent.textContent = data.name;

		parent = document.querySelector('#price');
		parent.textContent = data.price;

		parent = document.querySelector('#description');
		parent.textContent = data.description;

		for (let i = 0; i < data.colors.length; i++) {
			createChoice(data.colors[i]);
		}
	}
}

// triggers
document.querySelector('#addToCart').addEventListener('click', addQuantityToCart);
document.querySelector('[name="itemQuantity"]').addEventListener('input', modifyQuantity);
document.querySelector('[name="itemQuantity"]').addEventListener('keyup', controlQuantity);

// fonction de création de la balise image <option>
function createChoice(varChoice) {
	const varOption = document.createElement('option');
	varOption.value = varChoice;
	varOption.textContent = varChoice;
	const parent = document.querySelector('#colors');
	parent.appendChild(varOption);
}

// controle de l'input quantité
function controlQuantity() {
	const quantity = document.querySelector('#quantity').value;
	if (quantity != null) {
		if (quantity < 0) document.querySelector('#quantity').value = 0;
		if (quantity > 100) document.querySelector('#quantity').value = 100;
	}
}

// ajoute un article
function addQuantityToCart() {
	// récupère la quantité et la couleur sélectionné
	const newQuantity = document.querySelector('#quantity').value;
	const currentColor = document.querySelector('#colors').value;

	if (newQuantity > 0 && newQuantity <= 100 && currentColor != '') {
		let arrayProduct = JSON.parse(localStorage.getItem('product'));

		let objJson = {
			id: varId,
			quantity: parseInt(newQuantity),
			color: currentColor,
		};

		if (arrayProduct == null) {
			arrayProduct = [];
			arrayProduct.push(objJson);
		} else {
			const productSearch = arrayProduct.find((product) => product.id == objJson.id && product.color == objJson.color);
			if (productSearch != undefined) {
				const valeurPresente = productSearch.quantity;
				const addValue = parseInt(valeurPresente) + parseInt(newQuantity);
				if (addValue > 100) {
					arrayProduct.quantity = 100;
					let max = 100 - valeurPresente;
					if (max > 0) {
						alert(`vous avez déjà ${valeurPresente} article(s) dans votre panier, 
                        la limite maximale de 100 sera dépassé ! 
                        ${max} articles sont ajouté au panier !`);
					} else {
						alert('Quantité maximale atteinte !');
					}
				} else {
					arrayProduct.quantity = addValue;
				}
				arrayProduct.forEach((product) => {
					if (product.id == objJson.id && product.color == objJson.color) {
						if (addValue <= 100) {
							product.quantity = parseInt(product.quantity) + parseInt(objJson.quantity);
						} else {
							product.quantity = 100;
						}
					}
				});
			} else {
				arrayProduct.push(objJson);
			}
		}
		localStorage.setItem('product', JSON.stringify(arrayProduct));
		window.location.href = 'index.html';
	} else {
		alert(`Vous n'avez pas renseigné tout les champs !`)
	}
}

// localstorage update
function modifyQuantity() {
	const currentColor = parseInt(document.querySelector('#colors').value);
	let arrayProduct = findIdColor(varId, currentColor);
	let currentQuantity = parseInt(document.querySelector('#quantity').value);
	if (currentQuantity != null && arrayProduct != undefined) {
		arrayProduct.quantity = currentQuantity;
		localStorage.setItem('product', JSON.stringify(arrayProduct));
	}
}

// fonction qui recherche un doublon
function findIdColor(id, color) {
	let item = {};
	for (let i = 0; i < localStorage.length; i++) {
		item = JSON.parse(localStorage.getItem('product', i));
		if (item.id == id && item.color == color) return item;
	}
	return undefined;
}

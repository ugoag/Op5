// déclare les variables globale
let cart = [];

// charge tout le localStorage dans le panier
loadCart();

// sélectionne le bouton "commander" et le met en écoute d'un click
const orderButton = document.querySelector('#order');
orderButton.addEventListener('click', (order) => submitForm(order));

// met en écoute certains champs du formulaire et modifie le contenu
const parent = document.getElementById('firstName');
parent.addEventListener('keyup', () => testValidityForm(parent));
const parent2 = document.getElementById('lastName');
parent2.addEventListener('keyup', () => testValidityForm(parent2));
const parent3 = document.getElementById('city');
parent3.addEventListener('keyup', () => testValidityForm(parent3));

// fonction qui récupère le contenu du localStorage, et affiche les articles
function loadCart() {
	const recoverLs = localStorage.getItem('product');
	const jsonLs = JSON.parse(recoverLs);
	if (jsonLs != null) {
		const quantityLs = jsonLs.length;
		for (let i = 0; i < quantityLs; i++) {
			searchProduct(jsonLs[i].id, jsonLs[i].color, jsonLs[i].quantity);
		}
	}
	initLoad();
}

// function qui récupère et renvois les données d'un article

async function searchProduct(id, color, quantity) {
	await fetch('http://localhost:3000/api/products/' + id)
		.then((res) => res.json())
		.then((data) => {
			let objet = data;
			Reflect.deleteProperty(objet, 'colors');
			Reflect.deleteProperty(objet, '_id');
			const objColor = {
				color: color,
				quantity: quantity,
				id: id,
			};
			const newObject = {
				...data,
				...objColor,
			};
			cart.push(newObject);
			displayItem(newObject);
		})
		.catch((error) => {
			window.alert('Connexion au serveur impossible !');
			console.log(error);
		});
}

// fonction qui lance l'affichage d'un article via plusieurs autres fonctions

function displayItem(item) {
	const article = createArticle(item);
	const imageDiv = createImageDiv(item);
	article.appendChild(imageDiv);

	const cardItem = createStructDescription(item);
	article.appendChild(cardItem);

	document.querySelector('#cart__items').appendChild(article);
	afficheTotalPrice();
	afficheTotalQuantity();

	initLoad();
}


// fonction qui créée l'élément article

function createArticle(item) {
	const article = document.createElement('article');
	article.classList.add('cart__item');
	article.dataset.id = item.id;
	article.dataset.color = item.color;
	return article;
}

// fonction qui créer la DIV image

function createImageDiv(item) {
	const div = document.createElement('div');
	div.classList.add('cart__item__img');

	const image = document.createElement('img');
	image.src = item.imageUrl;
	image.alt = item.altTxt;

	div.appendChild(image);
	return div;
}

// fonction qui fabrique la partie description de l'article

function createStructDescription(item) {
	const cardItem = document.createElement('div');
	cardItem.classList.add('cart__item__content');

	const description = createDescription(item);
	const settings = createDivSettings(item);

	cardItem.appendChild(description);
	cardItem.appendChild(settings);
	return cardItem;
}

// fonction qui créer la DIV qui contient la description de l'article et le prix

function createDescription(item) {
	const description = document.createElement('div');
	description.classList.add('cart__item__content__description');

	const h2 = document.createElement('h2');
	h2.textContent = item.name;

	const p = document.createElement('p');
	p.textContent = item.color;

	const p2 = document.createElement('p');
	p2.textContent = item.price + ' €';

	description.appendChild(h2);
	description.appendChild(p);
	description.appendChild(p2);
	return description;
}

// fonction qui met en écoute le lien de suppression et les modifications de quantités

function createDivSettings(item) {
	const elementDiv = document.createElement('div');
	elementDiv.classList.add('cart__item__content__settings');
	addDivQuantity(elementDiv, item);
	addDivDelete(elementDiv, item);
	return elementDiv;
}

// fonction qui récupère les quantités et les additionnes pour afficher le total

function afficheTotalQuantity() {
	const parent = document.querySelector('#totalQuantity');
	let total = 0;
	const LS = JSON.parse(localStorage.getItem('product'));
	if(LS.length === 0){
		parent.textContent = "";
	}else{
		for (let i = 0; i < LS.length; i++) {
			total += parseInt(LS[i].quantity);
			parent.textContent = parseInt(total);
		}
	}
}

// fonction qui récupère les quantités et prix et afficher le montant total du panier

function afficheTotalPrice() {
	const parent = document.querySelector('#totalPrice');
	let total = 0;
	const LS = JSON.parse(localStorage.getItem('product'));
	if(LS.length === 0){
		parent.textContent = "";
	}else{
		for (let i = 0; i < LS.length; i++) {
			fetch('http://localhost:3000/api/products/' + LS[i].id)
				.then((res) => res.json())
				.then((data) => {
					total += parseInt(data.price) * parseInt(LS[i].quantity);
					parent.textContent = parseInt(total);
				})
				.catch((error) => {
					window.alert('Connexion au serveur impossible !');
					console.log(error);
				});
		}
	}
}

// fonction qui créer le block de suppression et met le lien "supprimer" en écoute

function addDivDelete(settings, item) {
	const div = document.createElement('div');
	div.classList.add('cart__item__content__settings__delete');
	div.addEventListener('click', () => deleteItem(item));

	const p = document.createElement('p');
	p.classList.add('deleteItem');
	p.textContent = 'Supprimer';
	div.appendChild(p);

	settings.appendChild(div);
}

// fonction qui cherche l'article à supprimer du panier et mettre à jour l'affichage

function deleteItem(item) {
	let itemForDelete = cart.findIndex((product) => product.id === item.id && product.color === item.color);
	if (itemForDelete > -1) {
		// supprime l'élément du tableau
		cart.splice(itemForDelete, 1);

		let tempArray = [];
		for (let i = 0; i < cart.length; i++) {
			const tempObject = {
				id: cart[i].id,
				color: cart[i].color,
				quantity: cart[i].quantity,
			};
			tempArray.push(tempObject);
		}
		localStorage.clear();
		localStorage.setItem('product', JSON.stringify(tempArray));

		// supprime l'article de l'écran
		const parent = document.querySelector(`article[data-id="${item.id}"][data-color="${item.color}"]`);
		parent.remove();
		afficheTotalPrice();
		afficheTotalQuantity();
	}
}

// fonction qui créer la DIV comprenant le INPUT et met en écoute pour la modification de quantité

function addDivQuantity(settings, item) {
	const quantity = document.createElement('div');
	quantity.classList.add('cart__item__content__settings__quantity');

	const p = document.createElement('p');
	p.textContent = 'Qté : ';
	quantity.appendChild(p);

	const input = document.createElement('input');
	input.type = 'number';
	input.classList.add('itemQuantity');
	input.name = 'itemQuantity';
	input.min = '1';
	input.max = '100';
	input.value = parseInt(item.quantity);

	input.addEventListener('keyup', () => controlQuantity(item, input));
	input.addEventListener('input', () => listenQuantity(item, input));

	quantity.appendChild(input);
	settings.appendChild(quantity);
}

// function qui contrôle la quantité tapé directement

function controlQuantity(item, input) {
	inputValue = input.value;

	let newValue = parseInt(item.quantity);
	if (newValue < 1 || newValue === 'null' || isNaN(newValue) || newValue === '') newValue = 1;
	if (newValue > 100) newValue = 100;
	input.value = newValue;
	let itemLs = JSON.parse(localStorage.getItem('product'));
	for (let i = 0; i < itemLs.length; i++) {
		if (itemLs[i].id == item.id && itemLs[i].color == item.color) {
			if (newValue > 0 && newValue <= 100) {
				itemLs[i].quantity = newValue;
				localStorage.setItem('product', JSON.stringify(itemLs));
			} else {
				itemLs[i].quantity = 1;
				localStorage.setItem('product', JSON.stringify(itemLs));
			}
		}
	}
	afficheTotalPrice();
	afficheTotalQuantity();
}

// fonction qui met à jour la modification de quantité d'un article

function listenQuantity(item, input) {
	let newValue = parseInt(input.value);
	if (newValue > 100) input.value = 100;
	item.quantity = parseInt(newValue);
	let itemLs = JSON.parse(localStorage.getItem('product'));
	for (let i = 0; i < itemLs.length; i++) {
		if (itemLs[i].id == item.id && itemLs[i].color == item.color) {
			if (newValue > 0 && newValue <= 100) {
				itemLs[i].quantity = newValue;
				localStorage.setItem('product', JSON.stringify(itemLs));
			} else {
				itemLs[i].quantity = 1;
				localStorage.setItem('product', JSON.stringify(itemLs));
			}
		}
	}
	afficheTotalPrice();
	afficheTotalQuantity();
}


// fonction qui met en écoute le texte tapé dans le input #email,
function initLoad() {
	document.getElementById('mess-oblig').style.textAlign = 'right';

	const email = document.querySelector('#email');
	email.addEventListener('keyup', (element) => controlEmail());

	const form = document.querySelector('.cart__order__form');
	const inputs = form.querySelectorAll('input');
	inputs.forEach((element) => {
		if (element.value != '') {
			if (element.id === 'order') element.setAttribute('style', 'padding-left: 28px;');
			if (element.id != 'order') element.setAttribute('style', 'padding-left: 15px;');
		} else {
			if (element.id != 'order') element.setAttribute('style', 'padding-left: 15px;');
		}
	});
}

// fonction qui se trigger que si des caratères ou chiffres sont dans certains champs du formulaire

function testValidityForm(parent) {
	let textTemp = parent.value;
	let newStr = textTemp.replace(/0/g, '');
	newStr = newStr.replace(/1/g, '');
	newStr = newStr.replace(/2/g, '');
	newStr = newStr.replace(/3/g, '');
	newStr = newStr.replace(/4/g, '');
	newStr = newStr.replace(/5/g, '');
	newStr = newStr.replace(/6/g, '');
	newStr = newStr.replace(/7/g, '');
	newStr = newStr.replace(/8/g, '');
	newStr = newStr.replace(/9/g, '');
	newStr = newStr.replace(/'/g, '');
	newStr = newStr.replace(/"/g, '');
	newStr = newStr.replace(/=/g, '');
	parent.value = newStr;
}

// fonction qui à chaque frappe de caractère si le contenu est correctement formaté

function controlEmail() {
	const pattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/i);
	const elem = document.querySelector('#email');
	const valueTextEmail = elem.value;
	const resultRegex = valueTextEmail.match(pattern);
	const errorMsg = document.querySelector('#emailErrorMsg');

	if (resultRegex == null) {
		elem.setAttribute('style', 'color: #FF0000; padding-left: 15px;');
		errorMsg.textContent = 'Veuillez entrer une adresse email valide !';
		return false;
	} else {
		elem.setAttribute('style', 'color: #000; padding-left: 15px;');
		errorMsg.textContent = '';
		return true;
	}
}

// fonction qui créée l'objet qui renvoi les données de contact

function createObjetForContactForm() {
	const form = document.querySelector('.cart__order__form');
	const contactForm = {
		contact: {
			firstName: form.firstName.value,
			lastName: form.lastName.value,
			address: form.address.value,
			city: form.city.value,
			email: form.email.value,
		},
		products: listIDs(), // fournit la liste des IDs à transmettre
	};
	return contactForm;
}

// fonction qui transmet le formulaire et les données à la page confirmation.html

function submitForm(order) {
	order.preventDefault(); // empêche de rafraichir la page
	if (cart.length === 0) {
		theBasketIsEmpty();
		return;
	}
	// test si les champs sont vides
	const pass = testFieldsIsEmpty();
	if (pass) {
		// construit l'objet avec les données de contacts et la liste des IDs des articles
		const contactForm = createObjetForContactForm();

		if (controlEmail()) sendCommand(contactForm);
	}
}

// fonction qui transmet la commande

async function sendCommand(contactForm) {
	await fetch('http://localhost:3000/api/products/order', {
		method: 'POST',
		body: JSON.stringify(contactForm),
		headers: { 'Content-Type': 'application/json' },
	})
		.then((res) => res.json())
		.then((data) => {
			const orderId = data.orderId;
			window.location.href = 'confirmation.html?orderId=' + orderId;
		})
		.catch((err) => {
			console.error(err);
			alert('erreur: ' + err);
		});
}

// fonction qui affiche "Votre panier est vide !"

function theBasketIsEmpty() {
	alert('Votre Panier est vide')
}


// fonction qui renvoie un tableau de tous les IDs des articles du panier

function listIDs() {
	let ids = [];
	for (let i = 0; i < cart.length; i++) {
		ids.push(cart[i].id);
	}
	return ids;
}

// fonction qui test si le contenu d'un champ est vide, et met la bordure en rouge ou en gris

function testInData(element) {
	if (element.id != 'order') {
		if (element.value === '') {
			element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
		} else {
			element.setAttribute('style', 'border:1px solid #767676; padding-left: 15px;');
			switch (element.id) {
				case 'firstName': {
					document.querySelector('#firstNameErrorMsg').textContent = '';
					break;
				}
				case 'lastName': {
					document.querySelector('#lastNameErrorMsg').textContent = '';
					break;
				}
				case 'address': {
					document.querySelector('#addressErrorMsg').textContent = '';
					break;
				}
				case 'city': {
					document.querySelector('#cityErrorMsg').textContent = '';
					break;
				}
			}
		}
	}
}

// fonction qui test si les champs contact sont vides

function testFieldsIsEmpty() {
	const form = document.querySelector('.cart__order__form');
	const inputs = form.querySelectorAll('input');
	let pass = true;
	inputs.forEach((element) => {
		element.addEventListener('input', () => testInData(element));

		switch (element.id) {
			case 'firstName': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#firstNameErrorMsg').textContent = 'Veuillez entrer votre prénom';
					pass = false;
				}
			}
			case 'lastName': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#lastNameErrorMsg').textContent = 'Veuillez entrer votre nom';
					pass = false;
				}
			}
			case 'address': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#addressErrorMsg').textContent = 'Veuillez entrer votre adresse';
					pass = false;
				}
			}
			case 'city': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#cityErrorMsg').textContent = 'Veuillez entrer une ville';
					pass = false;
				}
			}
			case 'email': {
				if (element.value == '') {
					element.setAttribute('style', 'border:1px solid #FF0000; padding-left: 15px;');
					document.querySelector('#emailErrorMsg').textContent = 'Veuillez entrer une adresse email valide !';
					pass = false;
				}
			}
		}
	});
	return pass;
}

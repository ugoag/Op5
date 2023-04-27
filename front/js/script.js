// interroge, récupère et affiche les données de la base de données

addArticles();

async function addArticles() {
    await fetch('http://localhost:3000/api/products')
        .then((res) => res.json())
        .then((data) => {
            for (let i = 0; i < data.length; i++) {
                element = data[i];
                document.querySelector('#items').innerHTML += `
                    <a href="./product.html?id=${element._id}">
                        <article>
                            <img src="${element.imageUrl}" alt="${element.altTxt}">
                            <h3 class="productName">${element.name}</h3>
                            <p class="productDescription">${element.description}</p>
                        </article>
                    </a>`;
            }
        })
        .catch((error) => {
            console.log('Erreur de connexion avec le serveur : ', error);
            window.alert('Connexion au serveur impossible !');
        });
}

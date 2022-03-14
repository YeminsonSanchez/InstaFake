//capturamos datos del formulario
$("#js-form").submit(async (event) => {
  event.preventDefault();
  const email = document.getElementById("js-input-email").value; //traemos el email desde el input
  const password = document.getElementById("js-input-password").value; //traemos password desde el formulario
  const JWT = await photoData(email, password); //pasamos el valor del email y password como parametro a la llamada a a la api para generar token
  const photos = await getPhotos(JWT); //hacemos un request el endpoint de photos y pasamos como parametro el token
});

//llamada a bd para obtener token se registra con un usuario creado previemente por el momento
//recibe email y assword para generar
const photoData = async (email, password) => {
  try {
    //llamado a endpoint de registro para obtener token
    const response = await fetch("http://localhost:3000/api/login", {
      // tipo de request
      method: "POST",
      body: JSON.stringify({ email: email, password: password }), //recibe los parametros y crea el token con la info del usuario registrado
    });
    const { token } = await response.json(); //retorna el token en una respuesta json
    localStorage.setItem("jwt-token", token); // persiste el token en local storage
    return token; //retorna el token
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

// request a endpoint de fotos recibe el token se le pasa el tipo de autorizacion mas el token recibido
const getPhotos = async (jwt) => {
  try {
    //llamado a endpoint de fotos para obtener token
    const response = await fetch(`http://localhost:3000/api/photos`, {
      //tipo de request
      method: "GET",
      headers: {
        //tipo de autorizacion mas el token para validar
        Authorization: `Bearer ${jwt}`,
      },
    });
    //trae la data en formato json
    const { data } = await response.json();

    //si data es true ejecuta lo de adentro
    if (data) {
      //inserta una tabla con los datos pasados como parametros
      addPhoto(data);
      //genera un toggle entre el form y la tabla
      toggleFormAndCard("js-form-wrapper", "js-card-wrapper");
      // funcion de logout
      logout();
      morePage();
    }
    return data;
  } catch (err) {
    // limpia el local store si el token no es valido
    localStorage.clear();
    console.error(`Error: ${err}`);
  }
};

// funcion inserta una tabla html con los datos
const addPhoto = (data) => {
  data.map((photos) => {
    document.getElementById(
      "js-card-view"
    ).innerHTML += `<div class="card mb-3">
    <img src="${photos.download_url}" class="card-img-top" alt="">
    <div class="card-body">
      <h5 class="card-title text-center">${photos.author}</h5>
    </div>
  </div>`;
  });
};
// funcion crea togle entre el form y la tabla
const toggleFormAndCard = (form, card) => {
  $(`#${form}`).toggle();
  $(`#${card}`).toggle();
};

//despues del click llama a local storage limpia el token y recarga la pag
const logout = () => {
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
};

//funcion para cargar mas fotos
let page = 2;
const morePage = () => {
  //escucha click en boton nex page hace llamado a nueva pag
  document.getElementById("nextPage").addEventListener("click", async () => {
    const token = localStorage.getItem("jwt-token");
    if (page <= 10) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/photos?page=${page}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { data } = await response.json();
        //carga los nuevos elementos
        if (data) {
          data.map((photos) => {
            document.getElementById(
              "moreElements"
            ).innerHTML += `<div class="card mb-3">
          <img src="${photos.download_url}" class="card-img-top" alt="">
          <div class="card-body">
            <h5 class="card-title text-center">${photos.author}</h5>
          </div>
        </div>`;
          });
        }
      } catch (err) {
        localStorage.clear();
        console.error(`Error: ${err}`);
      }
      //suma un numero para asignar a la nueva consulta
      page++;
      if (page == 11) {
        document.getElementById("js-card-wrapper").innerHTML =
          "No hay mas elementos para mostrar";
      }
    }
  });
};
// funcion para rescatar el token desde el local storage
const init = async () => {
  const token = localStorage.getItem("jwt-token");
  if (token) {
    getPhotos(token);
  }
};

init();

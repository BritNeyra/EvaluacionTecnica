import { onGetReplacements, onGetHolidays, registerHoliday } from './firebase.js';

// Cadenas de conexión para el envío de correos
const serviceID = 'default_service';
const templateSuccesID = 'template_divshco';
const templateErrorID = 'template_u5c49ot';

const pattern = /^[a-zA-ZÀ-ÿ\s]*$/;

var lsReplacements = [];
var lsRegisteredHolidays = [];
var inputs;

// Evento que se ejecuta cuando el DOM ha cargado
document.addEventListener("DOMContentLoaded", async function (event) {

    // Obtención de Reemplazos
    onGetReplacements((querySnapshot) => {
        lsReplacements = [];
        querySnapshot.forEach(replacement => {
            var replacementAux = {
                id: replacement.id,
                name: replacement.data().name,
                lastname: replacement.data().lastname,
            }
            lsReplacements.push(replacementAux);
        });
    })

    // Obtención de Vacaciones registradas
    onGetHolidays((querySnapshot) => {
        lsRegisteredHolidays = [];
        querySnapshot.forEach(holiday => {
            lsRegisteredHolidays.push(holiday.data());
        });
    });

    // Validación de los campos del formulario
    inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
    });
    inputs.forEach(input => {
        input.addEventListener('input', validateInput);
    });
});

// Evento que se ejecuta al guardar el formulario
var registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', function (event) {

    event.preventDefault();
    var name = registerForm["name"];
    var email = registerForm["email"];
    var startDate = registerForm["startDate"];
    var endDate = registerForm["endDate"];

    var validForm = true;

    // Validación de campos completos
    if (name.value.length == 0 || !name.value.match(pattern)) {
        setInvalidClass(name);
        validForm = false;
    }
    if (email.value.length == 0) {
        setInvalidClass(email);
        validForm = false;
    }
    if (startDate.value.length == 0) {
        setInvalidClass(startDate);
        validForm = false;
    }
    if (endDate.value.length == 0) {
        setInvalidClass(endDate);
        validForm = false;
    }

    if (validForm) {

        if (startDate.value >= endDate.value) { // Validación de fechas
            Swal.fire({
                icon: 'error',
                title: 'Error al registrar',
                text: 'La fecha de inicio debe ser menor a la fecha fin.',
                confirmButtonText: 'Cerrar',
                timer: 1500
            });
        } else {
            var busyReplacements = [];
            var k = 0;

            if (lsReplacements.length == 0) { // Si no existen reemplazos registrados
                sendErrorEmail();
            } else {
                lsRegisteredHolidays.forEach(registeredHoliday => {
                    if (!validateDates(startDate.value, endDate.value, registeredHoliday.startDate, registeredHoliday.endDate)) {
                        busyReplacements[k] = registeredHoliday.idReplacement;
                        k = k + 1;
                    }
                });

                if (busyReplacements.length == 0) { // Si no existen reemplazos ocupados
                    var replacementName = `${lsReplacements[0].name} ${lsReplacements[0].lastname}`;
                    registerNewHoliday(name.value, email.value, startDate.value, endDate.value, lsReplacements[0].id, replacementName);
                } else {
                    if (busyReplacements.length < lsReplacements.length) { // Si hay reemplazos disponibles
                        const lsReplacementsAvailables = lsReplacements.filter(replacement => replacement.id != busyReplacements);
                        const replacementName = `${lsReplacementsAvailables[0].name} ${lsReplacementsAvailables[0].lastname}`;
                        registerNewHoliday(name.value, email.value, startDate.value, endDate.value, lsReplacementsAvailables[0].id, replacementName);
                    } else {
                        sendErrorEmail();
                    }
                }
            }
        }


    }
});

// Función que valida las nuevas fechas ingresadas
function validateDates(startDate, endDate, startDateAux, endDateAux) {
    // Validamos que las nuevas fechas no estén en el rango de fechas existentes
    if ((startDate >= startDateAux && startDate <= endDateAux) || (endDate >= startDateAux && endDate <= endDateAux))
        return false;
    else // Validamos que las nuevas fechas no contengan a las fechas existentes
        if ((startDate <= startDateAux && endDateAux <= endDate))
            return false;

    return true;
}

// Función que registra las vacaciones
function registerNewHoliday(name, email, startDate, endDate, idReplacement, replacementName) {

    registerHoliday(name, email, startDate, endDate, idReplacement);

    // Envío de correo
    registerForm["replacementName"].value = replacementName;
    emailjs.sendForm(serviceID, templateSuccesID, registerForm)
        .then(() => {
            registerForm.reset();
            Swal.fire({
                icon: 'success',
                title: 'Vacaciones registradas exitosamente',
                text: 'El detalle fue enviado al correo registrado.',
                confirmButtonText: 'Cerrar'
            });
        }, (err) => {
            console.log(JSON.stringify(err));
            Swal.fire({
                icon: 'error',
                title: 'Ocurrió un error inesperado',
                confirmButtonText: 'Cerrar'
            });
        });
}

// Función que envía el correo de error
function sendErrorEmail() {
    // Envío de correo
    emailjs.sendForm(serviceID, templateErrorID, registerForm)
        .then(() => {
            registerForm.reset();
            Swal.fire({
                icon: 'error',
                title: 'No hay reemplazos disponibles',
                text: 'El detalle fue enviado al correo registrado.',
                confirmButtonText: 'Cerrar'
            });
        }, (err) => {
            console.log(JSON.stringify(err));
            Swal.fire({
                icon: 'error',
                title: 'Ocurrió un error inesperado',
                confirmButtonText: 'Cerrar'
            });
        });
}

// Función que valida los inputs
function validateInput(e) {
    const states = ['d-none', 'd-block'];

    e.target.classList.remove('input-invalid');
    e.target.nextElementSibling.classList.remove(...states);

    if (e.target.value.length === 0 || (e.target.name == "name" && !e.target.value.match(pattern))) {
        e.target.classList.add('input-invalid');
        e.target.nextElementSibling.classList.add(states[1]);
    } else {
        e.target.nextElementSibling.classList.add(states[0]);
    }
}

// Función que setea estilos al input si es inválido
function setInvalidClass(input) {
    const states = ['d-none', 'd-block'];

    input.classList.remove('input-invalid');
    input.nextElementSibling.classList.remove(...states);
    input.classList.add('input-invalid');
    input.nextElementSibling.classList.add(states[1]);
}


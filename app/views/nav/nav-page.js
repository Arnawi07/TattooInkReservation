const observableModule = require("tns-core-modules/data/observable");
var firebase = require("nativescript-plugin-firebase");
var frameModule = require("tns-core-modules/ui/frame");
var getFrameById = require("tns-core-modules/ui/frame").getFrameById;

var page;
var pageData = new observableModule.fromObject({
    tabSelectedIndex: 0,
    titleActionBar: "Inicio"
});

exports.onLoaded = function (args) {
    page = args.object;
    pageData.set("tabSelectedIndex", 0);
    page.bindingContext = pageData;
}

exports.signOut = function (args) {
    firebase.logout()
        .then(function () {
            console.info("INFO: Sesión cerrada.");
            const button = args.object;
            const page = button.page;
            const myFrame = page.frame;
            const navigationEntry = {
                moduleName: "views/login/login-page",
                clearHistory: true //Este atributo es super importante, ya que sin él, el historial no se limpia y cuando cierres sesion y tires hacia atras te volvera a la aplicacion sin tener que iniciar sesion
            };
            myFrame.navigate(navigationEntry);
        }, function (error) {
            console.error("ERROR: signOut() -> " + error);
        });
}

exports.openModalContact = function(args){
    const modalViewModule = "views/contact/contact-modal";
    const mainView = args.object;
    const context = { };
    const fullscreen = true;
    mainView.showModal(modalViewModule, context, function () {
    }, fullscreen);
}

exports.onSelectedIndexChanged = function (args) {
    if (args.oldIndex !== -1) {
        const newIndex = args.newIndex;
        if (newIndex === 0) {
            pageData.set("titleActionBar", "Inicio");
        } else if (newIndex === 1) {
            pageData.set("titleActionBar", "Calendario de Reservas");
        } else if (newIndex === 2) {
            pageData.set("titleActionBar", "Mis Reservas");
        } else if( newIndex === 3){
            pageData.set("titleActionBar", "Mi Perfil");
        }
    }
}
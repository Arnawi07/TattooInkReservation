var observableModule = require("tns-core-modules/data/observable");
var ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
var calendarModule = require("nativescript-ui-calendar");
var timerModule = require("tns-core-modules/timer");
const Color = require("color").Color;

var Reservations = require("../../shared/view-models/reservations-view-model");
var reservations = new Reservations();
var monthsOfYear = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

var page;
var dayOfWeekSelected = -1;
var dateOfDateSelected;
var isSundayOrHoliday;

var pageData = new observableModule.fromObject({
    reservations: reservations,
    selectedIndex: 0,
    actualMonthCalendar: 0,
    actualYearCalendar: 0,
    timeTableWorker: "",
    showFloatingButton: false,
    uid: "",

});

var reserves = [];

exports.loadedReservation = function (args) {
    page = args.object;
    today = new Date();
    pageData.set("actualMonthCalendar", today.getMonth()); //Se settea la variable del mes al mes actual.
    pageData.set("actualYearCalendar", today.getFullYear()); //Se settea la variable del mes al mes actual.
    reservations.emptyArrayWorkersListNames();
    reservations.getWorkersList(); //Se rellenan las listas de los nombres de los trabajadores y de sus timeTables.

    reservations.getHolidays();
    setTimeout(function () {
        setCalendarHolidays();
    }, 300);

    page.bindingContext = pageData;
};


exports.getSelectedIndexChanged = function (args) {
    const dropDown = args.object;
    pageData.set("selectedIndex", dropDown.selectedIndex);//Se recoge el indice del drop down y se settea en la variable "selectedIndex"

    //Hace un for para recoger el nombre de la tabla del trabajador en funcion del indice seleccionado.
    reservations.workersListTimeTables.forEach(function (nameTimeTable, index) {
        if (index == pageData.get("selectedIndex")) {
            pageData.set("timeTableWorker", nameTimeTable);
        }
    });

    reservations.emptyArrayReservationsCalendar();
    const actualMonthReservation = monthsOfYear[pageData.get("actualMonthCalendar")]; //Cuando se cambia el tatuador, se recoge el mes en el que esta el usuario y se coge el nombre del mes.  
    const actualYearReservation = pageData.get("actualYearCalendar");
    reservations.getReservationsListForMonth(pageData.get("timeTableWorker"), actualMonthReservation, actualYearReservation);  //Se llama a la funcion para que se rellene la lista con las reservas de ese mes y de ese trabajador.
    setTimeout(function () {
        setCalendarReservations(); //Con la lista de las reservas rellena, se rellena el calendario con las reservas de ese mes
    }, 400);
};

//Sirve para cuando estes deslizando de un mes a otro, setee la variable 'actualMonthCalendar' si es diferente mes.
exports.navigatedToDate = function (args) {
    const calendar = args.object;
    const dateChanged = args.date;
    const monthOfDateChanged = dateChanged.getMonth();
    const yearOfDateChanged = dateChanged.getFullYear();

    const dayOfDateSelected = parseInt(dateChanged.getDate()) < 10 ? "0" + parseInt(dateChanged.getDate()) : parseInt(dateChanged.getDate());
    const monthOfDateSelected = parseInt(dateChanged.getMonth() + 1) < 10 ? "0" + parseInt(dateChanged.getMonth() + 1) : parseInt(dateChanged.getMonth() + 1);
    const yearOfDateSelected = dateChanged.getFullYear();
    dateOfDateSelected = yearOfDateSelected + "-" + monthOfDateSelected + "-" + dayOfDateSelected;

    //Mirar si el "timeTableWorker" es vacio o no
    if (pageData.get("actualMonthCalendar") != monthOfDateChanged || pageData.get("actualYearCalendar") != yearOfDateChanged && calendar.viewMode != calendarModule.CalendarViewMode.Year) {
        pageData.set("actualYearCalendar", yearOfDateChanged);
        pageData.set("actualMonthCalendar", monthOfDateChanged);
        reservations.emptyArrayReservationsCalendar();

        const actualMonthReservation = monthsOfYear[pageData.get("actualMonthCalendar")]; //Cuando se cambia el tatuador, se recoge el mes en el que esta el usuario y se coge el nombre del mes.  
        const actualYearReservation = pageData.get("actualYearCalendar");

        reservations.getReservationsListForMonth(pageData.get("timeTableWorker"), actualMonthReservation, actualYearReservation);  //Se llama a la funcion para que se rellene la lista con las reservas de ese mes y de ese trabajador.
        setTimeout(function () {
            setCalendarReservations(); //Con la lista de las reservas rellena, se rellena el calendario con las reservas de ese mes
        }, 400);
    }
    /* PARA EL DIA
        if (calendar.viewMode == calendarModule.CalendarViewMode.Day) {
            reservations.emptyArrayReservationsCalendar();
            const actualMonthReservation = monthsOfYear[pageData.get("actualMonthCalendar")]; //Cuando se cambia el tatuador, se recoge el mes en el que esta el usuario y se coge el nombre del mes.  
            reservations.getReservationsListForDay(pageData.get("timeTableWorker"), actualMonthReservation, dateOfDateSelected);  //Se llama a la funcion para que se rellene la lista con las reservas de ese mes y de ese trabajador.
            setTimeout(function () {
                setCalendarReservations(); //Con la lista de las reservas rellena, se rellena el calendario con las reservas de ese mes
            }, 200);
    }*/

};

//Recoge la fecha seleccionada y cambia a la vista 'Day' si estas en la vista 'Month'.
exports.onDateSelected = function (args) {
    const calendar = args.object;
    const dateSelected = args.date;

    if (pageData.get("timeTableWorker") !== "") {
        dayOfWeekSelected = dateSelected.getDay();
        if (calendar.viewMode == calendarModule.CalendarViewMode.Month) {   //Si esta en la vista 'Month' cambiará a 'Day' solamente cuando seleccione/clique una fecha.
            if (dateSelected.getDay() != 0) {
                pageData.set("showFloatingButton", true);
                isSundayOrHoliday = false;
            } else {
                isSundayOrHoliday = true;
            }
            calendar.viewMode = calendarModule.CalendarViewMode.Day;
            calendar.selectedDate = args.date;
            calendar.displayedDate = args.date;
        }
    } else {
        alert("Debes seleccionar un tatuador.");
    }
}

exports.changeViewMode = function (args) {
    const btn = args.object;
    const viewModeBtn = btn.id;
    const calendar = page.getViewById("calendar");

    if (viewModeBtn == calendarModule.CalendarViewMode.Month.toLowerCase()) {
        pageData.set("showFloatingButton", false);
        calendar.viewMode = calendarModule.CalendarViewMode.Month;
        calendar.selectedDate = args.date;
        calendar.displayedDate = args.date;
    } else if (viewModeBtn == calendarModule.CalendarViewMode.Day.toLowerCase()) {
        if (!isSundayOrHoliday) {
            pageData.set("showFloatingButton", true);
        }
        calendar.viewMode = calendarModule.CalendarViewMode.Day;
        calendar.selectedDate = args.date;
        calendar.displayedDate = args.date;
    } else {
        if (!isSundayOrHoliday) {
            pageData.set("showFloatingButton", true);
        }
        calendar.selectedDate = new Date();
        calendar.displayedDate = new Date();
    }
}

function setCalendarReservations() {
    reservations.getCurrentUser()
        .then(function (user) {
            reservations.reservationsCalendar.forEach(function (reserve) {
                const startDate = new Date(reserve.startDate);
                const endDate = new Date(reserve.endDate);

                if (user.uid == reserve.uidClient) {
                    title = reserve.displayName;
                    color = new Color("#5abfce");
                } else {
                    title = "Reservado";
                    color = new Color("#e57283");
                }
                const reservation = new calendarModule.CalendarEvent(title, startDate, endDate, false, color);
                reserves.push(reservation);
            });
            pageData.set("calendarEvents", reserves);
        });
}

function setCalendarHolidays() {
    reservations.holidaysCalendar.forEach(function (holidayRegister) {
        const startDate = new Date(holidayRegister.startDate);
        const endDate = new Date(holidayRegister.endDate);

        const holiday = new calendarModule.CalendarEvent("Festivo", startDate, endDate, false, new Color("#DC001A"));
        reserves.push(holiday);
    });
    pageData.set("calendarEvents", reserves);
}


exports.reserve = function (args) {
    const actualMonthReservation = monthsOfYear[pageData.get("actualMonthCalendar")]; //Cuando se cambia el tatuador, se recoge el mes en el que esta el usuario y se coge el nombre del mes.  
    const modalViewModule = "views/reserve/reserve-modal";
    const mainView = args.object;
    const context = { dayOfWeekSelected: dayOfWeekSelected, timeTableWorker: pageData.get("timeTableWorker"), actualMonthReservation: actualMonthReservation, dateOfDateSelected: dateOfDateSelected, actualYearCalendar: pageData.get("actualYearCalendar") };
    const fullscreen = true;
    mainView.showModal(modalViewModule, context, function (dayOfWeekSelected, timeTableWorker, actualMonthReservation, dateOfDateSelected, actualYearCalendar) {
        console.log("calendarEvent");
    }, fullscreen);
};
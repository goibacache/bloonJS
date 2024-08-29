$(document).ready(() => {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "onclick": null,
        "showDuration": "25",
        "hideDuration": "25",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      }
});

const openMenu = () => {
  $("#menu").fadeIn();
  $("body").css({ overflow: "hidden" });
}

const closeMenu = () => {
  $("#menu").fadeOut();
  $("body").css({ overflow: "auto" });
}

/**
 * Uses moment-timezones to load all of the timezones in the the time zone select
 */
const addMomentTimezones = () => {
  const extraNames = moment.tz.names().filter((value, index, array) => array.indexOf(value) === index);

  extraNames.forEach(e => {
      $("#timezone").append(`<option value="${e}">${e.replace('_', ' ')}</option>`);
  });
}

/**
* Get current user time zone
* @returns string
*/
const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
* Changes the #timezone select to the user's timezone
*/
const selectUserTimeZone = (triggerChange = false) => {
  const currentTimeZone = getUserTimezone();
  if (triggerChange) {
      $(`#timezone`).val(currentTimeZone).change(); // triggers onChange();
  } else {
      $(`#timezone`).val(currentTimeZone); // Doesn't trigger onChange();
  }
}


const goto = (relativeUrl) => {
  const base = window.location.origin;
  const slash = relativeUrl.startsWith("/") ? "" : "/";

  window.location = `${base}${slash}${relativeUrl}`;
}
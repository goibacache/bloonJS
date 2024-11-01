const openMenu = () => {
  $("#menu").fadeIn();
  $("body").css({ overflow: "hidden" });
}

const closeMenu = () => {
  $("#menu").fadeOut();
  $("body").css({ overflow: "auto" });
}

const goto = (relativeUrl) => {
  const base = window.location.origin;
  const slash = relativeUrl.startsWith("/") ? "" : "/";

  window.location = `${base}${slash}${relativeUrl}`;
}

// On ready options.
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
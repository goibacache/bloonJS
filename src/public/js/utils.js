$(document).ready(() => {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "100",
        "hideDuration": "100",
        "timeOut": "1500",
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
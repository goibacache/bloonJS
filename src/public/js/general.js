isLoading = true;

const logOut = async () => {
    if (confirm("Do you really want to log out?")){
        await $.ajax({
            type: 'DELETE',
            url: '/authorize',
            success: () => {
                window.location.href = window.location.origin; // Send to main page.
            },
            onerror: (error) => {
                toastr.error(error);
            }
        });
    }
}

const makeOptionsDoNothing = () => {
    $('.dropdown-menu a').on('click', function(e) {
        e.stopPropagation();
    });
}

$(() => {
    makeOptionsDoNothing();
    isLoading = false;
});
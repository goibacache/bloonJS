const logOut = async () => {
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
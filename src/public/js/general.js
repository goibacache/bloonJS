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
    $('.doNothing').on('click', function(e) {
        e.stopPropagation();
    });
}

const setTimeFormat = () => {
    const format = $("input[name=12or24selector]:checked").val();
    localStorage.setItem('timeFormat',format);
}

const loadTimeFormat = () => {
    let timeFormat = localStorage.getItem('timeFormat');
    if (timeFormat == undefined || timeFormat == null || timeFormat.length == 0){
        timeFormat = "24hr";
        localStorage.setItem('timeFormat', timeFormat);
    }
    return timeFormat;
}

const selectTimeFormat = (timeFormat) => {
    $(`input[name='12or24selector'][value='${timeFormat}']`).prop('checked', true);
}

$(() => {
    makeOptionsDoNothing();
    const timeFormat = loadTimeFormat();
    selectTimeFormat(timeFormat);
    isLoading = false;
});

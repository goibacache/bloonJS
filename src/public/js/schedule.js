let calendar = null;
let mode = "add";

const loadCalendar = (clean=false) => {
    calendar = $('#calendar');

    //Clean calendar
    if (clean){
        calendar.children().remove();
    }

    // Remember: YYYY/DD/MM 🙄
    const StartOfSchedule = spacetime('2024/07/08', 'America/Los_Angeles').goto('America/Santiago');
    console.log(StartOfSchedule.format('time'));
    
    
}

loadCalendar();



// Mark calendar
$(".selectableDate").on('mouseenter', (e) => {
    if (e.originalEvent.buttons > 0){ // more than one button that is the right click
        if (mode == "remove"){
            $(e.currentTarget).removeClass('mySelection');
        }else{
            $(e.currentTarget).addClass('mySelection');
        }
    }
});

$(".selectableDate").on('mousedown', (e) => {
    if ($(e.currentTarget).hasClass('mySelection')){
        mode = "remove";
        $(e.currentTarget).removeClass('mySelection');
    }else{
        mode = "add";
        $(e.currentTarget).addClass('mySelection');
    }
});

// Mark filter
$(".toggleCalendarVisibility").on('click, mousedown', (e) => {
    const visibilityToHide = $(e.currentTarget).data("toggle");

    if ($(e.currentTarget).hasClass('forceInactive')){
        mode = "remove";
        $(`.active${visibilityToHide}`).removeClass('forceInactive');
    }else{
        mode = "add";
        $(`.active${visibilityToHide}`).addClass('forceInactive');
    }
});

$(".toggleCalendarVisibility").on('mouseenter', (e) => {
    if (e.originalEvent.buttons > 0){ // more than one button that is the right click
        const visibilityToHide = $(e.currentTarget).data("toggle");

        if (mode == "remove"){
            $(`.active${visibilityToHide}`).removeClass('forceInactive');
        }else{
            $(`.active${visibilityToHide}`).addClass('forceInactive');
        }
    }
});
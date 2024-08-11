

let calendar = null;
let mode = "add";

const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
    //return "Pacific/Gambier" // For testing.
}

const selectUserTimeZone = () => {
    const currentTimeZone = getUserTimezone();
    $(`#timezone`).val(currentTimeZone).change();
}

const loadCalendar = (clean = true, debug = false) => {
    calendar = $('#calendar');
    const timezone = $(`#timezone`).val();
    let headerColumns = 0;

    //Clean calendar
    if (clean) {
        calendar.children().remove();
        calendar.append('<thead class="stickyC" style="--sticky-top: 180px;"></thead>');
        $("#calendar thead").append("<tr></tr>");
        calendar.append('<tbody></tbody>');
    }

    const daysToDraw = 3;

    /**
     * Start date in the original time zone
     */
    const startDate = spacetime([2024, 7, 9], 'America/Los_Angeles').goto(timezone); // 2024-08-09
    /**
     * End date in the original time zone
     */
    const endDate = startDate.add(daysToDraw, 'days');

    /**
     * Start date in the user's time zone (it will start at 00:00 of the first day)
     */
    const localStartDate = spacetime([2024, 7, 9], timezone); // Will start at 00:00

    let currentDate = localStartDate;

    /**
     * Holds an array of days to draw. Adds one more to the daysToDraw variable, 
     * the idea if that if it ends at 00:00 it will not draw the column
     */
    const days = buildDayArray(daysToDraw + 1, startDate);

    // Create headers - Empty spacer
    $('#calendar thead tr').append(`<th class="text-center borderBR t-time" style="background-color:black"></th>`);
    days.forEach(day => {
        // If the last day starts at midnight, skip it 'cause it's the end.
        // if (days.indexOf(day) == days.length - 1) {
        //     if (day.startTime == "12:00am" || currentDate.add(days.indexOf(day), 'days').isAfter(endDate)) {
        //         return;
        //     }
        // }

        if (days.indexOf(day) == days.length - 1 && (day.startTime == "12:00am" || currentDate.add(days.indexOf(day), 'days').isAfter(endDate) || currentDate.add(days.indexOf(day), 'days').isEqual(endDate))) {
            return;
        }

        headerColumns++;

        $('#calendar thead tr').append(`
                <th class="text-center borderBR w-auto" style="background-color:black">
                    <p class="m-0 small">${day.monthDay}</p>
                    <p class="m-0 small">${day.nameOfDay}</p>
                </th>`
        );
    });

    for (var i = 0; i < 96; ++i) { // Amount of hours/rows

        // Create TR
        const currentTr = document.createElement('tr');

        // Create first column only on the first iteration
        if (i % 4 == 0) {
            currentTr.innerHTML += `
                <td rowspan="4" class="calendarCell borderH text-center timeText" style="background-color:black;">
                    ${i / 4}:00
                </td>`;
        }

        // For each day, create a TD
        days.forEach(day => {
            // If the last day starts at midnight, skip it 'cause it's the end.
            if (days.indexOf(day) == days.length - 1 && days.indexOf(day) >= headerColumns) {
                return;
            }

            // If it is before the start date, draw "not available spaces"
            if (currentDate.add(days.indexOf(day), 'days').isBefore(startDate) || currentDate.add(days.indexOf(day), 'days').isAfter(endDate) || currentDate.add(days.indexOf(day), 'days').isEqual(endDate)) {
                currentTr.innerHTML += `
                    <td class="calendarCell borderH text-center">
                        <div class="selectableDateDisabled" data-toggle="tooltip" title="Time not available in your timezone">
                        </div>
                    </td>`;
            } else {
                currentTr.innerHTML += `
                    <td class="calendarCell borderH text-center">
                        <div class="selectableDate" data-toggle="tooltip" title="<b>${currentDate.add(days.indexOf(day), 'days').format('time-24')}</b>">
                        </div>
                    </td>`;
            }
        });

        currentDate = currentDate.add(15, 'minutes');
        $("#calendar tbody").append(currentTr);
    }

    if (debug){
        console.log('startDate', startDate.format('nice'));
        console.log('endDate', endDate.format('nice'));
        console.log('localStartDate', localStartDate.format('time'));
        console.log("days:", days);
        console.log("game date:", startDate.format('time-'));
    }

    handleMarks();
    loadTooltips();
}

const buildDayArray = (amountOfDays = 3, startDate) => {
    const days = [];

    for (let i = 0; i < amountOfDays; i++) {
        const currentDate = startDate.add(i, 'days')
        days.push({
            monthDay: `${currentDate.format('month-short')} ${currentDate.format('date')}`,
            nameOfDay: currentDate.format('day'),
            startTime: currentDate.format('time')
        });
    }

    return days;
}


// Load tooltips
const loadTooltips = () => {
    $('[data-toggle="tooltip"]').tooltip({
        html: true,
        animation: false
    });
}

const handleMarks = () => {
    // Mark calendar
    $(".selectableDate").on('mouseenter', (e) => {
        if (e.originalEvent.buttons > 0) { // more than one button that is the right click
            if (mode == "remove") {
                $(e.currentTarget).removeClass('mySelection');
            } else {
                $(e.currentTarget).addClass('mySelection');
            }
        }
    });

    $(".selectableDate").on('mousedown', (e) => {
        if ($(e.currentTarget).hasClass('mySelection')) {
            mode = "remove";
            $(e.currentTarget).removeClass('mySelection');
        } else {
            mode = "add";
            $(e.currentTarget).addClass('mySelection');
        }
    });
}

const handleVisibilityButtons = () => {
    // Mark filter
    $(".toggleCalendarVisibility").on('click, mousedown', (e) => {
        const visibilityToHide = $(e.currentTarget).data("toggle");

        if ($(e.currentTarget).hasClass('forceInactive')) {
            mode = "remove";
            $(`.active${visibilityToHide}`).removeClass('forceInactive');
        } else {
            mode = "add";
            $(`.active${visibilityToHide}`).addClass('forceInactive');
        }
    });

    $(".toggleCalendarVisibility").on('mouseenter', (e) => {
        if (e.originalEvent.buttons > 0) { // more than one button that is the right click
            const visibilityToHide = $(e.currentTarget).data("toggle");

            if (mode == "remove") {
                $(`.active${visibilityToHide}`).removeClass('forceInactive');
            } else {
                $(`.active${visibilityToHide}`).addClass('forceInactive');
            }
        }
    });
}


$(document).ready(() => {
    // On start functions
    handleMarks();
    handleVisibilityButtons();
    selectUserTimeZone();
    loadCalendar();
    loadTooltips();
});
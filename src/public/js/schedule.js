const modeValues = {
    add: "add", 
    remove: "remove"
};

const tabValues = {
    team: "team", 
    me: "me"
};

let matchDetails = null;

/**
 * Reference to the calendar table
 */
let calendar = null;
/**
 * The mode that will be used when a user holds the mouse button and moves over a cell.
 * Can be "add" or "remove"
 */
let mode = modeValues.add;

let tab = tabValues.team;

/**
 * Uses moment-timezones to load all of the timezones in the the time zone select
 */
const addMomentTimezones = () => {
    const extraNames = moment.tz.names();
    
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
    //return "Pacific/Gambier" // For testing.
}

/**
 * Changes the #timezone select to the user's timezone
 */
const selectUserTimeZone = () => {
    const currentTimeZone = getUserTimezone();
    $(`#timezone`).val(currentTimeZone).change();
}

/**
 * Gets the match details transformed into the current timezone
 * @param {string} timezone 
 */
const getMatchDetailsJSON = (selectedTimeZone = null) => {
    if (selectedTimeZone == null){
        selectedTimeZone = $(`#timezone`).val();
    }

    const matchDetails = [];
    const originalMatchDetails = JSON.parse(matchDetailsJSON);

    /*
    DateTime: "10.08.2024.03:00"
    TeamRoleId: "598636664432099331"
    TimeZone: "America/Los_Angeles"
    UserDiscordId: 171450453068873730
    UserDiscordName: "Xixo"
    userDiscordAvatar: "b32ff4c65f027e4e1db5ed5e727cf80c"
    */

    originalMatchDetails.forEach(md => {
        // DD.MM.YYYY.HH:MM
        const dateTimeParts = md.DateTime.split('.');

        matchDetails.push({
            DateTime: spacetime([dateTimeParts[2], parseInt(dateTimeParts[1])-1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4]], md.TimeZone).goto(selectedTimeZone),
            UserDiscordId: md.UserDiscordId,
            UserDiscordName: md.UserDiscordName,
            userDiscordAvatar: md.userDiscordAvatar,
            TeamRoleId: md.TeamRoleId
        });
    })

    return matchDetails;
}

const drawTooltipResume = (hour, currentScheduledTimes) => {
    let text = `<b>${hour}</b>`;

    if (currentScheduledTimes.length == 0){
        return text;
    }

    const teams = JSON.parse(teamsJSON);
    teams.forEach(team => {
        const currentPlayersTip = currentScheduledTimes.filter(x => x.TeamRoleId == team.RoleId);
        if (currentPlayersTip.length == 0){
            return;
        }

        text += `
            <div class='row mt-1'>
                <hr class='p-0 m-1 ms-0 me-0'>
            </div>
            <div class='row'>
                <b class='p-0 mt-1 mb-1 col-12'>${team.name}</b>
            </div>
            <div class='col-12 text-center'>
        `;

        currentPlayersTip.forEach(player => {
            text += `<b class='col-auto badge'>${player.UserDiscordName}</b>`;
        });

        text += `</div>`

    });

    return text;
}

const loadCalendar = (clean = true, debug = false) => {
    calendar = $('#calendar');
    /**
     * Current select timezone
     */
    const timezone = $(`#timezone`).val();
    /**
     * Amount of header columns drawn in the th.
     * Used to NOT draw extra columns in the body and avoiding to do the check twice
     */
    let headerColumns = 0;

    const scheduledTimes = getMatchDetailsJSON();

    //Clean calendar
    if (clean) {
        calendar.children().remove();
        calendar.append('<thead class="stickyC" style="--sticky-top: 0px;"></thead>');
        $("#calendar thead").append("<tr></tr>");
        calendar.append('<tbody></tbody>');
    }

    const daysToDraw = 3;

    /**
     * Start date in the original time zone. yyyy, mm(-1), dd, hh, mm
     */
    const startDate = spacetime([2024, 7, 9, 0, 0], 'America/Los_Angeles').goto(timezone); // 2024-08-09
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
    $('#calendar thead tr').append(`<th class="text-center borderBR t-time" style="background-color: var(--panel-bg-color)"></th>`);
    days.forEach(day => {

        // If a column if exactly at 12:00am or after the end, skip it.
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
                        <div class="selectableDateDisabled">
                        </div>
                    </td>`;
            } else {
                // Filter all of the dates that match the current drawn column :^)
                const scheduleMatches = scheduledTimes.filter(x => x.DateTime.isEqual(currentDate.add(days.indexOf(day), 'days')));
                const cssActiveClass = `active${scheduleMatches.length}`;
                const tooltipTitle = currentDate.add(days.indexOf(day), 'days').format('time-24');
                const tooltipResume = drawTooltipResume(tooltipTitle, scheduleMatches);


                currentTr.innerHTML += `
                    <td class="calendarCell borderH text-center">
                        <div class="selectableDate ${cssActiveClass}" data-toggle="tooltip" title="${tooltipResume}">
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

/**
 * 
 * @param {HTMLElement} element 
 * @param {Number} option 1: Team / 2: Me / 3: Quit
 */
const changeTab = (element, option) => {
    $(".tab").removeClass('active');
    $(element).addClass('active');

    // TEAM:
    if (option == 1){
        tab = tabValues.team;
        for (let i = 0; i < 10; i++) {
            $(`tbody .active${i}Small`).removeClass(`active${i}Small`).addClass(`active${i}`);
        }
        $(".mySelection").removeClass('mySelection').addClass('mySelectionSmall');
    }

    // ME:
    if (option == 2){
        tab = tabValues.me;
        for (let i = 0; i < 10; i++) {
            $(`tbody .active${i}`).removeClass(`active${i}`).addClass(`active${i}Small`);
        }
        $(".mySelectionSmall").removeClass('mySelectionSmall').addClass('mySelection');
    }
}

const handleMarks = () => {
    // Mark calendar
    $(".selectableDate").on('mouseenter', (e) => {

        let selectionClass = (tab == tabValues.team ? 'mySelectionSmall' : 'mySelection');

        if (e.originalEvent.buttons > 0) { // more than one button that is the right click
            if (mode == modeValues.remove) {
                $(e.currentTarget).removeClass(selectionClass);
            } else {
                $(e.currentTarget).addClass(selectionClass);
            }
        }
    });

    $(".selectableDate").on('mousedown', (e) => {
        let selectionClass = (tab == tabValues.team ? 'mySelectionSmall' : 'mySelection');

        if ($(e.currentTarget).hasClass(selectionClass)) {
            mode = modeValues.remove;
            $(e.currentTarget).removeClass(selectionClass);
        } else {
            mode = modeValues.add;
            $(e.currentTarget).addClass(selectionClass);
        }
    });
}

const handleVisibilityButtons = () => {
    // Mark filter
    $(".toggleCalendarVisibility").on('click, mousedown', (e) => {
        const visibilityToHide = $(e.currentTarget).data("toggle");

        if ($(e.currentTarget).hasClass('forceInactive')) {
            mode = modeValues.remove;
            $(`.active${visibilityToHide}`).removeClass('forceInactive');
            $(`.active${visibilityToHide}Small`).removeClass('forceInactive');
        } else {
            mode = modeValues.add;
            $(`.active${visibilityToHide}`).addClass('forceInactive');
            $(`.active${visibilityToHide}Small`).addClass('forceInactive');
        }
    });

    $(".toggleCalendarVisibility").on('mouseenter', (e) => {
        if (e.originalEvent.buttons > 0) { // more than one button that is the right click
            const visibilityToHide = $(e.currentTarget).data("toggle");

            if (mode == modeValues.remove) {
                $(`.active${visibilityToHide}`).removeClass('forceInactive');
                $(`.active${visibilityToHide}Small`).removeClass('forceInactive');
            } else {
                $(`.active${visibilityToHide}`).addClass('forceInactive');
                $(`.active${visibilityToHide}Small`).addClass('forceInactive');
            }
        }
    });
}


$(document).ready(() => {
    // On start functions
    getMatchDetailsJSON();
    addMomentTimezones();
    selectUserTimeZone();
    handleVisibilityButtons();
    loadCalendar();
    loadTooltips();
});
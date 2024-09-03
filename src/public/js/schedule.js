const modeValues = {
    add: "add",
    remove: "remove"
};

const tabValues = {
    team: "team",
    me: "me"
};

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

let mySelections = [];

/**
 * Viselect selection
 */
let selection = null;

let scheduledTimes = null;



/**
 * Gets the match details transformed into the current timezone
 * @param {string} timezone 
 */
const getMatchDetailsJSON = (selectedTimeZone = null) => {
    if (selectedTimeZone == null) {
        selectedTimeZone = $(`#timezone`).val();
    }

    const matchDetails = [];
    const originalMatchDetails = JSON.parse(matchDetailsJSON);

    originalMatchDetails.forEach(md => {
        // DD.MM.YYYY.HH:MM
        const dateTimeParts = md.DateTime.split('.');

        matchDetails.push({
            DateTime: spacetime([dateTimeParts[2], parseInt(dateTimeParts[1]) - 1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4]], md.TimeZone).goto(selectedTimeZone),
            UserDiscordId: md.UserDiscordId,
            UserDiscordName: md.UserDiscordName,
            userDiscordAvatar: md.userDiscordAvatar,
            TeamRoleId: md.TeamRoleId
        });
    })

    return matchDetails;
}

/**
 * Loads my selections into the "mySelections" array when first loading the page.
 */
const loadMySelections = () => {

    if (leagueOfficial) {
        return;
    }

    mySelections.slice(mySelections.length); // Empty they array
    const selectedTimeZone = $(`#timezone`).val();

    // Get array from page and iterate over it.
    const array = JSON.parse(mySelectionsJSON);
    array.forEach(x => {

        const dateTimeParts = x.DateTime.split('.');

        mySelections.push({
            DateTimeStr: x.DateTime,
            DateTime: spacetime([dateTimeParts[2], parseInt(dateTimeParts[1]) - 1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4]], x.TimeZone).goto(selectedTimeZone),
            TimeZone: x.TimeZone
        });
    })
}

/**
 * Returns, from the screen, the selected cells
 * @returns []
 */
const getCurrentSelectionFromScreen = () => {
    const currentSelection = [];

    const timeZone = $("#timezone").val();

    $(".mySelectionSmall").each((i, e) => {

        const time = $(e).data('time');
        const dateTimeParts = time.split('.');

        currentSelection.push({
            DateTimeStr: time,
            DateTime: spacetime([dateTimeParts[2], parseInt(dateTimeParts[1]) - 1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4]], timeZone),
            TimeZone: timeZone
        });
    });

    $(".mySelection").each((i, e) => {

        const time = $(e).data('time');
        const dateTimeParts = time.split('.');

        currentSelection.push({
            DateTimeStr: time,
            DateTime: spacetime([dateTimeParts[2], parseInt(dateTimeParts[1]) - 1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4]], timeZone),
            TimeZone: timeZone
        });
    });

    return currentSelection;
}

const drawTooltipResume = (hour, currentScheduledTimes, mySelectionsOnTime) => {
    let text = `<b>${hour}</b>`;

    if (currentScheduledTimes.length == 0 && mySelectionsOnTime.length == 0) {
        return text;
    }

    const teams = JSON.parse(teamsJSON);

    teams.forEach(team => {
        const currentPlayersTip = currentScheduledTimes.filter(x => x.TeamRoleId == team.RoleId);

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

        // Only if it's the real team...
        if (team.RoleId === myTeam) {
            mySelectionsOnTime.forEach(mySelections => {
                text += `<b class='col-auto badge'>${myName}</b>`;
            });
        }

        text += `</div>`

    });

    return text;
}

const loadCalendar = (debug = false) => {

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

    let maxAmountOfPlayers = 0;

    scheduledTimes = getMatchDetailsJSON();

    //Clean calendar
    calendar.children().remove();
    calendar.append('<thead class="stickyC" style="--sticky-top: 0px;"></thead>');
    $("#calendar thead").append("<tr></tr>");
    calendar.append('<tbody></tbody>');


    const startDateParts = matchInfoStartDate.split('.');
    const endDateParts = matchInfoEndDate.split('.');

    /**
     * Start date in the original time zone. yyyy, mm(-1), dd, hh, mm
     */
    const startDate = spacetime([startDateParts[2], parseInt(startDateParts[1]) - 1, startDateParts[0], startDateParts[3], startDateParts[4]], matchInfoDateTimeZone);

    /**
     * Start date in the user's time zone (it will start at 00:00 of the first day)
     */
    const localStartDate = spacetime([startDateParts[2], parseInt(startDateParts[1]) - 1, startDateParts[0], startDateParts[3], startDateParts[4]], matchInfoDateTimeZone).goto(timezone).startOf('day'); // Will start at 00:00

    /**
     * End date in the original time zone. yyyy, mm(-1), dd, hh, mm
     */
    const endDate = spacetime([endDateParts[2], parseInt(endDateParts[1]) - 1, endDateParts[0], endDateParts[3], endDateParts[4]], matchInfoDateTimeZone);

    /**
     * End date in the user's time zone (it will start at 00:00 of the first day)
     */
    const localEndDate = spacetime([endDateParts[2], parseInt(endDateParts[1]) - 1, endDateParts[0], endDateParts[3], endDateParts[4]], matchInfoDateTimeZone).goto(timezone).startOf('day'); // Will start at 00:00

    let currentDate = localStartDate;

    /**
     * Holds an array of days to draw. Adds one more to the daysToDraw variable, 
     * the idea if that if it ends at 00:00 it will not draw the column
     */
    const days = buildDayArray(startDate, localStartDate, endDate, localEndDate);
    headerColumns = days.length;

    // Create headers - Empty spacer
    $('#calendar thead tr').append(`<th class="text-center borderBR t-time" style="background-color: var(--panel-bg-color-left)"></th>`);
    days.forEach(day => {
        $('#calendar thead tr').append(`
                <th class="text-center borderBR w-auto pb-3" style="background-color: var(--panel-bg-color-top)">
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
                <th rowspan="4" class="calendarCell borderH text-center timeText" style="background-color: var(--panel-bg-color-left);">
                    ${i / 4}:00
                </th>`;
        }

        // For each day, create a TD
        days.forEach(day => {

            const indexOfDay = days.indexOf(day);

            // If the last day starts at midnight, skip it 'cause it's the end.
            if (indexOfDay == days.length - 1 && indexOfDay >= headerColumns) {
                return;
            }

            // If it is before the start date, draw "not available spaces"
            if (currentDate.add(indexOfDay, 'days').isBefore(startDate) || currentDate.add(indexOfDay, 'days').isAfter(endDate) || currentDate.add(indexOfDay, 'days').isEqual(endDate)) {
                currentTr.innerHTML += `
                    <td class="calendarCell borderH text-center">
                        <div class="selectableDateDisabled">
                        </div>
                    </td>`;
            } else {
                // Filter all of the dates that match the current drawn column :^)
                const scheduleMatchesOnTime = scheduledTimes.filter(x => x.DateTime.isEqual(currentDate.add(indexOfDay, 'days')));
                const mySelectionsOnTime = mySelections.filter(x => x.DateTime.goto(timezone).isEqual(currentDate.add(indexOfDay, 'days')));

                const activeAmount = scheduleMatchesOnTime.length + mySelectionsOnTime.length > 10 ? 10 : scheduleMatchesOnTime.length + mySelectionsOnTime.length;
                // Save the most amount of players to deactivate the rest of the filters
                if (activeAmount > maxAmountOfPlayers){
                    maxAmountOfPlayers = activeAmount;
                }

                const cssInactiveClass = $(`.toggleCalendarVisibility.active${activeAmount}`).hasClass('forceInactive') ? 'forceInactive' : '';

                const cssActiveClass = (tab == tabValues.team ? `active${activeAmount} ${cssInactiveClass}` : `active${activeAmount}Small ${cssInactiveClass}`);
                const tooltipTitle = currentDate.add(indexOfDay, 'days').format('time-24');
                const tooltipResume = drawTooltipResume(tooltipTitle, scheduleMatchesOnTime, mySelectionsOnTime);
                const selectionClass = mySelectionsOnTime.length > 0 ? (tab == tabValues.me ? 'mySelection' : 'mySelectionSmall') : '';

                currentTr.innerHTML += `
                    <td class="calendarCell borderH text-center">
                        <div class="selectableDate ${cssActiveClass} ${selectionClass}" data-time="${currentDate.add(indexOfDay, 'days').unixFmt('dd.MM.yyyy.HH.mm')}" title="${tooltipResume}" data-toggle="tooltip" data-player-amount="${activeAmount}">
                        </div>
                    </td>`;
            }
        });

        currentDate = currentDate.add(15, 'minutes');
        $("#calendar tbody").append(currentTr);
    }

    // Show the max amount of players, rn
    console.log("maxAmountOfPlayers", maxAmountOfPlayers);

    if (debug) {
        console.log('startDate', startDate.format('nice'));
        console.log('endDate', endDate.format('nice'));
        console.log('localStartDate', localStartDate.format('nice'));
        console.log('localEndDate', localEndDate.format('nice'));
        console.log("days:", days);
        console.log("game date:", startDate.format('time'));
    }

    handleMarks();
    loadTooltips();
}

const buildDayArray = (startDate, localStartDate, endDate, localEndDate) => {
    const days = [];

    let amountOfDays = localStartDate.diff(localEndDate.add(1, 'days'), 'days');

    if (localEndDate.diff(endDate, 'hours') > 0){
        amountOfDays++;
    }

    const language = localStorage.getItem('language') ?? "en";

    const generalLanguage = languageDefinition.filter(x => x.page == '*')[0];
    const languageObj = generalLanguage.strings.SpaceTime[language];

    for (let i = 0; i < amountOfDays; i++) {
        const currentDate = localStartDate.add(i, 'days').i18n(languageObj);

        if (currentDate.isAfter(localEndDate) || (currentDate.isEqual(endDate) && endDate.format('time') === '12:00am')) {
            continue;
        }

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
    $('body').tooltip({
        selector: '.selectableDate',
        html: true,
        animation: false,
        track: true,
        content: () => $(this).attr('title')
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
    if (option == 1) {
        tab = tabValues.team;
        for (let i = 0; i <= 10; i++) {
            $(`tbody .active${i}Small`).removeClass(`active${i}Small`).addClass(`active${i}`);
        }
        $(".mySelection").removeClass('mySelection').addClass('mySelectionSmall');
    }

    // ME:
    if (option == 2) {
        tab = tabValues.me;
        for (let i = 0; i <= 10; i++) {
            $(`tbody .active${i}`).removeClass(`active${i}`).addClass(`active${i}Small`);
        }
        $(".mySelectionSmall").removeClass('mySelectionSmall').addClass('mySelection');
    }
}

const handleMarks = () => {
    if (leagueOfficial) {
        return;
    }

    if (selection != null){
        selection.destroy();
    }

    /* CONFIG VISELECT */
    selection = new SelectionArea({
        selectables: ['.selectableDate'],
        boundaries: ['tbody'],
        behaviour: {
            intersect: "touch"
        },
        features: {
            touch: true,
            // Range selection.
            range: false,
            // Configuration in case a selectable gets just clicked.
            singleTap: {
                // Enable single-click selection (Also disables range-selection via shift + ctrl).
                allow: true,
                // 'native' (element was mouse-event target) or 'touch' (element visually touched).
                intersect: 'native'
            }
        }
    }).on("start", ({ store, event }) => {
        if ((event).shiftKey) {
            mode = modeValues.remove;
        } else {
            mode = modeValues.add;
        }
        selection.deselect(null, true);
    }).on(
        "move",
        ({
            store: {
                changed: { added, removed }
            }
        }) => {
            for (const el of added) {
                el.classList.add("mySelectionTemp");
            }

            for (const el of removed) {
                el.classList.remove("mySelectionTemp");
            }
        }
    ).on("stop", async ({ store: { stored } }) => {
        const selectionClass = (tab == tabValues.team ? 'mySelectionSmall' : 'mySelection');
        let action = null;

        for (const el of stored) {
            if ($(el).hasClass('mySelection') || $(el).hasClass('mySelectionSmall')) {
                el.classList.remove('mySelection');
                el.classList.remove('mySelectionSmall');
                action = modeValues.remove;
            } else {
                el.classList.add(selectionClass);
                action = modeValues.add;
            }

            // Gets the current player amount and add/subtracts 1
            const playerAmount = parseInt($(el).attr('data-player-amount')) + (action == modeValues.add ? 1 : -1);

            const activeClass = Array.from(el.classList).filter(x => x != "forceInactive" && x.indexOf("active") > -1)[0];
            const isSmall = activeClass.indexOf('Small') > -1;

            let classNumber = playerAmount;

            if (classNumber > 10) {
                classNumber = 10;
            }
            if (classNumber < 0) {
                classNumber = 0;
            }

            el.classList.remove("mySelectionTemp");
            el.classList.remove(activeClass); // remove old class
            const newClass = `active${classNumber}${isSmall ? 'Small' : ''}`;
            el.classList.add(newClass); // adds new class

            $(el).attr('data-player-amount', playerAmount);

            // Check if the filter is marked as active/inactive. If it is, add the ForceInactive class, if it isn't, remove it.
            if ($(`.toggleCalendarVisibility.active${classNumber}`).first().hasClass('forceInactive') && !Array.from(el.classList).some(x => x == "forceInactive")){
                el.classList.add('forceInactive');
            }

            if (!$(`.toggleCalendarVisibility.active${classNumber}`).first().hasClass('forceInactive') && Array.from(el.classList).some(x => x == "forceInactive")){
                el.classList.remove('forceInactive');
            }
        }

        selection.clearSelection(true, true);
        selection.deselect();

        // Save on end!
        const currentSelection = getCurrentSelectionFromScreen();
        if (!areArraysEqual(currentSelection, mySelections)) {
            toastr.clear(); // You never know :^)

            mySelections.splice(mySelections.length);
            mySelections = [...currentSelection];

            // send to DDBB
            const update = await $.ajax({
                type: 'PUT',
                url: '',
                contentType: 'application/json',
                data: JSON.stringify(currentSelection),
                success: (res) => res,
                onerror: (error) => error
            });

            if (update.res) {
                toastr.success(update.msg, { timeout: 1500 });

                // Redraw tooltips!

                // Get current time
                const timeZone = $("#timezone").val();
                scheduledTimes = getMatchDetailsJSON();

                for (const el of stored) {
                    const dateTimeParts = $(el).data('time').split('.');
                    const currentDate = spacetime([dateTimeParts[2], parseInt(dateTimeParts[1]) - 1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4]], timeZone);
                    const tooltipTitle = currentDate.format('time-24');
                    const scheduleMatchesOnTime = scheduledTimes.filter(x => x.DateTime.isEqual(currentDate));
                    const mySelectionsOnTime = mySelections.filter(x => x.DateTime.goto(timeZone).isEqual(currentDate));
                    const tooltipContent = drawTooltipResume(tooltipTitle, scheduleMatchesOnTime, mySelectionsOnTime);
                    
                    // Step 1: Dispose
                    $(el).tooltip('dispose');   
                    // Step 2: Change title
                    $(el).attr('title', tooltipContent)
                    // Step 3: Create again
                    $(el).tooltip({             
                        html: true,
                        animation: false,
                        track: true,
                        content: () => $(this).attr('title')
                    });

                }

            } else {
                toastr.error(update.msg);
            }
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

const areArraysEqual = (currentSelection, oldSelection) => {
    return currentSelection.sort().toString() == oldSelection.sort().toString();
}

// On start functions
$(document).ready(() => {
    leagueOfficial = (leagueOfficial == "true"); // ew

    getMatchDetailsJSON();
    addMomentTimezones();
    selectUserTimeZone();
    handleVisibilityButtons();
    loadMySelections();

    loadCalendar();
    $("#schedule").fadeIn(100);
});
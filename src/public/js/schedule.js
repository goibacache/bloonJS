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

        matchDetails.push({
            DateTime: new moment.tz(md.DateTime, "DD.MM.YYYY.HH.mm", md.TimeZone).tz(selectedTimeZone),
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

        mySelections.push({
            DateTimeStr: x.DateTime,
            DateTime: new moment.tz(x.DateTime, "DD.MM.YYYY.HH.mm", x.TimeZone).tz(selectedTimeZone),
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

        currentSelection.push({
            DateTimeStr: time,
            DateTime: new moment.tz(time, 'DD.MM.YYYY.HH:mm', timeZone),
            TimeZone: timeZone
        });
    });

    $(".mySelection").each((i, e) => {

        const time = $(e).data('time');

        currentSelection.push({
            DateTimeStr: time,
            DateTime: new moment.tz(time, 'DD.MM.YYYY.HH:mm', timeZone),
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
            text += `<b class='col-auto badge tooltip-text'>${player.UserDiscordName}</b>`;
        });

        // Only if it's the real team...
        if (team.RoleId === myTeam) {
            mySelectionsOnTime.forEach(mySelections => {
                text += `<b class='col-auto badge tooltip-text'>${myName}</b>`;
            });
        }

        text += `</div>`

    });

    return text;
}

/**
 * Checks if the current moment object is the same day as one created with the same day and hours and minutes.
 * Used mainly as a crude check for Daylight Saving Time changes as moment will "jump" to the next real date if that occurs.
 * @param {moment} currentDay 
 * @param {*} hours 
 * @param {*} minutes 
 */
const isSameDay = (currentDay, hours, minutes) => {
    const proposedDateObjectStr = `${currentDay.format('DD-MM-YYYY')} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    if (!(currentDay.format("DD-MM-YYYY HH:mm") == proposedDateObjectStr)){
        console.log(`${currentDay.format('DD-MM-yyyy HH:mm')} is not the same as ${proposedDateObjectStr}`);
        return false;
    }
    return true;
}

// Get current Moment
const getCurrentMomentTimeDate = (currentDay, hours, minutes) => {
    const proposedDateObjectStr = `${currentDay.format('DD-MM-YYYY')} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    return new moment(proposedDateObjectStr, "DD-MM-YYYY HH:mm");
}

/**
 * The main drawing function that creates and shows the giant date table.
 * @param {*} debug 
 */
const loadCalendar = (debug = false) => {

    // Load locale (language) for moment.
    const selectedLanguage = localStorage.getItem('language') ?? "en";
    moment.locale(selectedLanguage);

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
    const startDate = new moment.tz(matchInfoStartDate, "DD.MM.YYYY.HH.mm", matchInfoDateTimeZone);

    /**
     * Start date in the user's time zone (it will start at 00:00 of the first day)
     */
    const localStartDate = new moment.tz(matchInfoStartDate, "DD.MM.YYYY.HH.mm", timezone).startOf('day');

    /**
     * End date in the original time zone. yyyy, mm(-1), dd, hh, mm
     */
    const endDate = new moment.tz(matchInfoEndDate, "DD.MM.YYYY.HH.mm", matchInfoDateTimeZone);

    /**
     * End date in the user's time zone (it will start at 00:00 of the first day)
     */
    const localEndDate = new moment.tz(matchInfoEndDate, "DD.MM.YYYY.HH.mm", timezone).startOf('day');

    let currentDate = localStartDate.clone();

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

    let hours = 0;
    let minutes = 0;
    const currentTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const tableColumns = [];
    tableColumns[0] = []; // Create hours indicator

    for (var i = 0; i < 24; ++i) { // Create hours
        // TODO: Add setting for 24hrs or 12Hrs AM/PM date.
        tableColumns[0][i] = `${i.toString().padStart(2, "0")}:00`;
    }

    days.forEach(day => {
        const currentDayIndex = days.indexOf(day);
        tableColumns[currentDayIndex+1] = []; // Create array for current column - First row is for dates
        hours = 0;
        minutes = 0;

        for (var i = 0; i < 96; ++i) { // Amount of hours/rows
            const currentDateInRow = new moment.tz(`${day.dateObject.format("DD-MM-YYYY")} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`, "DD-MM-YYYY HH:mm", timezone);

            // Date checks
            const isSameDayRes = isSameDay(currentDateInRow, hours, minutes); // For DST
            const isBeforeStart = currentDateInRow.isBefore(startDate);
            const isAfterEnd = currentDateInRow.isAfter(endDate);
            const isEqualToEndDate = currentDateInRow.isSame(endDate)

            if (isSameDayRes == false || isBeforeStart == true || isAfterEnd == true || isEqualToEndDate == true){
                tableColumns[currentDayIndex+1][i] = `
                    <td class="calendarCell borderH text-center">
                        <div class="selectableDateDisabled">
                        </div>
                    </td>`; // First row is for dates
            }else{
                // Draw the whole freaking thing :v
                // Filter all of the dates that match the current drawn column :^)
                const currentDateWithTime = getCurrentMomentTimeDate(day.dateObject, hours, minutes);
                const scheduleMatchesOnTime = scheduledTimes.filter(x => x.DateTime.isSame(currentDateWithTime));
                const mySelectionsOnTime = mySelections.filter(x => x.DateTime.tz(timezone).isSame(currentDateWithTime));

                const activeAmount = scheduleMatchesOnTime.length + mySelectionsOnTime.length > 10 ? 10 : scheduleMatchesOnTime.length + mySelectionsOnTime.length;
                // Save the most amount of players to deactivate the rest of the filters
                if (activeAmount > maxAmountOfPlayers){
                    maxAmountOfPlayers = activeAmount;
                }

                const cssInactiveClass = $(`.toggleCalendarVisibility.active${activeAmount}`).hasClass('forceInactive') ? 'forceInactive' : '';

                const cssActiveClass = (tab == tabValues.team ? `active${activeAmount} ${cssInactiveClass}` : `active${activeAmount}Small ${cssInactiveClass}`);
                const tooltipTitle = currentDateWithTime.format('HH:mm');
                const tooltipResume = drawTooltipResume(tooltipTitle, scheduleMatchesOnTime, mySelectionsOnTime);
                const selectionClass = mySelectionsOnTime.length > 0 ? (tab == tabValues.me ? 'mySelection' : 'mySelectionSmall') : '';

                // ${currentDateWithTime.format('DD MM yyyy HH mm')}
                tableColumns[currentDayIndex+1][i] = `
                        <div class="selectableDate ${cssActiveClass} ${selectionClass}" data-time="${currentDateWithTime.format('DD.MM.yyyy.HH.mm')}" title="${tooltipResume}" data-toggle="tooltip" data-player-amount="${activeAmount}">
                            
                        </div>`;
            }
            
            // Add 15 minutes and check if it goes over an hour
            minutes += 15;
            if (minutes % 60 == 0){
                minutes = 0;
                hours++;
            }
        }
    });

    const tbody = document.createElement("tbody");

    // Draw the table that's in memory.
    for (var i = 0; i < 96; ++i) {
        // Create a TR for every row :^)
        const currentTr = document.createElement('tr');
        
        // Create TH with data in the first index of the array 😬
        if (i % 4 == 0){
            const th = document.createElement('td');

            th.rowSpan = 4;
            th.classList = "calendarCell borderH text-center timeText";
            th.style = "background-color: var(--panel-bg-color-left);"
            th.innerHTML = tableColumns[0][i/4]; // Load from the time column
            currentTr.appendChild(th);
        }

        // For each day add a TD
        days.forEach(day => {
            const td = document.createElement('td');
            const currentDayIndexPlus = days.indexOf(day)+1;

            td.classList = "calendarCell borderH text-center";
            td.innerHTML = tableColumns[currentDayIndexPlus][i]; // indexOf(day)+1 because the first one is just the headers

            currentTr.appendChild(td);
        });
        
        tbody.appendChild(currentTr);
    }

    $("tbody").replaceWith(tbody);

    if (debug) {
        console.log('startDate', startDate.format('DD-MM-YYYY HH:mm'));
        console.log('endDate', endDate.format('DD-MM-YYYY HH:mm'));
        console.log('localStartDate', localStartDate.format('DD-MM-YYYY HH:mm'));
        console.log('localEndDate', localEndDate.format('DD-MM-YYYY HH:mm'));
        console.log("days:", days);
        console.log("game date:", startDate.format('HH:mm'));
        console.log("maxAmountOfPlayers", maxAmountOfPlayers);
    }

    handleMarks();
    loadTooltips();
    drawPlayersThatFilledTheSchedule();
}

const buildDayArray = (startDate, localStartDate, endDate, localEndDate) => {
    const days = [];

    let amountOfDays = localEndDate.clone().add(1, 'days').diff(localStartDate, 'days');

    // TODO: Check this out, I don't think it's ok.
    const dateDiff = Math.abs(Math.abs(localEndDate.utcOffset()) - Math.abs(parseInt(endDate.utcOffset()))) / 60;
    if (dateDiff > 0){
        amountOfDays += Math.ceil(dateDiff/24);
    }

    for (let i = 0; i < amountOfDays; i++) {
        const currentDate = localStartDate.clone().add(i, 'days'); // 

        if (currentDate.isAfter(localEndDate) || (currentDate.isSame(endDate) && endDate.format('HH:mmA') === '00:00AM')) {
            continue;
        }

        days.push({
            monthDay: currentDate.format('MMMM Do'),
            nameOfDay: currentDate.format('dddd'),
            startTime: currentDate.format('HH:mmA'),
            dateObject: currentDate,
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

                // Redraw players that filled the schedule!
                drawPlayersThatFilledTheSchedule();

                // Get current time
                const timeZone = $("#timezone").val();
                scheduledTimes = getMatchDetailsJSON();

                for (const el of stored) {
                    const time = $(el).data('time');
                    const currentDate = new moment.tz(time, "DD.MM.YYYY.HH:mm", timeZone);
                    const tooltipTitle = currentDate.format('HH:mm');
                    const scheduleMatchesOnTime = scheduledTimes.filter(x => x.DateTime.isSame(currentDate));
                    const mySelectionsOnTime = mySelections.filter(x => x.DateTime.tz(timeZone).isSame(currentDate));
                    const tooltipContent = drawTooltipResume(tooltipTitle, scheduleMatchesOnTime, mySelectionsOnTime);
                    
                    // Redraw tooltips!
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

const drawPlayersThatFilledTheSchedule = () => {

    // Clean everything but the empty message
    $("#participantPanel").children().not("#EmptyParticipantList").remove();

    const matchDetails = getMatchDetailsJSON();

    if(matchDetails.length == 0 && mySelections.length == 0){
        $("#EmptyParticipantList").show();
    }else{
        $("#EmptyParticipantList").hide();
    }

    const teams = JSON.parse(teamsJSON);

    teams.forEach(team => {
        const userDiscordIds = matchDetails.filter(x => x.TeamRoleId == team.RoleId).map(x => x.UserDiscordId).filter((value, index, current_value) => current_value.indexOf(value) == index);

        if (userDiscordIds == null && userDiscordIds == undefined){
            return;
        }

        if (userDiscordIds.length == 0 && mySelections.length == 0){
            return;
        }

        // If I'm not a league official, I only need to see my own team
        if (!leagueOfficial && team.RoleId != myTeam){
            return;
        }

        if (teams.indexOf(team) > 0){
            $("#participantPanel").append(`<br/>`);    
        }

        // Add team name
        $("#participantPanel").append(`<p class="participantTitles m-0 ms-1 me-1">${team.name}</p>`);

        // Check my times, if it is my team.
        if (team.RoleId == myTeam){
            if (mySelections.length > 0){
                $("#participantPanel").append(`<p class="badge m-0 ms-1 me-1">${myName}</p>`);
            }
        }

        // Add team's participants
        userDiscordIds.forEach(userDiscordId => {
            const player = matchDetails.find(x => x.UserDiscordId == userDiscordId);
            $("#participantPanel").append(`<p class="badge m-0 ms-1 me-1">${player.UserDiscordName}</p>`);
        });
    })
    
}

// On start functions
$(() => {
    leagueOfficial = (leagueOfficial == "true"); // ew

    getMatchDetailsJSON();
    addMomentTimezones();
    selectUserTimeZone();
    handleVisibilityButtons();
    loadMySelections();

    loadCalendar();
    $("#schedule").fadeIn(100);
});
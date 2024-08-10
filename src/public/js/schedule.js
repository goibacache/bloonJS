$(document).ready(() => {

    let calendar = null;
    let mode = "add";

    const loadCalendar = (timezone = "America/Santiago", clean = true) => {
        calendar = $('#calendar');

        //Clean calendar
        if (clean) {
            calendar.children().remove();
            calendar.append('<thead></thead>');
            $("#calendar thead").append("<tr></tr>");
            calendar.append('<tbody></tbody>');
            
        }

        /*
            Remember: YYYY/M/D 
            Month: 0 based 
            Days: 1 based
            🙄 IK
        */
       
        const startDate = spacetime([2024, 7, 9], 'America/Los_Angeles').goto(timezone); // 2024-08-09
        const localStartDate = spacetime([2024, 7, 9], timezone);
        //const endDate = spacetime([2024, 7, 9], 'America/Los_Angeles').add(3, 'days').goto(timezone); // 2024-08-09
        //let currentDate = startDate;

        /**
         * Holds an array of days to draw
         */
        const days = buildDayArray(4, startDate);

        // Create headers

        // Empty spacer
        $('#calendar thead tr').append(`<th class="text-center borderL t-time" style="background-color:black"></th>`); 
        days.forEach(day => {
            // If the last day starts at midnight, skip it 'cause it's the end.
            if (days.indexOf(day) == days.length-1){
                if (day.startTime == "12:00am"){
                    return;
                }
            }
            $('#calendar thead tr').append(`
                <th class="text-center borderL t-time" style="background-color:black">
                    <p class="m-0 small">${day.monthDay}</p>
                    <p class="m-0 small">${day.nameOfDay}</p>
                </th>`
            );
        });

        for (var i = 0; i < 96; ++i) { // Amount of hours/rows

            // Create TR
            const currentTr = document.createElement('tr');

            // Create first column only on the first iteration
            if (i % 4 == 0){
                currentTr.innerHTML += `
                <td rowspan="4" class="calendarCell borderH text-center timeText" style="background-color:black;">
                    ${i/4}:00
                </td>`;
            }

            // For each day, create a TD
            days.forEach(day => {
                // If the last day starts at midnight, skip it 'cause it's the end.
                if (days.indexOf(day) == days.length-1 && day.startTime == "12:00am"){
                    return;
                }
                //if (i % 4 != 0){
                    // Create current calendar space
                    currentTr.innerHTML += `
                    <td class="calendarCell borderL text-center">
                        <div class="selectableDate">
                        </div>
                    </td>`;
                //}
                
            });

            $("#calendar tbody").append(currentTr);
        }
            

        console.log("days:", days);
        console.log("game date:", startDate.format('time-'));
        console.log("local start date:", localStartDate);

        
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
            html: true
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



    // On start functions
    handleMarks();
    handleVisibilityButtons();
    loadCalendar();
    loadTooltips();
});
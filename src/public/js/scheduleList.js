let table;

const loadTable = () => {
    table = $('#matchTable').DataTable({
        responsive: true,
        ajax: {
            url: '/scheduleList/listMatches',
            type: "POST",
            data: (d) => {
                d.FutureOrPast = $("input[type=radio][name=futurePastSelector]:checked").val();
            },
            dataSrc: (data) => {
                if (data.res) {
                    return data.matches;
                } else {
                    toastr.error(data.msg);
                    return [];
                }
            }
        },
        language: {
            emptyTable: () => {
                return getKeyFromLanguage('schedulelisttable', 'emptyTable');;
            }
        },
        layout: {
            topStart: () => {
                return `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="futurePastSelector" id="futurePastSelector" checked value="Future" onchange="reloadTable()">
                        <label id="UpcomingText" class="form-check-label" for="futurePastSelector">
                            Upcoming
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="futurePastSelector" id="futurePastSelector" onchange="reloadTable()" value="Past">
                        <label id="PreviousText" class="form-check-label" for="futurePastSelector">
                            Previous
                        </label>
                    </div>
                    
                `
            },
            // topEnd: null,
            bottomStart: null,
            //bottomEnd: null
        },
        ordering: false,
        order: [], // use data order
        columnDefs: [
            { visible: false, targets: 5 },
            { className: 'p-0', targets: "_all" },
            // { className: 'text-end', targets: [3, 4] },
            { className: 'text-center', targets: [1, 2, 3, 4, 5, 6] },
            // { responsivePriority: 1, targets: [0, 6] },
        ],
        columns: [
            { data: 'Name' },
            { data: 'Team1Name', width: "90px" },
            { data: 'Team2Name', width: "90px" },
            {
                data: 'StartDate', render: (data) => {
                    const dateParts = data.split('.');
                    return `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
                },
                width: "110px"
            },
            {
                data: 'EndDate', render: (data) => {
                    const dateParts = data.split('.');
                    return `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
                },
                width: "110px"
            },
            { data: 'MatchTime' },
            {
                data: 'Name', render: (data, type, row) => {
                    const linkText = getKeyFromLanguage('schedulelisttable', 'goToScheduleButton');
                    const buttonClass = row.MatchTime == "Past" ? "btn-secondary" : "btn-primary";
                    return `<a type="button" class="goToScheduleButton btn ${buttonClass}" style="height: 26px; padding-top: 0;" href="/schedule/${row.Name.replace(/ /g, '-')}-${row.Id}">${linkText}</a>`;
                },
                width: "150px"
            },
        ]
    });
}

const reloadTable = () => {
    if (table != null) {
        table.ajax.reload();
    }
}

// On start functions
$(document).ready(() => {
    loadTable();
});
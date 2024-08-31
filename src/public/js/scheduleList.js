let table;

const loadTable = () => {
    console.log("loadTable");
    table = $('#matchTable').DataTable( {
        responsive: true,
        ajax: {
            url: '/scheduleList/matches',
            type: "GET",
            dataSrc: (data) => {
                console.log(data);
                if (data.res){
                    return data.matches;
                }else{
                    toastr.error(data.msg);
                    return null;
                }
            }
        },
        layout: {
            topStart: () => {
                return `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="futurePastSelector" id="futurePastSelector" checked onclick="seeFuture()">
                        <label id="UpcomingText" class="form-check-label" for="futurePastSelector">
                            Upcoming
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="futurePastSelector" id="futurePastSelector" onclick="seePast()">
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
            { className: 'text-end', targets: [3, 4] },
            { className: 'text-center', targets: 6 }
            // { responsivePriority: 1, targets: [0, 6] },
        ],
        columns: [
            { data: 'Name' },
            { data: 'Team1Name' },
            { data: 'Team2Name' },
            { data: 'StartDate', render: (data) => {
                    const dateParts = data.split('.');
                    return `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
                } 
            },
            { data: 'EndDate', render: (data) => {
                    const dateParts = data.split('.');
                    return `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
                } 
            },
            { data: 'MatchTime' },
            { data: 'Name', render: (data, type, row) => {
                    const buttonClass = row.MatchTime == "Past" ? "btn-secondary" : "btn-primary";
                    return `<button type="button" class="btn ${buttonClass}" style="height: 26px; padding-top: 0;" onclick="goto('/schedule/${row.Name.replace(/ /g, '-')}-${row.Id}')">Schedule</a>`;
                } 
            },
        ]
    } );

    seeFuture();
}

const seeFuture = () => {
    if (table != null){
        table.columns(5).search("future").draw();
    }
}

const seePast = () => {
    if (table != null){
        table.columns(5).search("past").draw();
    }
}

// On start functions
$(document).ready(() => {
    loadTable();
});
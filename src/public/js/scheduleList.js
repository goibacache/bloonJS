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
                    <input id="rdbFuture"   type="radio" name="futurePastSelector" class="ms-3" checked  onclick="seeFuture()"></input><p class="p-0 m-0 ms-1 me-2">Future</p>
                    <input id="rdbPast"     type="radio" name="futurePastSelector" class="ms-1"          onclick="seePast()"></input><p class="p-0 m-0 ms-1">Past</p>
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
            { className: 'p-0', targets: "_all" }
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
                    return `<button type="button" class="btn btn-primary" style="height: 26px; padding-top: 0;" onclick="goto('/schedule/${row.Name.replace(/ /g, '-')}-${row.Id}')">Schedule</a>`;
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
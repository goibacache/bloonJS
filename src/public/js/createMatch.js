const matches = [];

const suggestMatchName = () => {
    const team1 = $("#team1Select option:selected");
    const team2 = $("#team2Select option:selected");

    if (team1.val() == "0" || team2.val() == "0"){
        return;
    }

    $("#name").val(`${team1.attr('data-shortname')} vs ${team2.attr('data-shortname')}`);
}

const loadTooltips = () => {
    $('body').tooltip({
        selector: 'input[data-toggle="tooltip"]',
        html: true,
        animation: false,
        track: true,
        content: () => $(this).attr('title')
    });
}

const clearForm = () => {
    // Clear
    $("#team1Select").val("0");
    $("#team2Select").val("0");
    $("#name").val("");
    // $("#startDate").val("");
    // $("#endDate").val("");
}

const addMatchToList = () => {
    if ($("#team1Select").val() == "0" || $("#team2Select").val() == "0"){
        toastr.warning("Please select a team in the form");
        return;    
    }

    if ($("#team1Select").val() == $("#team2Select").val()){
        toastr.warning("A team can't fight itself");
        return;    
    }

    if ($("#name").val() == ""){
        toastr.warning("Can't add a match with no name");
        return;    
    }

    // Hide empty
    $("#empty").hide();

    // Check if match is already on the list
    const matchFound = isMatchAlreadyScheduled($("#team1Select option:selected").val(), $("#team2Select option:selected").val());
    if (matchFound != null){
        toastr.warning(`Match already exists under the name ${matchFound.matchName}`);

        // Scroll to position
        
        $("#tableContainer").scrollTop(matches.indexOf(matchFound) * 20);

        $(`#match${matchFound.id}`).addClass("glow");

        setTimeout(() => {
            $(`#match${matchFound.id}`).removeClass("glow");
        }, 750);
        return;
    }

    const newId = matches.length == 0 ? 0 : Math.max(...matches.map(x => x.id)) + 1;

    matches.push({
        id:         newId,
        team1Id:    $("#team1Select option:selected").val(),
        team1Name:  $("#team1Select option:selected").attr('data-shortname'),
        team2Id:    $("#team2Select option:selected").val(),
        team2Name:  $("#team2Select option:selected").attr('data-shortname'),
        matchName:  $("#name").val()
    });

    const tr = `
    <tr id="match${newId}" class="transition">
        <td>${$("#name").val()}</td>
        <td>${$("#team1Select option:selected").attr('data-shortname')}</td>
        <td>${$("#team2Select option:selected").attr('data-shortname')}</td>
        <td class="text-center">
            <button class="btn btn-danger" type="button" onclick="deleteRow(${newId})" style="height: 22px;  padding-top: 0px; padding-bottom: 0px; color: white;">X</button>
        </td>
    </tr>
`;

    $("tbody").append(tr);

    toastr.info("Match added to temp list");

    clearForm();
}

const processMatches = async () => {
    
    if ($("#startDate").val() == ""){
        toastr.info("Please select start date");
        return;    
    }

    if ($("#endDate").val() == ""){
        toastr.info("Please select end date");
        return;    
    }

    const createMatches = await $.ajax({
        type: 'POST',
        url: '/createMatch',
        data: `${$("#createMatchForm").serialize()}&matches=${JSON.stringify(matches)}`,
        success: (res) => res,
        onerror: (error) => {
            console.error('ERROR!: ' + error);
            return error;
        }
    });

    if (createMatches.res){
        toastr.success("Matches created successfully!");
        $("tbody>tr:not(#empty)").remove();
        $("#empty").show();
    }else{
        toastr.error(createMatches.msg);
    }
}

const isMatchAlreadyScheduled = (team1, team2) => {
    return matches.find(x => (x.team1Id == team1 && x.team2Id == team2) || (x.team1Id == team2 && x.team2Id == team1))
}

const deleteRow  = (rowId) => {
    if (confirm("Do you want to delete this row?")){

        const rowIndex = matches.indexOf(matches.find(x => x.id == rowId))
        console.log("matches before", matches);
        console.log("rowIndex", rowIndex);
        matches.splice(rowIndex, 1);
        $(`#match${rowId}`).remove();

        console.log("matches after", matches);

        toastr.info("Row deleted");
    }
}

// On start functions
$(document).ready(() => {
    addMomentTimezones();
    selectUserTimeZone();
    loadTooltips();
    clearForm();
});
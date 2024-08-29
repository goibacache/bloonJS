const requestException = async () => {
    const data = $("#formRequestException").serialize();

    $("#team").prop( "disabled", true );

    const joinTeam = await $.ajax({
        type: 'POST',
        url: '/joinTeam',
        data: data,
        success: (res) => res,
        onerror: (error) => {
            console.error('ERROR!: ' + error);
            return error;
        }
    });
    
    if (joinTeam.res){
        toastr.success("Exclusion sent!");
        $("#team").prop( "disabled", true );
        $("#requestExceptionbtn").prop( "disabled", true );
    }else{
        $("#team").prop( "disabled", false );
        $("#requestExceptionbtn").prop( "disabled", false );
        toastr.error(joinTeam.msg);
    }
}


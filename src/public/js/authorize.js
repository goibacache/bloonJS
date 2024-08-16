var playerName = "";

const getCode = async () => {

    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    if (urlParams.size != 4) {
        window.location.href = window.location.origin; // Send to login
        return;
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1)); // get fragments
    const [accessToken, tokenType, expiresIn] = [fragment.get('access_token'), fragment.get('token_type'), fragment.get('expires_in')];

    // Hide the token, just if the user is sharing it's screen
    window.history.pushState("", "", "authorize");

    if (!accessToken) {
        window.location.href = window.location.origin; // Send to login
        return;
    }

    const authorize = await $.ajax({
        type: 'POST',
        url: '/authorize',
        contentType: 'application/json',
        data: JSON.stringify({
            accessToken: accessToken,
            tokenType: tokenType,
            expiresIn: expiresIn
        }),
        success: (res) => res,
        onerror: (error) => {
            console.error(error);
            return { res: false, msg: error };
        }
    });

    if (authorize.res == false) {
        changeStatus('There was a problem authenticating you, sorry.');
        return;
    }

    playerName = authorize.name;

    if (authorize.leagueOfficial) {
        // Draw the select if league official or normal player.
        await $("#displayText").fadeOut(100).promise();
        await $("#selectProfile").fadeIn(100).promise();
    } else {
        redirectOrSendToList(playerName);
    }
}

const loginAsLeagueOfficial = async () => {
    await $("#selectProfile").fadeOut(100).promise();
    redirectOrSendToList(playerName);
}

const loginAsPlayer = async () => {

    const loginAsPlayer = await $.ajax({
        type: 'POST',
        url: '/authorize/noLeagueOfficial',
        success: (res) => res,
        onerror: (error) => {
            console.error('ERROR!: ' + error);
            return { res: false, msg: error };
        }
    });

    if (loginAsPlayer.res){
        await $("#selectProfile").fadeOut(100).promise();
        redirectOrSendToList(playerName);
    }else{
        await $("#selectProfile").fadeOut(100).promise();
        changeStatus('There was a problem authenticating you as a player, sorry.');
        return;
    }
}

const redirectOrSendToList = (playerName) => {

    // Handle redirection to site
    const returnUrl = localStorage.getItem("returnUrl");

    if (returnUrl != undefined && returnUrl != null && returnUrl.length > 0) {
        changeStatus(`Welcome ${playerName}! Redirecting you to the schedule...`);

        setTimeout(() => {
            window.location.href = window.location.origin + localStorage.getItem("returnUrl");
        }, 1500)
    } else {
        changeStatus(`Welcome ${playerName}! Redirecting you to schedules.`);

        setTimeout(() => {
            window.location.href = window.location.origin + '/scheduleList';
        }, 1500)
    }
}

const changeStatus = async (text) => {
    await $("#displayText").fadeOut(100).promise();
    $("#displayText").text(text);
    await $("#displayText").fadeIn(100).promise();
}


getCode();
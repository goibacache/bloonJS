const deleteAllCookies = () => {
    document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Strict';
    });
}

const getCode = async () => {
    deleteAllCookies();

    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    if (urlParams.size != 4){
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
        success: (res) => {
            return res;
        },
        onerror: (error) => {
            console.error(error);
            return { res: false, msg: error };
        }
    });

    if (authorize.res){

        // Handle redirection to site
        const returnUrl = localStorage.getItem("returnUrl");

        if (returnUrl != undefined && returnUrl != null && returnUrl.length > 0){
            changeStatus(`Welcome ${authorize.name}! Redirecting you to the schedule...`);

            setTimeout(() => {
                window.location.href = window.location.origin + localStorage.getItem("returnUrl");
            }, 1500)
        }else{
            changeStatus(`Welcome ${authorize.name}! Redirecting you to your team's schedules.`);

            setTimeout(() => {
                window.location.href = window.location.origin + '/scheduleList';
            }, 1500)
        }
    }else{
        changeStatus('There was a problem authenticating you, sorry.')
    }
}

const changeStatus = async (text) => {
    await $("#displayText").fadeOut(100).promise();
    $("#displayText").text(text);
    await $("#displayText").fadeIn(100).promise();
}


getCode();
const getReturnUrl = () => {
    const params = new URLSearchParams(document.location.search);
    const returnUrl = params.get("returnUrl");
    if (returnUrl != null){
        localStorage.setItem("returnUrl", returnUrl);
    }else{
        localStorage.setItem("returnUrl", "");
    }
}

const authorizeWithDiscord = () => {
    const oAutClientId = $("#oAutClientId").val();
    const oAuthReturnUrl = encodeURIComponent($("#oAuthReturnUrl").val());
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${oAutClientId}&response_type=token&redirect_uri=${oAuthReturnUrl}&scope=identify+guilds+guilds.members.read`;
}

getReturnUrl();
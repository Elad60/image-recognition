$(document).ready(function() {
    const userInfo = getUserInfoFromToken();
    $('#profile-name').text(userInfo.username);
    $('#profile-email').text(userInfo.email);


});
function reqLike(){
    window.location.href="/twitter/like?missionNum=8";
    // axios.get(`/twitter/like?missionNum=8`)
    // .then((response) => {
    // console.log('twitterConnect response:: ',response);

    // console.log('twitterConnect response:: ',JSON.parse(response));

    // console.log('twitterConnect response.data:: ',JSON.parse(response.data));
    // })
    // .catch(error => {
    // console.error('Error checking user registration:', error);
    // });
}

function coupon(){
    var missionNum = 20;
    var coupon = $("#coupon").val();
    
    axios.post('/mission/coupon',{missionNum : missionNum, coupon : coupon})
    .then(function(response){
        alert(JSON.stringify(response.data));
    })
}

function allClear(){
    var missionNum = 21;
    var category = "SUI";
    
    axios.post('/mission/allClear',{missionNum : missionNum, category : category})
    .then(function(response){
        alert(JSON.stringify(response.data));
    })
}
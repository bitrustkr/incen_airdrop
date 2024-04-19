// use: attendance, coupon
let selectedId = 0;
let dailyCheck = false;

// use: holder, clear
let missionType = '';
let missionNum = 0;
let category ='';

//  confirm attendance
function confirmAttendance(id) {
  let isLogin = getIsLogin();

  if(!isLogin || isLogin === 'false') {
    singMetamask()
  } else  {
    $("#daily_check").css("display", "block");
    selectedId = id;
  }
}

//  request attendance
function requestAttendance() {  
  axios
  .post("/mission/repeatComplete", { missionNum: selectedId })
  .then(function (res) {
    if (res.data.result) {
      localStorage.setItem('dailyCheck',true);
      $("#daily_check").css("display", "none");
      $("#confirm").css("display", "block");
    } else {
      $("#error").css("display", "block");
      $("#error .title").append(res.data.message);
    }
  });
}
// append daily check 
function appendDailyCheck (element, type, index, points) {
  let getDailyCheck = localStorage.getItem('dailyCheck');

  if(!dailyCheck && !getDailyCheck){        
    element.append(
      `<div class="non_complete_wrap">
          <div class="none_contents">
              <div class="day active">${index + 1} DAY</div>
              <div class="point_ing"><img src="/img/points.png" alt=""/></div>
              <div class="point_txt active">${points} point</div>
          </div>
          <img src="/img/active_complete.png" alt=""/>
      </div>`
    );

    dailyCheck = true;
    
  } else {
    switch (type) {
      case 'multiples':
        element.append(
          `<div class="non_complete_wrap">
              <div class="none_contents">
                  <div class="day">${index + 1} DAY</div>
                  <div class="point_ing"><img src="/img/points.png" alt=""/></div>
                  <div class="point_txt">${points} point</div>
              </div>
              <img src="/img/non_complete.png" alt=""/>
          </div>`
        );
        break;

      case 'double' :
        element.append(
          `<div class="non_complete_wrap">
              <div class="none_contents">
                  <div class="day">${index + 1} DAY</div>
                  <div class="point_ing"><img src="/img/points.png" alt=""/></div>
                  <div class="point_txt">${points} point</div>
              </div>
              <img src="/img/non_complete.png" alt=""/>
          </div>`
        );

        break;

      case 'basic' :
        element.append(
          `<div class="non_complete_wrap">
              <div class="none_contents">
                  <div class="day">${index + 1} DAY</div>
                  <div class="point_ing"><img src="/img/point.png" alt=""/></div>
                  <div class="point_txt">${points} point</div>
              </div>
              <img src="/img/non_complete.png" alt=""/>
          </div>`
        );

        break;

      default: 
        element.append(
          `<div class="non_complete_wrap">
              <div class="none_contents">
                  <div class="day">${index + 1} DAY</div>
                  <div class="point_ing"><img src="/img/point.png" alt=""/></div>
                  <div class="point_txt">${points} point</div>
              </div>
              <img src="/img/non_complete.png" alt=""/>
          </div>`
        );

        break;
    }
  }
}

//  check attendance 
function checkAttendance() {
  $("#daily_check").css("display", "none");
  $("#dailyCheckIn").css("display", "block");

  let attendanceCnt = localStorage.getItem('attendanceCnt');
  let attendanceList =  $(".modal_container");

  Array.from({ length: 30 }).forEach((_, index) => {
    if (attendanceCnt > index) {
      attendanceList.append(
        `<div>
          <img src="/img/complete.png" alt=""/>
        </div>`
      );
    } else {
      let points = 3;
      
      if ((index + 1) % 3 === 0 && index < 26) {
        points += 2;

        appendDailyCheck(attendanceList, 'multiples', index, points);
      } else if (index >= 26) {
        if(index !== 27 && index !== 28){
          points = 10;

          appendDailyCheck(attendanceList, 'double', index, points);
        } else {
          appendDailyCheck(attendanceList, 'basic', index, points);
        }
      } else {
        appendDailyCheck(attendanceList, 'basic', index, points);
      } 
    }

    $(".modal_container").append(attendanceList);
  });
}

//  locastorege check attendance 
function locastoregeCheckAttendance () {
  let now = new Date();
  let midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  let timeUntilMidnight = midnight - now;

  setTimeout(function() {
      localStorage.removeItem('dailyCheck');
  }, timeUntilMidnight);
}

// holder, clear
function checkNotifyHolder (Num, cate, type){
  let isLogin = getIsLogin();

  if(!isLogin || isLogin=== 'false'){
    singMetamask();
  } else {
    switch (type){
      case 'holder' :
        $("#notify").css("display", "block");
        $("#notify .text").append('Do you want to complete the mission?');
  
        break;
  
      case 'clear' :
        $("#notify").css("display", "block");
        $("#notify .text").append('Do you want to complete the mission?');
  
        break;
    }
  
    missionNum = Num;
    category = cate;
    missionType = type;
  }
}

//  confirm nofify
function confirmNoti () {
  switch (missionType){
    case 'holder' :
      nftHolder ()

      break;

    case 'clear' :
      confirmAllClear ()

      break;
  }
}

// request nftholder
function nftHolder() {
  axios
    .post("/wallet/nftHolder", { missionNum: missionNum, category: category })

    .then(function (res) {
      if(res.data.result) {
        $("#notify").css("display", "none");
        $("#confirm").css("display", "block");
      } else {
        $("#error").css("display", "block");
        $("#error .title").append(res.data.message);
      }
    });
}

//open coupon input
function openCoponCodeInput (id) {
  $("#code").css("display", "block");
  selectedId = id;
} 

//request coupon 
function confirmCoupon () {
  var coupon = $("#coupon").val();

  if(coupon === '') {
    return;

  } else {
    axios.post('/mission/coupon',{missionNum : selectedId, coupon : coupon})
    .then(function(res){
        if(res.data.result) {
          if(res.data.link){
            navigator.clipboard.writeText(text).then(function() {
              $("#confirm").css("display", "block");
              $("#confirm .title").append('The link has been copied. Please visit the copied site through Chrome or Safari.');
            }).catch(function(error) {
              $("#error").css("display", "block");
            });
          } else{
            $("#code").css("display", "none");
            $("#confirm").css("display", "block");
          }
        } else {
          $("#error").css("display", "block");
          $("#error .title").append(res.data.message);
        }
    })
  }
}

// confirm all clear 
function confirmAllClear () {
  axios.post('/mission/allClear',{missionNum : missionNum, category : category})
  .then(function(res){
      if(res.data.result) {
        $("#notify").css("display", "none");
        $("#confirm").css("display", "block");
      } else {
        $("#error").css("display", "block");
        $("#error .title").append(res.data.message);
      }
  })
}

//redirect
function redirect(type) {
  if(type){
    switch(type){
      case 'none':
        $("#logerror").css("display", "none");
        $("#dailyCheckIn").css("display", "none");

        break

      case 'getIn':
        $("html, body").animate(
          {
            scrollTop: 1550,
          },
          1000
        );

        break
    }
  } else  {
    window.location.href = '/?animation=true';
  }
}

$(document).ready(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const animationEnabled = urlParams.has('animation');

  if (animationEnabled) {
    $("html, body").animate(
      {
        scrollTop: 1550,
      },
      1000
    );
  }
});

// join homepage
function joinHompage(id,link) {
  let isLogin = getIsLogin();

  if(!isLogin || isLogin === 'false'){
    singMetamask()
  } else {
    axios
    .post(link, { missionNum: id })
    .then(function (res) {
      if (res.data.result) {
        window.open(res.data.url);
        $("#confirm").css("display", "block");
        let completeMsg = $("<span>Misstion Complete !</span>");
        $(".title").append(completeMsg);

      } else {
        $("#error").css("display", "block");
        $("#error .title").append(res.data.message);
      }
    });
  }
}

// get Login state
function getIsLogin (){
  const contentBack = document.querySelector('.body_back');
  const isLogin = contentBack.getAttribute('data-value');

  return isLogin
}

$(document).ready(function () {
  locastoregeCheckAttendance();
  const localStorageCheck = localStorage.getItem('dailyCheck');

  if(localStorageCheck){
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var year = tomorrow.getFullYear();
    var month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    var day = tomorrow.getDate().toString().padStart(2, '0');
    var formattedDate = year + '.' + month + '.' + day;
    
    $('.timer span').text(`${formattedDate} 00:00:00`);
  } else {
    var today = new Date();
    var year = today.getFullYear();
    var month = (today.getMonth() + 1).toString().padStart(2, '0');
    var day = today.getDate().toString().padStart(2, '0');
    var formattedDate = year + '.' + month + '.' + day;
    
    $('.timer span').text(`${formattedDate} 00:00:00`);
  }

  var currentUrl = window.location.href;
  var urlParams = $.url(currentUrl).param();

  var modalValue = urlParams.modal;
  var msgValue = urlParams.message;

  if(modalValue === 'error') {
    switch (msgValue) {
      case 'Please LogIn':
        singMetamask();

        break;

      default:
        $("#error").css("display", "block");
        $("#error .title").append(msgValue);

        break;
    }
  } 
  
  if(modalValue === 'complete'){
    $("#confirm").css("display", "block");
  }
});

//web3 : login, login check,
async function singMetamask(){
  try {
    web3 = new Web3(web3.currentProvider);
  } catch (error) {
    window.open('https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=ko&pli=1');

    $("#logerror").css("display", "block");
    $("#logerror .title").append('Please Install Metamask.');

    return;
  }

  let contractAddr = '0xBc06d43f8163f02f8c53D80eA8538B2c31601e63';
  let chainId = 56
  const currentNetworkId = await ethereum.request({ method: 'net_version' });

  if (currentNetworkId !== chainId) {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(chainId) }], 
        });
    } catch (error) {      
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x38",
          rpcUrls: ["https://bsc-dataseed.binance.org/"],
          chainName: "Binance Smart Chain",
          nativeCurrency: {
            name: "Binance Coin",
            symbol: "BNB",
            decimals: 18
          },
          blockExplorerUrls: ["https://bscscan.com/"]
        }]
      });

      return;
    }
  }

  let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
  });

  var typedData = {
      types: {
          EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" }
          ],
          Content: [
              { name: "message", type: "string" },
              { name: "account", type: "address" },
              { name: "deadline", type: "uint"}
          ]
      },
      domain: {
          name: "airdrop.3kds.io",
          version: "1",
          chainId: chainId,
          verifyingContract: contractAddr // 사용할 컨트랙트 주소 입력 마켓컨트랙트, 라우터컨트랙트
      },
      primaryType: "Content",
      message: {
          message: "Welcome!",
          account: accounts[0], //연결된 사용자 메타마스크 주소
          deadline: 0
      }
  };

  typedData.message.deadline = Math.floor(Date.now() / 1000) + 180;

  // 메타마스크로 서명시작
  const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [accounts[0], JSON.stringify(typedData)]
  });

  var sign = signature.substring(2);
  var r = "0x" + sign.substring(0, 64);
  var s = "0x" + sign.substring(64, 128);
  var v = parseInt(sign.substring(128, 130), 16);

  var contract = new web3.eth.Contract(signAbi, contractAddr);

  //컨트랙트 확인
  var callRst = await contract.methods['signatureValidation'](v, r, s, typedData.message.deadline).call({from: accounts[0]});

  console.log('callRst::',callRst); //실패하면 0x00000000

  var rst = await axios.post(`/users/login`, {address: accounts[0], deadline: typedData.message.deadline, hash: callRst});

  if(rst.data.result){
      window.location.href = "/";
  } else {
    console.log('error::',error);
    $("#logerror").css("display", "block");
  }
}

var signAbi = [
	{
		"inputs": [],
		"name": "ECDSAInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256"
			}
		],
		"name": "ECDSAInvalidSignatureLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "ECDSAInvalidSignatureS",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"name": "signatureValidation",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "timestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
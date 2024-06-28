// use: holder, clear
// let missionType = "";
// let missionNum = 0;
// let category = "";

//  confirm attendance
// function confirmAttendance(id) {
//   let isLogin = getIsLogin();

//   if (!isLogin || isLogin === "false") {
//     signTwitter();
//   } else {
//     $("#daily_check").css("display", "block");
//     selectedId = id;
//   }
// }

// append daily check
function appendDailyCheck(element, type, index, points) {
  // let getDailyCheck = localStorage.getItem("dailyCheck");
  // if (!dailyCheck && !getDailyCheck) {
  //   element.append(
  //     `<div class="non_complete_wrap">
  //         <div class="none_contents">
  //             <div class="day active">${index + 1} DAY</div>
  //             <div class="point_ing"><img src="/img/points.png" alt=""/></div>
  //             <div class="point_txt active">${points} point</div>
  //         </div>
  //         <img src="/img/active_complete.png" alt=""/>
  //     </div>`
  //   );
  //   dailyCheck = true;
  // } else {
  //   switch (type) {
  //     case "multiples":
  //       element.append(
  //         `<div class="non_complete_wrap">
  //             <div class="none_contents">
  //                 <div class="day">${index + 1} DAY</div>
  //                 <div class="point_ing"><img src="/img/points.png" alt=""/></div>
  //                 <div class="point_txt">${points} point</div>
  //             </div>
  //             <img src="/img/non_complete.png" alt=""/>
  //         </div>`
  //       );
  //       break;
  //     case "double":
  //       element.append(
  //         `<div class="non_complete_wrap">
  //             <div class="none_contents">
  //                 <div class="day">${index + 1} DAY</div>
  //                 <div class="point_ing"><img src="/img/points.png" alt=""/></div>
  //                 <div class="point_txt">${points} point</div>
  //             </div>
  //             <img src="/img/non_complete.png" alt=""/>
  //         </div>`
  //       );
  //       break;
  //     case "basic":
  //       element.append(
  //         `<div class="non_complete_wrap">
  //             <div class="none_contents">
  //                 <div class="day">${index + 1} DAY</div>
  //                 <div class="point_ing"><img src="/img/point.png" alt=""/></div>
  //                 <div class="point_txt">${points} point</div>
  //             </div>
  //             <img src="/img/non_complete.png" alt=""/>
  //         </div>`
  //       );
  //       break;
  //     default:
  //       element.append(
  //         `<div class="non_complete_wrap">
  //             <div class="none_contents">
  //                 <div class="day">${index + 1} DAY</div>
  //                 <div class="point_ing"><img src="/img/point.png" alt=""/></div>
  //                 <div class="point_txt">${points} point</div>
  //             </div>
  //             <img src="/img/non_complete.png" alt=""/>
  //         </div>`
  //       );
  //       break;
  //   }
  // }
}

//  check attendance
function checkAttendance() {
  // $("#daily_check").css("display", "none");
  // $("#dailyCheckIn").css("display", "block");
  // let attendanceCnt = localStorage.getItem("attendanceCnt");
  // let attendanceList = $(".modal_container");
  // Array.from({ length: 30 }).forEach((_, index) => {
  //   if (attendanceCnt > index) {
  //     attendanceList.append(
  //       `<div>
  //         <img src="/img/complete.png" alt=""/>
  //       </div>`
  //     );
  //   } else {
  //     let points = 3;
  //     if ((index + 1) % 3 === 0 && index < 26) {
  //       points += 2;
  //       appendDailyCheck(attendanceList, "multiples", index, points);
  //     } else if (index >= 26) {
  //       if (index !== 27 && index !== 28) {
  //         points = 10;
  //         appendDailyCheck(attendanceList, "double", index, points);
  //       } else {
  //         appendDailyCheck(attendanceList, "basic", index, points);
  //       }
  //     } else {
  //       appendDailyCheck(attendanceList, "basic", index, points);
  //     }
  //   }
  //   $(".modal_container").append(attendanceList);
  // });
}

//  locastorege check attendance
function locastoregeCheckAttendance() {
  // let now = new Date();
  // let midnight = new Date();
  // midnight.setHours(24, 0, 0, 0);
  // let timeUntilMidnight = midnight - now;
  // setTimeout(function () {
  //   localStorage.removeItem("dailyCheck");
  // }, timeUntilMidnight);
}

// holder, clear
// function checkNotifyHolder(Num, cate, type) {
//   let isLogin = getIsLogin();

//   if (!isLogin || isLogin === "false") {
//     signTwitter();
//   } else {
//     switch (type) {
//       case "holder":
//         $("#notify").css("display", "block");
//         $("#notify .text").append("Do you want to complete the mission?");

//         break;

//       case "clear":
//         $("#notify").css("display", "block");
//         $("#notify .text").append("Do you want to complete the mission?");

//         break;
//     }

//     missionNum = Num;
//     category = cate;
//     missionType = type;
//   }
// }

//  confirm nofify
function confirmNoti() {
  switch (missionType) {
    case "holder":
      nftHolder();

      break;

    case "clear":
      confirmAllClear();

      break;
  }
}

// request nftholder
function nftHolder() {
  axios
    .post("/wallet/nftHolder", { missionNum: missionNum, category: category })

    .then(function (res) {
      if (res.data.result) {
        $("#notify").css("display", "none");
        $("#confirm").css("display", "block");
      } else {
        $("#error").css("display", "block");
        $("#error .title").append(res.data.message);
      }
    });
}

//open coupon input
function openCoponCodeInput(id) {
  $("#code").css("display", "block");
  selectedId = id;
}

//request coupon
function confirmCoupon() {
  var coupon = $("#coupon").val();

  if (coupon === "") {
    return;
  } else {
    axios
      .post("/mission/coupon", { missionNum: selectedId, coupon: coupon })
      .then(function (res) {
        if (res.data.result) {
          if (res.data.link) {
            navigator.clipboard
              .writeText(text)
              .then(function () {
                $("#confirm").css("display", "block");
                $("#confirm .title").append(
                  "The link has been copied. Please visit the copied site through Chrome or Safari."
                );
              })
              .catch(function (error) {
                $("#error").css("display", "block");
              });
          } else {
            $("#code").css("display", "none");
            $("#confirm").css("display", "block");
          }
        } else {
          $("#error").css("display", "block");
          $("#error .title").append(res.data.message);
        }
      });
  }
}

// confirm all clear
function confirmAllClear() {
  axios
    .post("/mission/allClear", { missionNum: missionNum, category: category })
    .then(function (res) {
      if (res.data.result) {
        $("#notify").css("display", "none");
        $("#confirm").css("display", "block");
      } else {
        $("#error").css("display", "block");
        $("#error .title").append(res.data.message);
      }
    });
}

//redirect
function redirect(type) {
  switch (type) {
    case "confirm":
      $("#confirm").css("display", "none");
      $("#confirm .title").empty();
      window.location.href = "/";
      break;

    case "none":
      $("#logerror").css("display", "none");
      $("#dailyCheckIn").css("display", "none");

      break;

    case "getIn":
      $("html, body").animate(
        {
          scrollTop: 1550,
        },
        1000
      );

      break;
  }
}

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const animationEnabled = urlParams.has("animation");

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
function joinHompage(id, link) {
  console.log(12312);

  axios.post(link, { missionNum: id }).then(function (res) {
    if (res.data.result) {
      window.open(res.data.url);
      location.href = location.href;
    }
  });
}
// function joinHompage(id, link) {
//   let isLogin = getIsLogin();

//   if (!isLogin || isLogin === "false") {
//     signTwitter();
//   } else {
//     axios.post(link, { missionNum: id }).then(function (res) {
//       if (res.data.result) {
//         window.open(res.data.url);
//         $("#confirm").css("display", "block");
//         let completeMsg = $("<span>Misstion Complete !</span>");
//         $(".title").append(completeMsg);
//       } else {
//         $("#error").css("display", "block");
//         $("#error .title").append(res.data.message);
//       }
//     });
//   }
// }

// get Login state
function getIsLogin() {
  const contentBack = document.querySelector(".body_back");
  const isLogin = contentBack.getAttribute("data-value");

  return isLogin;
}

$(document).ready(function () {
  locastoregeCheckAttendance();
  const localStorageCheck = localStorage.getItem("dailyCheck");

  if (localStorageCheck) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var year = tomorrow.getFullYear();
    var month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
    var day = tomorrow.getDate().toString().padStart(2, "0");
    var formattedDate = year + "." + month + "." + day;

    $(".timer span").text(`${formattedDate} 00:00:00`);
  } else {
    var today = new Date();
    var year = today.getFullYear();
    var month = (today.getMonth() + 1).toString().padStart(2, "0");
    var day = today.getDate().toString().padStart(2, "0");
    var formattedDate = year + "." + month + "." + day;

    $(".timer span").text(`${formattedDate} 00:00:00`);
  }

  var currentUrl = window.location.href;
  var urlParams = $.url(currentUrl).param();

  var modalValue = urlParams.modal;
  var msgValue = urlParams.message;

  if (modalValue === "error") {
    switch (msgValue) {
      case "Please LogIn":
        signTwitter();

        break;

      default:
        $("#error").css("display", "block");
        $("#error .title").append(msgValue);

        break;
    }
  }

  if (modalValue === "complete") {
    $("#confirm").css("display", "block");
  }
});

//-------------------------------------------------------------------
// 로그인
async function signTwitter() {
  location.href = "/users/login";
}

//로그아웃
function disconnectTwitter() {
  console.log("disconnectTwitter");

  localStorage.removeItem("metaSignature");
  location.href = "/test/logout";
}

//메타마스크 연동
var signAbi = [
  {
    inputs: [
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "check",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "signatureValidation",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

var checkAbi = {
  inputs: [
    {
      internalType: "uint8",
      name: "v",
      type: "uint8",
    },
    {
      internalType: "bytes32",
      name: "r",
      type: "bytes32",
    },
    {
      internalType: "bytes32",
      name: "s",
      type: "bytes32",
    },
  ],
  name: "check",
  outputs: [],
  stateMutability: "payable",
  type: "function",
};

//web3
//logout 할때 localStorage.setItem('metaSignature', signature); 이거 값 날려버리기!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function connectMetamask() {
  try {
    web3 = new Web3(web3.currentProvider);
  } catch (error) {
    window.open(
      "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=ko&pli=1"
    );

    return;
  }

  let contractAddr = "0x9d42388a4141440e02dc36c415e2045a64a5af76";
  let chainId = 5611;
  const currentNetworkId = await ethereum.request({ method: "net_version" });

  if (currentNetworkId !== chainId) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: web3.utils.toHex(chainId) }],
      });
    } catch (error) {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x15eb",
            rpcUrls: ["https://opbnb-testnet-rpc.bnbchain.org"],
            chainName: "opBNB Testnet",
            nativeCurrency: {
              name: "Test opBinance Coin",
              symbol: "tBNB",
              decimals: 18,
            },
            blockExplorerUrls: ["https://opbnb-testnet.bscscan.com/"],
          },
        ],
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
        { name: "verifyingContract", type: "address" },
      ],
      Content: [
        { name: "message", type: "string" },
        { name: "account", type: "address" },
      ],
    },
    domain: {
      name: "1.234.112.72",
      version: "1",
      chainId: chainId,
      verifyingContract: contractAddr, // 사용할 컨트랙트 주소 입력 마켓컨트랙트, 라우터컨트랙트
    },
    primaryType: "Content",
    message: {
      message: "Welcome!",
      account: accounts[0],
    },
  };

  // 메타마스크로 서명시작
  const signature = await window.ethereum.request({
    method: "eth_signTypedData_v4",
    params: [accounts[0], JSON.stringify(typedData)],
  });

  console.log("signature::", signature);

  var sign = signature.substring(2);
  var r = "0x" + sign.substring(0, 64);
  var s = "0x" + sign.substring(64, 128);
  var v = parseInt(sign.substring(128, 130), 16);

  var contract = new web3.eth.Contract(signAbi, contractAddr);

  //컨트랙트 확인
  var callRst = await contract.methods["signatureValidation"](v, r, s).call({
    from: accounts[0],
  });

  console.log("callRst::", callRst); //실패하면 0x00000000

  var rst = await axios.post(`/wallet/connect`, {
    address: accounts[0],
    hash: callRst,
  });

  if (rst.data.result) {
    localStorage.setItem("metaSignature", signature);
    window.location.href = "/test";
  } else {
    console.log("error::", rst.data.message);
  }
}

// Telegram 연동
function connectTelegram() {
  console.log("connectTelegram");

  // 요청이 성공일 경우 copybtn으로 ui변경 및 완료 팝업
  if (true) {
    localStorage.setItem("telegramInfo", "Ox123...1234");
    changeToCopyButton("telegram", "Ox123...1234");
  }
}

// Discord 연동
function connectDiscord() {
  console.log("connectDiscord");

  // 요청이 성공일 경우 copybtn으로 ui변경 및 완료 팝업
  if (true) {
    localStorage.setItem("discordInfo", "Ox123...1234");
    changeToCopyButton("discord", "Ox123...1234");
  }
}

function changeToCopyButton(type, address) {
  let buttonHTML;

  switch (type) {
    case "metamask":
      buttonHTML = `
      <a href="#" class="copy_to_clipboard" data-copy-text="${address}">
          <img src="/img/wallet.svg" alt=""/>
          <span>${address}</span>
      </a>
      `;

      $("#connectMetamaskBtn").replaceWith(buttonHTML);

      break;

    case "telegram":
      buttonHTML = `
      <a href="#" class="copy_to_clipboard" data-copy-text="${address}">
          <img src="/img/wallet.svg" alt=""/>
          <span>${address}</span>
      </a>
      `;

      $("#connectTelegramBtn").replaceWith(buttonHTML);
      break;

    case "discord":
      buttonHTML = `
      <a href="#" class="copy_to_clipboard" data-copy-text="${address}">
          <img src="/img/wallet.svg" alt=""/>
          <span>${address}</span>
      </a>
      `;

      $("#connectDiscordBtn").replaceWith(buttonHTML);

      break;
  }
}

// social 연동 확인
let storedMetamask = localStorage.getItem("metamaskInfo");
let storedTelegram = localStorage.getItem("telegramInfo");
let storedDiscord = localStorage.getItem("discordInfo");

if (storedMetamask) {
  changeToCopyButton("metamask", storedMetamask);
}

if (storedTelegram) {
  changeToCopyButton("telegram", storedMetamask);
}

if (storedDiscord) {
  changeToCopyButton("discord", storedMetamask);
}

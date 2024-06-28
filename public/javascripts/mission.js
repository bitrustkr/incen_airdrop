const section2 = document.querySelector(".section2");
const loginAddr = document
  .querySelector(".section1")
  .getAttribute("data-loginAddr");
const isLogin = section2.getAttribute("data-login");

// console.log(isLogin);
// console.log(typeof isLogin);

function getMissions() {
  let connect = JSON.parse(section2.getAttribute("data-connect"));
  let twitter = JSON.parse(section2.getAttribute("data-twitter"));
  let discord = JSON.parse(section2.getAttribute("data-discord"));
  let test = JSON.parse(section2.getAttribute("data-test"));

  let connectTask = "";
  let tweetTask = "";
  let dicoTask = "";
  let testTask = "";

  // connect
  connect.forEach((data) => {
    console.log(data.type);

    if (isLogin === "true") {
      switch (data.type) {
        case "metamask":
          taskButton = `<a href="#" class="m_btn connect" onclick="connectMetamask()'>CONNECT</a>`;
          break;

        case "homepage":
          taskButton = `<a href="#" class="m_btn connect" onclick="joinHompage(${data.id},'${data.link}')">CONNECT</a>`;
          break;

        default:
          taskButton = `<a href="${data.link}" class="m_btn connect">CONNECT</a>`;
          break;
      }

      connectTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>

            ${
              data.complete === 0
                ? taskButton
                : `<div class="m_btn completed">completed</div>`
            }  
        </div>
      `;
    } else {
      connectTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>

            
            <div class="m_btn connect" onclick="signTwitter()">CONNECT</div>
        </div>
      `;
    }
  });

  $(".mission_list.connect").append(connectTask);

  //twitter
  twitter.forEach((data) => {
    console.log("twitter::", data);

    if (isLogin === "true") {
      let taskButton = ``;

      switch (data.link) {
        case "/twitter/follow":
          taskButton = `<a class="m_btn connect" href="/twitter/follow?missionNum=${data.id}">Follow</a>`;
          break;
        case "/twitter/like":
          taskButton = `<a class="m_btn connect" href="/twitter/like?missionNum=${data.id}">Like</a>`;
          break;
        case "/twitter/retweet":
          taskButton = `<a class="m_btn connect" href="/twitter/retweet?missionNum=${data.id}">Retweet</a>`;
          break;
      }

      tweetTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>
    
            ${
              data.complete === 0
                ? taskButton
                : `<div class="m_btn completed">completed</div>`
            }  
        </div>
      `;
    } else {
      tweetTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>

            
            <div class="m_btn connect" onclick="signTwitter()">CONNECT</div>
        </div>
      `;
    }
  });

  $(".mission_list.twitter").append(tweetTask);

  // discord
  discord.forEach((data) => {
    console.log("discord::", data);

    if (isLogin === "true") {
      let taskButton = ``;

      switch (data.link) {
        case "/discord/join":
          taskButton = `<a class="m_btn connect" href="/discord/join?missionNum=${data.id}">Join</a>`;
          break;
        default:
          taskButton = `<a class="m_btn connect" href="${data.link}">Test Role Check</a>`;
          break;
      }

      dicoTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>
    
            ${
              data.complete === 0
                ? taskButton
                : `<div class="m_btn completed">completed</div>`
            }  
        </div>
      `;
    } else {
      dicoTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>

            
            <div class="m_btn connect" onclick="signTwitter()">CONNECT</div>
        </div>
      `;
    }
  });

  $(".mission_list.discord").append(dicoTask);

  // test
  test.forEach((data) => {
    console.log("test::", data);

    if (isLogin === "true") {
      testTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>

            ${
              data.complete === 0
                ? `<div class="m_btn connect">CONNECT</div>`
                : `<div class="m_btn completed">completed</div>`
            }  
        </div>
      `;
    } else {
      testTask += `
        <div>
            <div class="left">
                <div class="poin">+${data.point}</div>
                <div class="mission">${data.title}</div>
            </div>

            
            <div class="m_btn connect" onclick="signTwitter()">CONNECT</div>
        </div>
      `;
    }
  });

  $(".mission_list.test").append(testTask);
}

function repeatComplete() {
  var missionNum = 18;

  axios
    .post("/mission/repeatComplete", { missionNum: missionNum })
    .then(function (response) {
      alert(JSON.stringify(response.data));
    });
}

// 출석체크
async function attendance() {
  const todayAttd = document
    .querySelector(".daily_wrap_contents")
    .getAttribute("data-today-attd");

  console.log(todayAttd);
  console.log(typeof todayAttd);

  if (isLogin === "false") {
    $("#confirm").css("display", "block");
    $("#confirm .title").append("Please Login");

    return;
  }

  if (todayAttd === "true") {
    $("#confirm").css("display", "block");
    $("#confirm .title").append(
      "Attendance check has already been completed today."
    );

    return;
  }

  var signature;
  var contractAddr = "0x9d42388a4141440e02dc36c415e2045a64a5af76";
  try {
    web3 = new Web3(web3.currentProvider);
  } catch (error) {
    window.open(
      "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=ko&pli=1"
    );

    return;
  }

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

  if (!localStorage.getItem("metaSignature")) {
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
        account: loginAddr,
      },
    };

    // 메타마스크로 서명시작
    signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [loginAddr, JSON.stringify(typedData)],
    });

    console.log("signature::", signature);
  } else {
    signature = localStorage.getItem("metaSignature");
    console.log(1);
  }

  var sign = signature.substring(2);
  var r = "0x" + sign.substring(0, 64);
  var s = "0x" + sign.substring(64, 128);
  var v = parseInt(sign.substring(128, 130), 16);

  var contract = new web3.eth.Contract(signAbi, contractAddr);

  var val = "1000000000000000";
  val = web3.utils.numberToHex(val);

  var to = contractAddr;
  var trxParams = {
    from: ethereum.selectedAddress,
    value: val,
  };

  var gas = await contract.methods.check(v, r, s).estimateGas(trxParams);

  var data = await web3.eth.abi.encodeFunctionCall(checkAbi, [v, r, s]);

  trxParams = {
    to: to,
    from: ethereum.selectedAddress,
    value: val,
    gas: gas,
    data: data,
  };

  var rst = await web3.eth.sendTransaction(trxParams);
  console.log(rst.transactionHash);

  var rst = await axios.post(`/wallet/attendance`, {
    txid: rst.transactionHash,
  });

  if (rst.data.result) {
    window.location.href = "/test?modal=success";
  } else {
    console.log("error::", rst.data.message);
  }
}

$(document).ready(function () {
  if (isLogin !== "true") {
    localStorage.removeItem("metaSignature");
  }

  getMissions();

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const modalParam = urlParams.get("modal");

  if (modalParam === "complete") {
    $("#confirm").css("display", "block");
    $("#confirm .coin").append(`<img src="/img/coin.png" alt="">`);
    $("#confirm .title").append("COMPLETE!");
  }

  if (modalParam === "error") {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("message");

    $("#confirm").css("display", "block");
    $("#confirm .coin").append(`<img src="/img/coin.png" alt="">`);
    $("#confirm .title").append(`<p>Error!"</p><p>${message}</p<>`);
  }
});

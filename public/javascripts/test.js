function reqLike() {
  axios
    .post(`/twitter/like`, { missionNum: 8 })
    .then((response) => {
      console.log("twitterConnect response:: ", response);

      console.log("twitterConnect response:: ", JSON.parse(response));

      console.log("twitterConnect response.data:: ", JSON.parse(response.data));
    })
    .catch((error) => {
      console.error("Error checking user registration:", error);
    });
}

function coupon() {
  var missionNum = 20;
  var coupon = $("#coupon").val();

  axios
    .post("/mission/coupon", { missionNum: missionNum, coupon: coupon })
    .then(function (response) {
      alert(JSON.stringify(response.data));
    });
}

function allClear() {
  var missionNum = 21;
  var category = "SUI";

  axios
    .post("/mission/allClear", { missionNum: missionNum, category: category })
    .then(function (response) {
      alert(JSON.stringify(response.data));
    });
}

// join homepage
function joinHompage(id, link) {
  axios.post(link, { missionNum: id }).then(function (res) {
    if (res.data.result) {
      if (link == "/mission/homepage") {
        window.open(res.data.url);
        location.href = location.href;
      } else if (link == "/mission/invite") {
        location.href = res.data.url;
      }
    } else {
      console.log(res.data);
    }
  });
}

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

  let contractAddr = "0x44CfB2fEa7361d299D32d9Ac579FD9640eB5F0Ba";
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
      name: "211.215.74.85",
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

async function attendance() {
  var signature;
  var contractAddr = "0x44CfB2fEa7361d299D32d9Ac579FD9640eB5F0Ba";
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
        name: "211.215.74.85",
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

/*

response
{
  result : bool,
  ranking : [{"name":"nohyunzee","point":142,"rank":1},{"name":"InyongMmd","point":40,"rank":2},{"name":"HNR6853","point":29,"rank":3},{"name":"0xKylie__","point":23,"rank":4},{"name":"asdasdaaa","point":21,"rank":5},{"name":"071labsTool","point":9,"rank":7},{"name":"0xdokdo","point":8,"rank":8},{"name":"0xHoneyFist_","point":4,"rank":9},{"name":"noyunji1462662","point":0,"rank":10},{"name":"0xYeJh","point":0,"rank":10}],
  userRanking : 아래 참고
}

----------------------------------------
userRanking : 로그인한 사용자의 랭킹 정보
100위 내에 있을 경우
"userRanking":{"name":"YongIn58591","point":10,"rank":"6"

100위 내에 없을 경우
"userRanking":{"name":"YongIn58591","point":10,"rank":"100+"

로그인 안했을 경우에는 데이터 없음
----------------------------------------


*/
function ranking() {
  axios
    .post("/users/ranking")
    .then(function (response) {
      alert(JSON.stringify(response.data));
    });
}
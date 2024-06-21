function copyRewardLink(text){
    navigator.clipboard.writeText(text).then(function() {
        $("#confirm").css("display", "block");
        $("#confirm .title").append('The link has been copied. Please visit the copied site through Chrome or Safari.');
    }).catch(function(error) {
        $("#error").css("display", "block");
    });
}

function getMissions(type){
    axios.get(`/mission/missionList?category=${type}`)
    .then(function(res){
        let unclearArray = [...res.data.unclear];
        let clearArray = [...res.data.clear];

        let taskInfo = ''
        localStorage.setItem(`attendanceCnt`, res.data.attendanceCnt);

        unclearArray.forEach(function (data) {  
            if (data.type === "attendance") {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Daily</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="confirmAttendance(${
                        data.id
                      })">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `
              ;
            } else if (data.type === "discord") {
                if(data.link === '/discord/join') {
                  taskInfo += 
                  `
                  <div class="item">
                      <div class="point">
                          <div>+${data.point} point</div>
                          <div>Season</div>
                      </div>
                  
                      <div class="reward_img">
                          <img src="/img/daily.png" alt=""/>
                      </div>
                  
                      <div class="reward_tit">
                          ${data.title}
                      </div>
                      
                      <div class="reward_go" onclick="window.location.href='${data.link}?missionNum=${data.id}'">
                          <img src="/img/go.png" alt=""/>
                      </div>
                  </div>
                  `;
                } else {
                  taskInfo += 
                  `
                  <div class="item">
                      <div class="point">
                          <div>+${data.point} point</div>
                          <div>Season</div>
                      </div>
                  
                      <div class="reward_img">
                         <img src="${data.id === 18 ? '/img/sui.png' : '/img/daily.png'}" alt="" />
                      </div>
                  
                      <div class=${data.id === 18 ? 'sui' : 'none'}>
                            BONUS : SUI 3~329
                      </div>  

                      <div class="reward_tit">
                          ${data.title}
                      </div>
                      
                      <div class="reward_go" onclick="window.location.href='${data.link}'">
                          <img src="/img/go.png" alt=""/>
                      </div>
                  </div>
                  `;
                }
              } else if (data.type === "twitter") {
              if(data.link === '/twitter/like' || data.link === '/twitter/follow' || data.link === '/twitter/retweet' ) {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="window.location.href='${data.link}?missionNum=${data.id}'">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `;
              } else {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="window.location.href='${data.link}'">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `;
              }
            } else if (data.type === "homepage") {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="joinHompage(${data.id},'${data.link}')">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `;
            } else if (data.type === "holder") {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="checkNotifyHolder(${data.id},'${data.category}','holder')">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `
            } else if (data.type === "coupon") {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>

                    <div class="reward_img">
                        <img src="${data.id === 17 ? '/img/sui.png' : '/img/daily.png'}" alt="" />
                    </div>

                    <div class=${data.id === 17 ? 'sui' : 'none'}>
                        BONUS : SUI 1.5~120
                    </div>  
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="openCoponCodeInput(${data.id})">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `
            } else if (data.type === "clear") {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="checkNotifyHolder(${data.id},'${data.category}','clear')">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `
            } else {
                taskInfo += 
                `
                <div class="item">
                    <div class="point">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>
                
                    <div class="reward_img">
                        <img src="/img/daily.png" alt=""/>
                    </div>
                
                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go" onclick="window.location.href='${data.link}'">
                        <img src="/img/go.png" alt=""/>
                    </div>
                </div>
                `;
              }
        });
        
        clearArray.forEach(function (data) {
            if (data.type === "attendance") {
                taskInfo += 
                `
                <div class="item disable">
                    <div class="point disable">
                        <div>+${data.point} point</div>
                        <div>Daily</div>
                    </div>

                    <div class="reward_img disable">
                        <img src="${data.id === 17 || data.id === 18 ? '/img/sui.png' : '/img/daily.png'}" alt="" />
                    </div>

                    <div class=${data.id === 17 || data.id === 18 ? 'sui' : 'none'}>
                        ${data.id === 17 ? 'BONUS : SUI 1.5~120': 'BONUS : SUI 3~329'}
                    </div>  

                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go">
                        <img src="/img/go_disable.png" alt=""/>
                    </div>
                </div>
                `;
            } else if(data.rewardLink) {
                taskInfo += 
                `
                <div class="item disable">
                    <div class="point disable">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>

                    <div class="reward_img disable">
                        <img src="${data.id === 17 || data.id === 18 ? '/img/sui.png' : '/img/daily.png'}" alt="" />
                    </div>
    
                    <div class=${data.id === 17 || data.id === 18 ? 'sui' : 'none'}>
                        ${data.id === 17 ? 'BONUS : SUI 1.5~120': 'BONUS : SUI 3~329'}
                    </div>  

                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <a class="reward_go" onclick="copyRewardLink('${data.rewardLink}');" target="_blank">
                        <img src="${data.id === 17 || data.id === 18 ? '/img/link.png' : '/img/go.png'}" alt=""/>
                    </a>
                </div>
                `;
            } else{
                taskInfo += 
                `
                <div class="item disable">
                    <div class="point disable">
                        <div>+${data.point} point</div>
                        <div>Season</div>
                    </div>

                    <div class="reward_img disable">
                        <img src="${data.id === 17 || data.id === 18 ? '/img/sui.png' : '/img/daily.png'}" alt="" />
                    </div>

                    <div class=${data.id === 17 || data.id === 18 ? 'sui' : 'none'}>
                        ${data.id === 17 ? 'BONUS : SUI 1.5~120': 'BONUS : SUI 3~329'}
                    </div>  

                    <div class="reward_tit">
                        ${data.title}
                    </div>
                    
                    <div class="reward_go">
                        <img src="/img/go_disable.png" alt=""/>
                    </div>
                </div>
                `;
            }
        });
        
        $(".mission_list").append(taskInfo);
    })
}

function repeatComplete(){
    var missionNum = 18;
    
    axios.post('/mission/repeatComplete',{missionNum : missionNum})
    .then(function(response){
        alert(JSON.stringify(response.data));
    })
}

$(document).ready(function () {
    // getMissions('ALL');

    // $(".reward_type div").click(function() {
    //     $(".mission_list").empty();
    //     $(".content_item").empty();
        
    //     var type = $(this).data('type');
    //     $(".reward_type div").removeClass("active");
    //     $(this).addClass("active");

    //     getMissions(type);
    // });
});
  
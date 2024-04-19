function getUser() {
  axios.get("/users").then(function (res) {
    if (res.data.result) {
      let point = res.data.data.point;

      $(".t1").text("Total " + point + " point");

      let imgElement = document.getElementById("dynamicImage");
      let imagePath = "/img/1.png"; 
      
      if (point >= 0 && point <= 100) {
          imagePath = "/img/1.png";
      } else if (point >= 101 && point <= 200) {
          imagePath = "/img/2.png";
      } else if (point >= 201 && point <= 300) {
          imagePath = "/img/3.png";
      } else if (point >= 301 && point <= 450) {
          imagePath = "/img/4.png";
      } else if (point >= 451 && point <= 600) {
          imagePath = "/img/5.png";
      } else if (point >= 601) {
          imagePath = "/img/6.png";
      }

      imgElement.src = imagePath;

    } else {
      $(".t1").text("No Reward Point");
    }
  });
}

$(document).ready(function () {
  getUser();
});

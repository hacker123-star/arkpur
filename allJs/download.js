    function fun1() {
      var x = document.getElementById("llinks");
      var y = document.getElementById('ll');
      if (x.style.display === "block") {
        x.style.display = "none";
        y.innerHTML = "Latest Version Link: 🔻";
      } else {
        x.style.display = "block";
        y.innerHTML = "Latest Version Link: 🔺";
      }
    }

    function fun2() {
      var x = document.getElementById("links");
      var y = document.getElementById('l');
      if (x.style.display === "block") {
        x.style.display = "none";
        y.innerHTML = "Links: 🔻";
      } else {
        x.style.display = "block";
        y.innerHTML = "Links: 🔺";
      }
    }
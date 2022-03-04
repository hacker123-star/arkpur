function myFunction() {
  var x = document.getElementById("house");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function myFunction2() {
  var x = document.getElementById("farm");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function myFunction3() {
  var x = document.getElementById("private");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function myFunction4() {
  var x = document.getElementById("other");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function previousChange() {
        var img = document.getElementById('change').src;
        if (img.indexOf('../memberInfo/screenshots/sudhanshuPeonyFarm.jpg')!=-1) {
            document.getElementById('change').src = '../memberInfo/screenshots/flowerFarm.jpg';
        }
    }
    function nextChange() {
      var img = document.getElementById('change').src;
      if (img.indexOf('../memberInfo/screenshots/flowerFarm.jpg')!=-1) {
        document.getElementById('change').src = '../memberInfo/screenshots/sudhanshuPeonyFarm.jpg';
      }
    }
    function previousChange2() {
      var img = document.getElementById('change2').src;
      if (img.indexOf('../memberInfo/screenshots/sudhanshuImmediateSugarcaneFarm.jpg')!=-1) {
        document.getElementById('change2').src = '../memberInfo/screenshots/sugarCaneFarm.jpg';
      }
    }
   function nextChange2() {
      var img = document.getElementById('change2').src;
      if (img.indexOf('../memberInfo/screenshots/sugarCaneFarm.jpg') != -1) {
        document.getElementById('change2').src = '../memberInfo/screenshots/sudhanshuImmediateSugarcaneFarm.jpg';
      }
    }
    function previousChange3() {
      var img = document.getElementById('change3').src;
      if (img.indexOf('../memberInfo/screenshots/hovercraftSystem2.jpg')!=-1) {
        document.getElementById('change3').src = '../memberInfo/screenshots/hovercraftSystem.jpg';
      }
    }
    function nextChange3() {
      var img = document.getElementById('change3').src;
      if (img.indexOf('../memberInfo/screenshots/myHouse.png') != -1) {
        document.getElementById('change3').src = '../screenshots/myHouse2.0.png';
      }
    }
    function previousChange0() {
      var img = document.getElementById('change0').src;
      if (img.indexOf('../screenshots/myHouse2.0.png')!=-1) {
        document.getElementById('change0').src = '../screenshots/myHouse0.png';
      }
    }
    function nextChange0() {
      var img = document.getElementById('change0').src;
      if (img.indexOf('../screenshots/myHouse0.png') != -1) {
        document.getElementById('change0').src = '../memberInfo/screenshots/myHouse2.0.png';
      }
    }
    function previousChange4() {
      var img = document.getElementById('change4').src;
      if (img.indexOf('../memberInfo/screenshots/deepanshuHouse2.jpg')!=-1) {
        document.getElementById('change4').src = '../memberInfo/screenshots/deepanshuHouse1.jpg';
      }
    }
    function nextChange4() {
      var img = document.getElementById('change4').src;
      if (img.indexOf('../memberInfo/screenshots/deepanshuHouse1.jpg') != -1) {
        document.getElementById('change4').src = '../memberInfo/screenshots/deepanshuHouse2.jpg';
      }
    }

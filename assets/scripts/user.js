function offerDetail(offerCard) {
  var i;
  var x = document.getElementsByClassName("info-offers");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  document.getElementById(offerCard).style.display = "block";  
}
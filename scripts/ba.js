const url = chrome.runtime.getURL("scripts/airports.json");
var obj;
fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

document.addEventListener("click", function(event){
    if (event.target.className.includes("link heading-uppercase-small")){
        var choseniti = event.target.className.substring(event.target.className.length-5,event.target.className.length);
        var spans = document.getElementsByTagName("span");
        for (let i=0;i<spans.length;i++){
            if (spans[i].getAttribute("data-cy")=="flight-origin-details"){
                if (spans[i].getAttribute("class").includes(choseniti)){
                    var depiata = spans[i].innerHTML.substring(spans[i].innerHTML.length-4,spans[i].innerHTML.length-1);
                }
            }
            else if (spans[i].getAttribute("data-cy")=="flight-destination-details"){
                if (spans[i].getAttribute("class").includes(choseniti)){
                    var arriata = spans[i].innerHTML.substring(spans[i].innerHTML.length-4,spans[i].innerHTML.length-1);
                }
            }
        }
        //document.getElementById("flight-origin-details");

    }
});

window.addEventListener("load", function(){
    var spans = document.getElementsByTagName("span");

});

//dev paused due to lack of IATA codes for layovers
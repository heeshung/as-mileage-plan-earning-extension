const url = chrome.runtime.getURL("scripts/airports.json");
var obj;
fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

document.addEventListener("click", function(){

    setTimeout(() => {

        try{
            var depiatas = findcitypairs("dep");
            var arriatas = findcitypairs("arr");
        
            var distances = []
        
            for (let i=0; i<depiatas.length; i++){
                var deplat = getairportcoord(depiatas[i],"lat");
                var deplon = getairportcoord(depiatas[i],"lon");
        
                var arrlat = getairportcoord(arriatas[i],"lat");
                var arrlon = getairportcoord(arriatas[i],"lon");
                distances.push(getDistanceFromLatLon(deplat,deplon,arrlat,arrlon));
            }
        
            var activetab = document.getElementsByClassName("mat-tab-label-active");
            var tabindex = (activetab[0].getAttribute("aria-posinset")-1);
        
            var activetab = 1;
            var tabindex = 1;            
        
            findbookcodes(depiatas,arriatas,distances,tabindex);
        }
        catch{
            return 1;
        }
    },250);
});

function roundandmult(distance,multiplier){
    var final = Math.round(distance*multiplier);
    if (final < 500){
        return 500;
    }
    else{
        return final;
    }
}

function findcitypairs(deporarr){
    if (deporarr == "dep"){
        try{
            var citypair = document.getElementsByClassName("cell tab-city-pair");
            var deps = [];
            for (let i=0; i<citypair.length; i++){
                deps.push(citypair[i].innerHTML.substring(0,3));
            }
            return deps;
        }
        catch{
            return 1;
        }
    }

    else if (deporarr == "arr"){
        try{
            var citypair = document.getElementsByClassName("cell tab-city-pair");
            var arrs = [];
            for (let i=0; i<citypair.length; i++){
                arrs.push(citypair[i].innerHTML.substring(6));
            }
            return arrs;
        }
        catch{
            return 1;
        }
    }
}

function getairportcoord(iatacode,latorlon){
    if (latorlon == "lat"){
        try{
            var lat = obj.airports.filter(e => e.iata == iatacode)[0].lat;
            return lat;
        }
        catch{
            return 1;
        }
    }

    else if (latorlon == "lon"){
        try{
            var lon = obj.airports.filter(e => e.iata == iatacode)[0].lon;
            return lon;
        }
        
        catch{
            return 1;
        }
    }   
}

function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
    //var R = 6371; // Radius of the earth in km
    var R = 3963  //radius in mi
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in mi/km
    return d;
}
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function findbookcodes(depiatas,arriatas,distances,tabindex){
    var bookcodesa = document.getElementsByTagName("li");
    for (let i=0; i<bookcodesa.length; i++){
        if (bookcodesa[i].innerHTML == "Booking code: O" || bookcodesa[i].innerHTML == "Booking code: Q" || bookcodesa[i].innerHTML == "Booking code: B"){
            bookcodesa[i].innerHTML += " (25% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],0.25);
        }
        else if (bookcodesa[i].innerHTML == "Booking code: N" || bookcodesa[i].innerHTML == "Booking code: S"){
            bookcodesa[i].innerHTML += " (50% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],0.5);
        }
        else if (bookcodesa[i].innerHTML == "Booking code: G" || bookcodesa[i].innerHTML == "Booking code: V"){
            bookcodesa[i].innerHTML += " (75% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],0.75);
        }
        else if (bookcodesa[i].innerHTML == "Booking code: H" || bookcodesa[i].innerHTML == "Booking code: K" || bookcodesa[i].innerHTML == "Booking code: L" || bookcodesa[i].innerHTML == "Booking code: M" || bookcodesa[i].innerHTML == "Booking code: Y" || bookcodesa[i].innerHTML == "Booking code: P"){
            bookcodesa[i].innerHTML += " (100% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],1);
        }
        else if (bookcodesa[i].innerHTML == "Booking code: W"){
            bookcodesa[i].innerHTML += " (110% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],1.1);
        }
        else if (bookcodesa[i].innerHTML == "Booking code: D" || bookcodesa[i].innerHTML == "Booking code: I" || bookcodesa[i].innerHTML == "Booking code: R" || bookcodesa[i].innerHTML == "Booking code: A"){
            bookcodesa[i].innerHTML += " (150% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],1.5);
        }
        else if (bookcodesa[i].innerHTML == "Booking code: H" || bookcodesa[i].innerHTML == "Booking code: J" || bookcodesa[i].innerHTML == "Booking code: F"){
            bookcodesa[i].innerHTML += " (200% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],2.0);
        }
    }
    var bookcodes = document.getElementsByClassName("booking-code");
    Array.prototype.forEach.call(bookcodes, function(bookcode){
        if (bookcode.innerHTML == "O" || bookcode.innerHTML == "Q" || bookcode.innerHTML == "B"){
            bookcode.innerHTML += " (25% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],0.25);
        }
        else if (bookcode.innerHTML == "N" || bookcode.innerHTML == "S"){
            bookcode.innerHTML += " (50% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],0.5);
        }
        else if (bookcode.innerHTML == "G" || bookcode.innerHTML == "V"){
            bookcode.innerHTML += " (75% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],0.75);
        }
        else if (bookcode.innerHTML == "H" || bookcode.innerHTML == "K" || bookcode.innerHTML == "L" || bookcode.innerHTML == "M" || bookcode.innerHTML == "Y" || bookcode.innerHTML == "P"){
            bookcode.innerHTML += " (100% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],1);
        }
        else if (bookcode.innerHTML == "W"){
            bookcode.innerHTML += " (110% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],1.1);
        }
        else if (bookcode.innerHTML == "D" || bookcode.innerHTML == "I" || bookcode.innerHTML == "R" || bookcode.innerHTML == "A"){
            bookcode.innerHTML += " (150% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],1.5);
        }
        else if (bookcode.innerHTML == "J" || bookcode.innerHTML == "F"){
            bookcode.innerHTML += " (200% AS EQM & RDM) Estimated AS EQMs & RDMs Earned: " + roundandmult(distances[tabindex],2.0);
        }
    });
}
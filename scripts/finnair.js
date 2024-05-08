const url = chrome.runtime.getURL("scripts/airports.json");
var obj;
fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

document.addEventListener("mousedown", function(){

    setTimeout(() => {
        try{
            var depiatas = findcitypairs("dep");
            var arriatas = findcitypairs("arr");
        
            var distances = [];
        
            for (let i=0; i<depiatas.length; i++){
                var deplat = getairportcoord(depiatas[i],"lat");
                var deplon = getairportcoord(depiatas[i],"lon");
        
                var arrlat = getairportcoord(arriatas[i],"lat");
                var arrlon = getairportcoord(arriatas[i],"lon");
                distances.push(getDistanceFromLatLon(deplat,deplon,arrlat,arrlon));
            }
            
        
            findbookcodes(depiatas,arriatas,distances);
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
        var alldivs = document.getElementsByTagName("div");
        var deps = [];
        for (let i=0; i<alldivs.length; i++){
            if (alldivs[i].innerHTML == "Travel class" && alldivs[i].classList.contains("nordic-blue-900-text")){
                i++;
                while (alldivs[i].classList.contains("medium-type") && alldivs[i].classList.contains("ng-star-inserted")){
                    deps.push(alldivs[i].innerHTML.substring(1,4));
                    i++;
                }
            }
        }
        return deps;
    }

    else if (deporarr == "arr"){
        var alldivs = document.getElementsByTagName("div");
        var arrs = [];
        for (let i=0; i<alldivs.length; i++){
            if (alldivs[i].innerHTML == "Travel class" && alldivs[i].classList.contains("nordic-blue-900-text")){
                i++;
                while (alldivs[i].classList.contains("medium-type") && alldivs[i].classList.contains("ng-star-inserted")){
                    arrs.push(alldivs[i].innerHTML.substring(5,8));
                    i++;
                }
            }
        }
        return arrs;
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

function findbookcodes(depiatas,arriatas,distances){
    var opby = [];
    var flightclasses = [];
    var divindices = [];
    var alldivs = document.getElementsByTagName("div");
    var showasterisk = 0;
    var asteriskprinted = 0;

    //find travel classes
    for (let i=0; i<alldivs.length; i++){
        if (alldivs[i].innerHTML == "Travel class" && alldivs[i].classList.contains("nordic-blue-900-text")){
            i++;
            while (alldivs[i].classList.contains("medium-type") && alldivs[i].classList.contains("ng-star-inserted")){
                flightclasses.push(alldivs[i].innerText.substring(alldivs[i].innerText.length-1));
                divindices.push(i);
                i++;
            }
        }
    }

    //find operated by airlines
    for (let i=0; i<alldivs.length; i++){
        if (alldivs[i].innerHTML == "Operated by" && alldivs[i].classList.contains("nordic-blue-900-text")){
            i++;
            while (alldivs[i].classList.contains("medium-type") && alldivs[i].classList.contains("ng-star-inserted")){
                if (alldivs[i].innerHTML.includes("Finnair")){
                    opby.push(1);
                }
                else {
                    opby.push(0);
                }
                i++;
            }
            var panelend = i;
        }
    }

    for (let i=0; i<divindices.length; i++){
        if (opby[i]==0){
            if (alldivs[divindices[i]].innerHTML.substring(alldivs[divindices[i]].innerHTML.length-1) != "*"){
                alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp0 AS EQMs & RDMs Earned*";
            }
            showasterisk = 1;
        }
        else if (opby[i] == 1){
            if (alldivs[divindices[i]].innerHTML.substring(alldivs[divindices[i]].innerHTML.length-1) != ")"){
                if (flightclasses[i] == "A" || flightclasses[i] == "G"){
                    alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp" + roundandmult(distances[i],0.25) + " AS EQMs & RDMs Earned (25%)";
                }
                else if (flightclasses[i] == "K" || flightclasses[i] == "M" || flightclasses[i] == "L" || flightclasses[i] == "V" || flightclasses[i] == "S" || flightclasses[i] == "N" || flightclasses[i] == "Q" || flightclasses[i] == "O" || flightclasses[i] == "Z"){
                    alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp" + roundandmult(distances[i],0.5) + " AS EQMs & RDMs Earned (50%)";
                }
                else if (flightclasses[i] == "Y" || flightclasses[i] == "B" || flightclasses[i] == "H"){
                    alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp" + roundandmult(distances[i],1.00) + " AS EQMs & RDMs Earned (100%)";
                }
                else if (flightclasses[i] == "W" || flightclasses[i] == "E" || flightclasses[i] == "T" || flightclasses[i] == "P"){
                    alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp" + roundandmult(distances[i],1.00) + " AS EQMs & RDMs Earned (100%)";
                }
                else if (flightclasses[i] == "I" || flightclasses[i] == "R"){
                    alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp" + roundandmult(distances[i],1.25) + " AS EQMs & RDMs Earned (125%)";
                }
                else if (flightclasses[i] == "J" || flightclasses[i] == "C" || flightclasses[i] == "D"){
                    alldivs[divindices[i]].innerHTML += "<br>&nbsp&nbsp" + roundandmult(distances[i],2.0) + " AS EQMs (200%) +<br>&nbsp&nbsp" + roundandmult(distances[i],3.0) + " AS RDMs Earned (300%)";
                }
            }
        }
    }

    //see if footnote has already been added
    if (document.getElementsByClassName("asterisk").length > 0){
        asteriskprinted = 1;
    }

    //add footnote if needed
    if (asteriskprinted == 0 && showasterisk == 1){
        var child = document.createElement("div");
        child.className = "asterisk";
        child.innerHTML = "<br>*Flight number not eligible for AS earning";
        alldivs[panelend-1].appendChild(child);
    }
}
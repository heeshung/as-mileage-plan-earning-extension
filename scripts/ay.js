const url = chrome.runtime.getURL("scripts/airports.json");
var obj;
fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

setInterval(() => {
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
},2000);

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
        //also process details and upgrades pane
        var middlepage = document.querySelectorAll("span.itinerary-endpoint-location");
        for (let i=0;i<middlepage.length;i+=2){
            let iata_pos = middlepage[i].innerText.indexOf("(");
            deps.push(middlepage[i].innerText.substring(iata_pos+1,iata_pos+4));
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
        //also process details and upgrades pane
        var middlepage = document.querySelectorAll("span.itinerary-endpoint-location");
        for (let i=1;i<middlepage.length;i+=2){
            let iata_pos = middlepage[i].innerText.indexOf("(");
            arrs.push(middlepage[i].innerText.substring(iata_pos+1,iata_pos+4));
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
    var showasterisk = false;
    var asteriskprinted = false;

    //search middle page
    var middle_p = document.querySelectorAll("[data-test-flight-details]");

    for (let i=0;i<middle_p.length;i++){
        //check not already modified
        if (middle_p[i].innerText.includes("%")==false){
            if (middle_p[i].innerText.includes("Economy") || middle_p[i].innerText.includes("Premium Economy")){
                if (middle_p[i].innerText.includes("Premium Economy")){
                    var class_pos = middle_p[i].innerHTML.indexOf("Premium Economy")+16;
                    var fareclass = middle_p[i].innerHTML.substring(class_pos,class_pos+1)
                }
                else if (middle_p[i].innerText.includes("Economy")){
                    var class_pos = middle_p[i].innerHTML.indexOf("Economy")+8;
                    var fareclass = middle_p[i].innerHTML.substring(class_pos,class_pos+1)
                }
                if (middle_p[i].innerText.includes("Operated by Finnair")){
                    if (fareclass == "A" || fareclass == "W" || fareclass == "G"){
                        middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (25%)<br>AS EQMs Earned: "+roundandmult(distances[i],0.25)+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                    }
                    else if (fareclass == "K" || fareclass == "M" || fareclass == "P" || fareclass == "T" || fareclass == "V" || fareclass == "L" || fareclass == "N" || fareclass == "S" || fareclass == "Q" || fareclass == "O" || fareclass == "Z" || fareclass == "R"){
                        middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (50%)<br>AS EQMs Earned: "+roundandmult(distances[i],0.5)+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                    }
                    else if (fareclass == "Y" || fareclass == "B" || fareclass == "H"){
                        middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (100%)<br>AS EQMs Earned: "+roundandmult(distances[i],1)+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                    }
                }
                else {
                    middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (0%)*<br>AS EQMs Earned: 0*<br>*Flight number is not eligible for AS earning"+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                }
            }
            else if (middle_p[i].innerText.includes("Business")){
                var class_pos = middle_p[i].innerHTML.indexOf("Business")+9;
                var fareclass = middle_p[i].innerHTML.substring(class_pos,class_pos+1)
                if (middle_p[i].innerText.includes("Operated by Finnair")){
                    if (fareclass == "I" || fareclass == "R"){
                        middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (125%)<br>AS EQMs Earned: "+roundandmult(distances[i],1.25)+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                    }
                    else if (fareclass == "J" || fareclass == "C" || fareclass == "D"){
                        middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (200%)<br>AS EQMs Earned: "+roundandmult(distances[i],2)+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                    }
                    else {
                        middle_p[i].innerHTML=middle_p[i].innerHTML.substring(0,class_pos+1)+" (0%)*<br>AS EQMs Earned: 0*<br>*Flight number is not eligible for AS earning"+middle_p[i].innerHTML.substring(class_pos+1,middle_p[i].innerHTML.length);
                    }
                }
            }
        }
    }

    //find travel classes
    for (let i=0; i<alldivs.length; i++){
        if (alldivs[i].innerHTML == "Travel class" && alldivs[i].classList.contains("nordic-blue-900-text")){
            i++;
            while (alldivs[i].classList.contains("medium-type") && alldivs[i].classList.contains("ng-star-inserted")){
                //exception for business R fare
                if (alldivs[i].innerText.includes("Business") && alldivs[i].innerText.substring(alldivs[i].innerText.length-1)=="R"){
                    flightclasses.push("BUSR");
                }
                else {
                    flightclasses.push(alldivs[i].innerText.substring(alldivs[i].innerText.length-1));
                }
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
                    opby.push(true);
                }
                else {
                    opby.push(false);
                }
                i++;
            }
            var panelend = i;
        }
    }

    for (let i=0; i<divindices.length; i++){
        if (opby[i]==false){
            if (alldivs[divindices[i]].innerHTML.substring(alldivs[divindices[i]].innerHTML.length-1) != "*"){
                alldivs[divindices[i]].innerHTML += "(0%)*<br>&nbsp&nbspAS EQMs Earned: 0*";
            }
            showasterisk = true;
        }
        else if (opby[i] == true){
            if (alldivs[divindices[i]].innerHTML.substring(alldivs[divindices[i]].innerHTML.length-1) != ")"){
                if (flightclasses[i] == "A" || flightclasses[i] == "W" || flightclasses[i] == "G"){
                    alldivs[divindices[i]].innerHTML += "(25%)<br>&nbsp&nbsp" + "AS EQMs Earned: " + roundandmult(distances[i],0.25);
                }
                else if (flightclasses[i] == "K" || flightclasses[i] == "M" || flightclasses[i] == "P" || flightclasses[i] == "T" || flightclasses[i] == "V" || flightclasses[i] == "L" || flightclasses[i] == "N" || flightclasses[i] == "S" || flightclasses[i] == "Q" || flightclasses[i] == "O" || flightclasses[i] == "Z" || flightclasses[i] == "R"){
                    alldivs[divindices[i]].innerHTML += "(50%)<br>&nbsp&nbsp" + "AS EQMs Earned: " + roundandmult(distances[i],0.5);
                }
                else if (flightclasses[i] == "Y" || flightclasses[i] == "B" || flightclasses[i] == "H"){
                    alldivs[divindices[i]].innerHTML += "(100%)<br>&nbsp&nbsp" + "AS EQMs Earned: " + roundandmult(distances[i],1.00);
                }
                else if (flightclasses[i] == "I" || flightclasses[i] == "BUSR"){
                    alldivs[divindices[i]].innerHTML += "(125%)<br>&nbsp&nbsp" + "AS EQMs Earned: " + roundandmult(distances[i],1.25);
                }
                else if (flightclasses[i] == "J" || flightclasses[i] == "C" || flightclasses[i] == "D"){
                    alldivs[divindices[i]].innerHTML += "(200%)<br>&nbsp&nbsp" + "AS EQMs Earned: " + roundandmult(distances[i],2.0);
                }
            }
        }
    }

    //see if footnote has already been added
    if (document.getElementsByClassName("asterisk").length > 0){
        asteriskprinted = true;
    }

    //add footnote if needed
    if (asteriskprinted == false && showasterisk == true){
        var child = document.createElement("div");
        child.className = "asterisk";
        child.innerHTML = "<br>*Flight number is not eligible for AS earning";
        alldivs[panelend-1].appendChild(child);
    }
}
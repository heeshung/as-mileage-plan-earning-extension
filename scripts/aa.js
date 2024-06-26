const url = chrome.runtime.getURL("airports/airports.json");
var obj;
fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

document.addEventListener("click", function(){

    setTimeout(() => {

        try{
            //find departure and arrival airports
            var depiatas = findcitypairs("dep");
            var arriatas = findcitypairs("arr");
        
            var distances = []
            
            //iterate through list of routes and find distances
            for (let i=0; i<depiatas.length; i++){
                var deplat = getairportcoord(depiatas[i],"lat");
                var deplon = getairportcoord(depiatas[i],"lon");
        
                var arrlat = getairportcoord(arriatas[i],"lat");
                var arrlon = getairportcoord(arriatas[i],"lon");
                distances.push(getDistanceFromLatLon(deplat,deplon,arrlat,arrlon));
            }
            
            //determine active tab to show relative distance for leg
            var activetab = document.getElementsByClassName("mdc-tab--active");
            var tabindex = (activetab[0].getAttribute("aria-posinset")-1);
        
            
        
            findbookcodes(distances,tabindex);
        }
        catch{
            var activetab = 1;
            var tabindex = 1;
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
            //grab legs in case of multi-leg itineraries
            var citypair = document.getElementsByClassName("cell tab-city-pair");
            var deps = [];
            for (let i=0; i<citypair.length; i++){
                deps.push(citypair[i].innerHTML.substring(0,3));
            }
            if (deps.length>0){
                return deps;
            }
            //grab flight in case of single flight itinerary
            else {
                var citycodes = document.getElementsByClassName("city-code");
                deps.push(citycodes[0].innerHTML);
                return deps;
            }
        }
        catch{
            return 1;
        }
    }

    else if (deporarr == "arr"){
        try{
            //grab legs in case of multi-leg itineraries
            var citypair = document.getElementsByClassName("cell tab-city-pair");
            var arrs = [];
            for (let i=0; i<citypair.length; i++){
                arrs.push(citypair[i].innerHTML.substring(6));
            }
            if (arrs.length>0){
                return arrs;
            }
            //grab flight in case of single flight itinerary
            else {
                var citycodes = document.getElementsByClassName("city-code");
                arrs.push(citycodes[1].innerHTML);
                return arrs;
            }
        }
        catch{
            return 1;
        }
    }
}

function getairportcoord(iatacode,latorlon){
    if (latorlon == "lat"){
        try{
            var lat = Object.values(obj).filter(e => e.iata == iatacode)[0].lat;
            return lat;
        }
        catch{
            return 1;
        }
    }

    else if (latorlon == "lon"){
        try{
            var lon = Object.values(obj).filter(e => e.iata == iatacode)[0].lon;
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

function findbookcodes(distances,tabindex){
    var classlabelexample = document.querySelectorAll("span.class-label");
    var footnoteattr = classlabelexample[0].getAttributeNames()[0];
    console.log(footnoteattr);
    var bookcodes = document.getElementsByClassName("booking-code");
    //check if flight has AA flight number
    var flightnumbers = document.getElementsByClassName("flight-number");
    for (let i=0;i<flightnumbers.length;i++){
        if (flightnumbers[i].attributes.length==1){
            var flightnumber = flightnumbers[i].innerHTML;
            //add asterisk
            if (flightnumbers[i].innerHTML.includes("AA")==false && flightnumbers[i].innerHTML.includes("*")==false){
                flightnumbers[i].innerHTML+="*"
            }
            break;
        }
    }

    Array.prototype.forEach.call(bookcodes, function(bookcode){
        var showasterisk = false;
        if (flightnumber.includes("AA")==true){
            if (bookcode.innerHTML == "O" || bookcode.innerHTML == "Q" || bookcode.innerHTML == "B"){
                bookcode.innerHTML += " (25%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],0.25);
            }
            else if (bookcode.innerHTML == "N" || bookcode.innerHTML == "S"){
                bookcode.innerHTML += " (50%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],0.5);
            }
            else if (bookcode.innerHTML == "G" || bookcode.innerHTML == "V"){
                bookcode.innerHTML += " (75%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],0.75);
            }
            else if (bookcode.innerHTML == "H" || bookcode.innerHTML == "K" || bookcode.innerHTML == "L" || bookcode.innerHTML == "M" || bookcode.innerHTML == "Y" || bookcode.innerHTML == "P"){
                bookcode.innerHTML += " (100%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],1);
            }
            else if (bookcode.innerHTML == "W"){
                bookcode.innerHTML += " (110%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],1.1);
            }
            else if (bookcode.innerHTML == "D" || bookcode.innerHTML == "I" || bookcode.innerHTML == "R" || bookcode.innerHTML == "A"){
                bookcode.innerHTML += " (150%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],1.5);
            }
            else if (bookcode.innerHTML == "J" || bookcode.innerHTML == "F"){
                bookcode.innerHTML += " (200%)<br>AS EQMs Earned: " + roundandmult(distances[tabindex],2.0);
            }
            else if (bookcode.innerHTML.length==1 && bookcode.innerHTML.match(/[a-z]/i)){
                bookcode.innerHTML += " (0%)*<br>AS EQMs Earned: 0*";
                showasterisk = true;
            }
        }
        else if (flightnumber.includes("*")==false){
            bookcode.innerHTML += " (0%)*<br>AS EQMs Earned: 0*";
            showasterisk = true;
        }
        //print footnote if required
        if (showasterisk==true){
            var appproductdet = document.getElementsByTagName("app-product-details");
            //check if already printed
            if (appproductdet[0].innerHTML.includes("*Flight number or fare class is not eligible for AS earning")==false){
                appproductdet[0].innerHTML+='<div _ngcontent-uaj-c51="" class="cell product-divider large-12 ng-star-inserted">&nbsp;</div><div '+footnoteattr+'="" class="product-item">*Flight number or fare class is not eligible for AS earning</div>'
            }
        }
    });
}
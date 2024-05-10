const url = chrome.runtime.getURL("scripts/airports.json");
var obj;
fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

document.addEventListener("click", function(){
    setTimeout(() => {
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
        findbookcodes(distances);
    },500);
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
    var all_iatas = document.getElementsByClassName("bsp-flight-content_description_hour");
    var cabin_class = document.querySelectorAll("strong.bsp-cabin-class");
    var output = [];
    if (cabin_class.length>0){
        if (deporarr=="dep"){
            for (let i=all_iatas.length-(cabin_class.length*2);i<all_iatas.length;i+=2){
                output.push(all_iatas[i].innerText.substring(0,3));
            }
        }
        else if (deporarr=="arr"){
            for (let i=all_iatas.length-(cabin_class.length*2)+1;i<all_iatas.length;i+=2){
                output.push(all_iatas[i].innerText.substring(0,3));
            }
        }
    }
    return output;
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

function findbookcodes(distances){
    var cabin_class = document.querySelectorAll("strong.bsp-cabin-class");
    var op_by = document.querySelectorAll("strong.bsp-airline");
    for (let i=0;i<cabin_class.length;i++){
        if (op_by[i].innerText=="Singapore Airlines"){
            let cabin_class_trimmed = cabin_class[i].innerText.substring(cabin_class[i].innerText.length-2,cabin_class[i].innerText.length-1);
            if (cabin_class_trimmed=="H" || cabin_class_trimmed=="W"){
                cabin_class[i].innerHTML+="<span> (50%)<br>AS EQMs Earned:</span>"+roundandmult(distances[i],0.5);
            }
            else if (cabin_class_trimmed=="E" || cabin_class_trimmed=="M"){
                cabin_class[i].innerHTML+="<span> (75%)<br>AS EQMs Earned: </span>"+roundandmult(distances[i],0.75);
            }
            else if (cabin_class_trimmed=="Y" || cabin_class_trimmed=="B"){
                cabin_class[i].innerHTML+="<span> (100%)<br>AS EQMs Earned: </span>"+roundandmult(distances[i],1);
            }
            else if (cabin_class_trimmed=="L" || cabin_class_trimmed=="S" || cabin_class_trimmed=="T" || cabin_class_trimmed=="P" || cabin_class_trimmed=="R"){
                cabin_class[i].innerHTML+="<span> (100%)<br>AS EQMs Earned: </span>"+roundandmult(distances[i],1);
            }
            else if (cabin_class_trimmed=="U" || cabin_class_trimmed=="D"){
                cabin_class[i].innerHTML+="<span> (100%)<br>AS EQMs Earned: </span>"+roundandmult(distances[i],1);
            }
            else if (cabin_class_trimmed=="Z" || cabin_class_trimmed=="C" || cabin_class_trimmed=="J"){
                cabin_class[i].innerHTML+="<span> (125%)<br>AS EQMs Earned: </span>"+roundandmult(distances[i],1.25);
            }
            else if (cabin_class_trimmed=="F" || cabin_class_trimmed=="A"){
                cabin_class[i].innerHTML+="<span> (150%)<br>AS EQMs Earned: </span>"+roundandmult(distances[i],1.5);
            }
            else if (cabin_class_trimmed=="V" || cabin_class_trimmed=="K" || cabin_class_trimmed=="Q" || cabin_class_trimmed=="N"){
                cabin_class[i].innerHTML+="<span> (0%)*<br>AS EQMs Earned: 0*<br>*Fare class is not eligible for AS earning</span>";
            }
        }
        else {
            if (cabin_class[i].innerText.includes("*Flight number is not eligible for AS earning")==false){
                cabin_class[i].innerHTML+="<span> (0%)*<br>AS EQMs Earned: 0*<br>*Flight number is not eligible for AS earning</span>";
            }
        }
    }
    return 0;
}
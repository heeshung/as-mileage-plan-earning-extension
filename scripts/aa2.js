const url2 = chrome.runtime.getURL("airports/airports.json");
var obj;
fetch(url2)
    .then(response => {
        return response.json();
    })
    .then(data => obj = data);

window.addEventListener("load", function(){

    setTimeout(() => {
        var allscripts = document.scripts;
        var utagindex = 0;

        //find where utag_data begins
        for (let i=0; i<allscripts.length; i++){
            if (allscripts[i].text.includes("utag_data")){
                utagindex = i;
                break;
            }
        }

        //grab json portion of utag_data
        var jsonbegin = 0;
        var jsonend = 0;
        jsonbegin = allscripts[utagindex].text.search("{");
        jsonend = allscripts[utagindex].text.search("}");

        //remove tabs and delineate data
        var splitjson = allscripts[utagindex].text.substring(jsonbegin+1,jsonend-1).replace(/[ \t]/g,"");
        splitarray = splitjson.split(/[\n\r:]/g)
        var utagdict = {};

        //find keys in utag_data
        for (let i=0; i<splitarray.length-1; i++){
            if (splitarray[i].includes('"') == false){
                utagdict[splitarray[i]] = splitarray[i+1];
            }        
        }


        try{
            //find departure and arrival airports
            var depiatas = findcitypairs(utagdict.segment_city_pair,"dep");
            var arriatas = findcitypairs(utagdict.segment_city_pair,"arr");
        
            var distances = []
            
            //iterate through list of routes and find distances
            for (let i=0; i<depiatas.length; i++){
                var deplat = getairportcoord(depiatas[i],"lat");
                var deplon = getairportcoord(depiatas[i],"lon");
        
                var arrlat = getairportcoord(arriatas[i],"lat");
                var arrlon = getairportcoord(arriatas[i],"lon");
                distances.push(getDistanceFromLatLon(deplat,deplon,arrlat,arrlon));
            }

            var classes = findclasses(utagdict.segment_fare_brand_code);
            var farecodes = findfarecodes(utagdict.fare_basis_codes, classes);
            var carriers = findcarriers(utagdict.segment_operating_carrier_code);
            var flightnums = findflightnumbers(utagdict.segment_flight_number);
            displayearnings(depiatas,arriatas,distances,farecodes,classes,carriers,flightnums,utagdict.true_ond,utagdict.trip_type);
        }

        catch {
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

function findclasses(classesraw){
    var classesstring = classesraw.split('"');
    try{
        var classes = [];
        for (let i=0; i<classesstring.length; i++){
            if (classesstring[i].match(/[A-Z]/g)){
                classes.push(classesstring[i]);
            }
        }
        return classes;
    }
    catch {
        return 1;
    }
}

function findcarriers(carriercoderaw){
    var carriercodestring = carriercoderaw.split('"');
    try {
        var carriers = [];
        for (let i=0; i<carriercodestring.length; i++){
            if (carriercodestring[i].match(/[A-Z]/g)){
                carriers.push(carriercodestring[i]);
            }
        }
        return carriers;
    }
    catch {
        return 1;
    }
}

function findflightnumbers(flightnumberraw){
    var flightnumberstring = flightnumberraw.split('"');
    try{
        var flightnums = [];
        for (let i=0; i<flightnumberstring.length; i++){
            if (flightnumberstring[i].match(/\d+/g)!=null){
                flightnums.push(flightnumberstring[i]);
            }
        }
        return flightnums;
    }
    catch {
        return 1;
    }
}

function findfarecodes(farecodesraw,classes){
    var farecodestring = farecodesraw.split('"');
    try {
        var farecodes = [];
        var farecodesfiltered = [];
        for (let i=0; i<farecodestring.length; i++){
            if (farecodestring[i].length>5){
                farecodesfiltered.push(farecodestring[i]);              
            }
        }
        for (let i=0; i<farecodesfiltered.length; i++){
            if (classes[i] == "FIR" || classes[i] == "BASIC"){
                farecodes.push(farecodesfiltered[i][farecodesfiltered[i].length-2])
            }
            else {
                farecodes.push(farecodesfiltered[i][0]);
            }
        }
        return farecodes;
    }
    catch {
        return 1;
    }
}

function findcitypairs(citypairraw,deporarr){
    var citypair = citypairraw.split('"');
    if (deporarr == "dep"){
        try{
            //grab legs in case of multi-leg itineraries
            var deps = [];
            for (let i=0; i<citypair.length; i++){
                if (citypair[i].length == 7){
                    deps.push(citypair[i].substring(0,3));
                }  
            }
            return deps;
        }
        catch{
            return 1;
        }
    }

    else if (deporarr == "arr"){
        try{
            //grab legs in case of multi-leg itineraries
            var arrs = [];
            for (let i=0; i<citypair.length; i++){
                if (citypair[i].length == 7){
                    arrs.push(citypair[i].substring(4));
                }   
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

function displayearnings(depiatas,arriatas,distances,farecodes,classes,carriers,flightnums,true_ond,trip_type){
    var roundtrip = 0;
    //get origin and final destination
    var origin = true_ond.substring(1,4);
    var destination = true_ond.substring(true_ond.length-5,true_ond.length-2); 
    //determine if trip is roundtrip
    if (trip_type[1]=="R"){
        roundtrip = 1
    }

    var citicarddiv = document.getElementsByClassName("span8");
    citicarddiv[0].innerHTML='';
    var adjusteddistances = [];

    let i=0;
    var showasterisk=false;
    if (roundtrip==0){
        while (i<depiatas.length){
            if (carriers[i]=="AA"){
                if (farecodes[i]=="O" || farecodes[i]=="Q" || farecodes[i]=="B"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (25%)<br>AS EQMs earned: "+roundandmult(distances[i],0.25)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.25));
                }
                else if (farecodes[i]=="N" || farecodes[i]=="S"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (50%)<br>AS EQMs earned: "+roundandmult(distances[i],0.5)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.5));
                }
                else if (farecodes[i]=="G" || farecodes[i]=="V"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (75%)<br>AS EQMs earned: "+roundandmult(distances[i],0.75)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.75));
                }
                else if (farecodes[i]=="H" || farecodes[i]=="K" || farecodes[i]=="L" || farecodes[i]=="M" || farecodes[i]=="Y" || farecodes[i]=="P"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (100%)<br>AS EQMs earned: "+roundandmult(distances[i],1.00)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.0));
                }
                else if (farecodes[i]=="W"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (110%)<br>AS EQMs earned: "+roundandmult(distances[i],1.10)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.10));
                }
                else if (farecodes[i]=="D" || farecodes[i]=="I" || farecodes[i]=="R" || farecodes[i]=="A"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (150%)<br>AS EQMs earned: "+roundandmult(distances[i],1.50)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.50));
                }
                else if (farecodes[i]=="J" || farecodes[i]=="F"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (200%)<br>AS EQMs earned: "+roundandmult(distances[i],2.00)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],2.00));
                }
                else if (farecodes[i].match(/[a-z]/i)){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (0%)*<br>AS EQMs earned: 0*<br><br>");
                    showasterisk=true;
                }
            }
            else {
                citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (0%)*<br>AS EQMs earned: 0*<br><br>");
                showasterisk=true;
            }
            i++;
        }
        //add footnote if needed
        if (showasterisk==true){
            citicarddiv[0].innerHTML+='<small>*Flight number or fare class is not eligible for AS earning</small><br>'
        }
    }

    else if (roundtrip == 1){
        citicarddiv[0].innerHTML+='<h3 id="costSummaryTitle" class="aaDarkGray no-margin-bottom">Outbound Flights:</h3>';
        while (depiatas[i]!=destination){
            if (carriers[i]=="AA"){
                if (farecodes[i]=="O" || farecodes[i]=="Q" || farecodes[i]=="B"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (25%)<br>AS EQMs earned: "+roundandmult(distances[i],0.25)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.25));
                }
                else if (farecodes[i]=="N" || farecodes[i]=="S"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (50%)<br>AS EQMs earned: "+roundandmult(distances[i],0.5)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.50));
                }
                else if (farecodes[i]=="G" || farecodes[i]=="V"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (75%)<br>AS EQMs earned: "+roundandmult(distances[i],0.75)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.75));
                }
                else if (farecodes[i]=="H" || farecodes[i]=="K" || farecodes[i]=="L" || farecodes[i]=="M" || farecodes[i]=="Y" || farecodes[i]=="P"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (100%)<br>AS EQMs earned: "+roundandmult(distances[i],1.00)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.00));
                }
                else if (farecodes[i]=="W"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (110%)<br>AS EQMs earned: "+roundandmult(distances[i],1.10)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.10));
                }
                else if (farecodes[i]=="D" || farecodes[i]=="I" || farecodes[i]=="R" || farecodes[i]=="A"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (150%)<br>AS EQMs earned: "+roundandmult(distances[i],1.50)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.50));
                }
                else if (farecodes[i]=="J" || farecodes[i]=="F"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (200%)<br>AS EQMs earned: "+roundandmult(distances[i],2.00)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],2.00));
                }
                else if (farecodes[i].match(/[a-z]/i)){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (0%)*<br>AS EQMs earned: 0*<br><br>");
                    showasterisk=true;
                }
            }
            else {
                citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (0%)*<br>AS EQMs earned: 0*<br><br>");
                showasterisk=true;
            }
            i++;
        }
        citicarddiv[0].innerHTML+=('<br><h3 id="costSummaryTitle" class="aaDarkGray no-margin-bottom">Return Flights:</h3>');
        while (i<depiatas.length){
            if (carriers[i]=="AA"){
                if (farecodes[i]=="O" || farecodes[i]=="Q" || farecodes[i]=="B"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (25%)<br>AS EQMs earned: "+roundandmult(distances[i],0.25)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.25));
                }
                else if (farecodes[i]=="N" || farecodes[i]=="S"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (50%)<br>AS EQMs earned: "+roundandmult(distances[i],0.5)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.50));
                }
                else if (farecodes[i]=="G" || farecodes[i]=="V"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (75%)<br>AS EQMs earned: "+roundandmult(distances[i],0.75)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],0.75));
                }
                else if (farecodes[i]=="H" || farecodes[i]=="K" || farecodes[i]=="L" || farecodes[i]=="M" || farecodes[i]=="Y" || farecodes[i]=="P"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (100%)<br>AS EQMs earned: "+roundandmult(distances[i],1.00)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.00));
                }
                else if (farecodes[i]=="W"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (110%)<br>AS EQMs earned: "+roundandmult(distances[i],1.10)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.10));
                }
                else if (farecodes[i]=="D" || farecodes[i]=="I" || farecodes[i]=="R" || farecodes[i]=="A"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (150%)<br>AS EQMs earned: "+roundandmult(distances[i],1.50)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],1.50));
                }
                else if (farecodes[i]=="J" || farecodes[i]=="F"){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (200%)<br>AS EQMs earned: "+roundandmult(distances[i],2.00)+"<br><br>");
                    adjusteddistances.push(roundandmult(distances[i],2.00));
                }
                else if (farecodes[i].match(/[a-z]/i)){
                    citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (0%)*<br>AS EQMs earned: 0*<br><br>");
                    showasterisk=true;
                }
            }
            else {
                citicarddiv[0].innerHTML+=(carriers[i]+flightnums[i]+" "+depiatas[i]+"-"+arriatas[i]+" "+classes[i]+" "+farecodes[i]+" (0%)*<br>AS EQMs earned: 0*<br><br>");
                showasterisk=true;
            }
            i++;
        }
        //add footnote if needed
        if (showasterisk==true){
            citicarddiv[0].innerHTML+='<small>*Flight number or fare class is not eligible for AS earning</small><br>'
        }
    }
    var totalmileage = 0;
    for (let i=0; i<adjusteddistances.length; i++){
        totalmileage+=adjusteddistances[i];
    }
    citicarddiv[0].innerHTML+=('<br><h3 id="costSummaryTitle" class="aaDarkGray no-margin-bottom">Total AS EQMs Earned: '+totalmileage+'</h3>');
}
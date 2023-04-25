document.addEventListener("click", function(){
    var allscripts = document.scripts;
    var utagindex = 0;
    for (let i=0; i<allscripts.length; i++){
        if (allscripts[i].text.includes("utag_data")){
            utagindex = i;
            break;
        }
    }

    var jsonbegin = 0;
    var jsonend = 0;
    jsonbegin = allscripts[utagindex].text.search("{");
    jsonend = allscripts[utagindex].text.search("}");

    const scriptsub = JSON.parse(allscripts[utagindex].text.substring(jsonbegin,jsonend+1));
    console.log(scriptsub.page_name);


});
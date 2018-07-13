var quests = new Object();

$(function (){

});

$(document).ready(function() {
    init();
    makeQuests();
    refresh();


});

function init(){
    $.ajax({
        type: "GET",
        url: "files/event.csv",
        dataType: "text",
        success: function(data) {
            makeQuests(data);
        }
    });
}

function readCSV(myFile){
    console.log(myFile.files[0].name);
    var reader = new FileReader();
    reader.onload = function () {
        //csv2series(myFile.files[0].name.slice(0,-4), CSV(reader.result));
        makeQuests(CSV(reader.result));
    };
    //reader.readAsBinaryString(myFile.files[0]);
    reader.readAsText(myFile.files[0], 'ISO-8859-1');
}

function CSV( $data ){
    var i, result;
    result = $data.split('\n');
    //i = result.length;
    for(var i = 0; i < result.length; i++){
        result[i] = result[i].split( ',' );
    }
    //while( i-- ) result[i] = result[i].split( ',' );
    result.length = result.length - 1;
    return result;
}

function makeQuests(ary){
    //Non-Array Initialize
    quests.dateWeek1 = ary[1][1];
    quests.dateWeek2 = ary[1][4];
    quests.dateWeek3 = ary[1][7];
    quests.list = new Array();

    var numOfQuest = 0;
    var subNumOfQuest = 0;

    //Week1 Array Make
    for(var i = 3; i < ary.length; i++){
        if(ary[i][0] == ""){
            numOfQuest++;
            subNumOfQuest = 0;
            continue;
        }else{
            subNumOfQuest++;
        }
        var quest = new Object();
        quest.text    = ary[i][0];
        quest.pt      = ary[i][1];
        quest.add     = ary[i][2];
        quest.week    = 1;
        quest.qnum    = numOfQuest;
        quest.snum    = subNumOfQuest;
        quest.enabled = true;
        quests.list.push(quest);
    }

    //Week2 Array Make
    numOfQuest = 0;
    subNumOfQuest = 0;
    for(var i = 3; i < ary.length; i++){
        if(ary[i][3] == ""){
            numOfQuest++;
            subNumOfQuest = 0;
            continue;
        }else{
            subNumOfQuest++;
        }
        var quest = new Object();
        quest.text    = ary[i][3];
        quest.pt      = ary[i][4];
        quest.add     = ary[i][5];
        quest.week    = 2;
        quest.qnum    = numOfQuest;
        quest.snum    = subNumOfQuest;
        quest.enabled = true;
        quests.list.push(quest);
    }

    //Week3 Array Make
    numOfQuest = 0;
    subNumOfQuest = 0;
    for(var i = 3; i < ary.length; i++){
        if(ary[i][6] == ""){
            numOfQuest++;
            subNumOfQuest = 0;
            continue;
        }else{
            subNumOfQuest++;
        }
        var quest = new Object();
        quest.text    = ary[i][6];
        quest.pt      = ary[i][7];
        quest.add     = ary[i][8];
        quest.week    = 3;
        quest.qnum    = numOfQuest;
        quest.snum    = subNumOfQuest;
        quest.enabled = true;
        quests.list.push(quest);
    }

    console.log(quests);
    return;
}
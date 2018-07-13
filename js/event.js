var quests;
var thisEvent;
var saves;

$(document).ready(function() {
    init();
    load();
    refreshTable();
});

$(function (){

})
.on('click', '.table-clickable', function(e) {
    e.preventDefault();
    clickRow(parseInt($(this).attr('idx')));//고유값
});

function init(){
    thisEvent = "스칼렛 위치 이벤트,,,,,,,,,,*주의사항 #1: 연동되지 않는 미션들은 한칸씩 공백을 두고 입력할 것\n" +
        "1주차,18-07-14 ~ 18-08-03,,2주차,18-07-21 ~ 18-08-03,,3주차,18-07-28 ~ 18-08-03,,,\"*주의사항 #2: 보상 입력시 쉼표(,) 사용불가, 특문쉼표로 대용(，)\"\n" +
        "미션,포인트,추가보상,미션,포인트,추가보상,미션,포인트,추가보상,누적포인트,보상\n" +
        "로그인 1일,10,,전지 200개 획득,20,,구매토큰 소모 100개,20,,100,탄약，식량 1000\n" +
        "로그인 2일,20,,전지 500개 획득,50,,구매토큰 소모 200개,30,,200,증폭캡슐 20개，쾌속수복 5장\n" +
        "로그인 3일,20,,전지 1000개 획득,100,,구매토큰 소모 500개,150,,500,중급칩 200개，쾌속제조 5장\n" +
        "로그인 5일,30,,,,,구매토큰 소모 1000개,200,기억파편 200개,800,인형제조 5장，기억파편 100개，전지 200개\n" +
        "로그인 8일,30,,전역 승리 10회,20,,,,,1200,코어 10개，구매토큰 20개，쾌속훈련 1장\n" +
        "로그인 10일,50,,전역 승리 20회,30,,수복 10회,10,,1800,PM-06，아이스크림 10개\n" +
        "로그인 12일,100,,전역 승리 50회,50,,수복 20회,20,,2000,기억파편 100개，고급칩 200개，작전점수 10개\n" +
        ",,,전역 승리 100회,100,,수복 30회,30,,2400,기억파편 200개，구매토큰 50개，인형제조 10장，챌린지 훈장 1개\n" +
        "칭찬받기 10회,20,,,,,,,,3000,챌린지 훈장 1개\n" +
        "칭찬받기 30회,30,,인형/요정 스킬 훈련 1회,10,,작전점수 10개 소모,10,,,\n" +
        "칭찬받기 50회,50,,인형/요정 스킬 훈련 3회,20,,작전점수 30개 소모,30,,,\n" +
        "칭찬받기 100회,100,,인형/요정 스킬 훈련 5회,50,,작전점수 50개 소모,50,,,\n" +
        ",,,인형/요정 스킬 훈련 10회,100,,,,,,\n" +
        "인형 제조권 10장 소모,20,,,,,교정권 50장 소모,20,,,\n" +
        "인형 제조권 20장 소모,30,,지원제대 사용 5회,10,,교정권 100장 소모,30,,,\n" +
        "인형 제조권 50장 소모,50,,지원제대 사용 10회,20,,교정권 300장 소모,50,,,\n" +
        "인형 제조권 100장 소모,100,,지원제대 사용 20회,30,,,,,,\n" +
        ",,,지원제대 사용 50회,50,,칭찬하기 10회,20,,,\n" +
        "초급칩 1000개 사용,30,,,,,칭찬하기 30회,30,,,\n" +
        ",,,군수 누적 200시간,20,,칭찬하기 50회,50,,,\n" +
        "중급칩 500개 사용,50,,군수 누적 500시간,50,,,,,,\n" +
        ",,,군수 누적 800시간,100,,탄약 1만개 소모,20,,,\n" +
        "고급칩 300개 사용,100,,,,,탄약 2만개 소모,30,,,\n" +
        ",,,인형구조 20회,20,,탄약 3만개 소모,50,,,\n" +
        "작전보고서 30장 소모,30,,인형구조 50회,50,,,,,,\n" +
        "작전보고서 50장 소모,30,,인형구조 100회,100,,,,,,\n" +
        "작전보고서 100장 소모,50,,,,,,,,,\n" +
        ",,,,,,,,,,\n" +
        "4성 제조 1회,20,,,,,,,,,\n" +
        "4성 제조 5회,30,,,,,,,,,\n" +
        ",,,,,,,,,,\n" +
        "5성 제조 1회,50,,,,,,,,,\n" +
        "5성 제조 5회,100,,,,,,,,,\n";

    makeQuests(CSV(thisEvent));
    return;
}

function load(){
    if(JSON.parse(localStorage.saves).title != quests.title){
        localStorage.removeItem(saves);
    }else{
        quests = JSON.parse(localStorage.saves);
    }
}

function clickRow(index){
    var me = quests.list[index];
    if(me.enabled){
        for(var i in quests.list){
            if((quests.list[i].week == me.week) && (quests.list[i].qnum == me.qnum) && (quests.list[i].snum >= me.snum)){
                quests.list[i].enabled = false;
            }
        }
    }else{
        for(var i in quests.list){
            if((quests.list[i].week == me.week) &&(quests.list[i].qnum == me.qnum) && (quests.list[i].snum <= me.snum)){
                quests.list[i].enabled = true;
            }
        }
    }
    refreshTable();
}

function readCSV(myFile){
    var reader = new FileReader();
    reader.onload = function () {
        //csv2series(myFile.files[0].name.slice(0,-4), CSV(reader.result));
        makeQuests(CSV(reader.result));
        refreshTable();
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
    quests = new Object();

    //Non-Array Initialize
    quests.title = ary[0][0];
    quests.dateWeek1 = ary[1][1];
    quests.dateWeek2 = ary[1][4];
    quests.dateWeek3 = ary[1][7];
    quests.list = new Array();
    quests.reward = new Array();

    var numOfQuest = 0;
    var subNumOfQuest = 0;

    //Week1 Array Make
    for(var i = 3; i < ary.length; i++){
        if(ary[i][0] == ""){
            numOfQuest++;
            subNumOfQuest = 0;
            continue;
        }
        var quest = new Object();
        quest.text    = ary[i][0];
        quest.pt      = parseInt(ary[i][1]);
        quest.add     = ary[i][2];
        quest.week    = 1;
        quest.qnum    = numOfQuest;
        quest.snum    = subNumOfQuest++;
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
        }
        var quest = new Object();
        quest.text    = ary[i][3];
        quest.pt      = parseInt(ary[i][4]);
        quest.add     = ary[i][5];
        quest.week    = 2;
        quest.qnum    = numOfQuest;
        quest.snum    = subNumOfQuest++;
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
        }
        var quest = new Object();
        quest.text    = ary[i][6];
        quest.pt      = parseInt(ary[i][7]);
        quest.add     = ary[i][8];
        quest.week    = 3;
        quest.qnum    = numOfQuest;
        quest.snum    = subNumOfQuest++;
        quest.enabled = true;
        quests.list.push(quest);
    }

    for(var i = 3; i < ary.length; i++){
        if(ary[i][9] == ""){
            continue;
        }
        var rwd = new Object();
        rwd.pt = parseInt(ary[i][9]);
        rwd.text = ary[i][10];
        quests.reward.push(rwd);
    }
    return;
}

function refreshTable(){
    var weekSum1 = 0, weekSum2 = 0, weekSum3 = 0;

    $('#table_week1').empty();
    $('#table_week2').empty();
    $('#table_week3').empty();
    $('#table_title').empty();
    $('#table_reward').empty();
    $('#table_title').text(quests.title + ' (' + quests.dateWeek1 +')');
    $('#head_week1').text('1주차 (' + quests.dateWeek1 +')');
    $('#head_week2').text('2주차 (' + quests.dateWeek2 +')');
    $('#head_week3').text('3주차 (' + quests.dateWeek3 +')');

    for(var i in quests.list){
        var item;
        if(quests.list[i].enabled){
            item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable success">';
        }else{
            item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable">';
        }

        var td80 = '<td style="text-align: left; vertical-align:middle;" width="80%">';
        var td20 = '<td style="text-align: center; vertical-align:middle;" width="20%">';
        var td0 = '<td style="text-align: center; vertical-align:middle; display:none;">';
        var tde = '</td>';

        item += td80 + quests.list[i].text + tde;
        if(quests.list[i].add == ""){
            item += td20 + quests.list[i].pt + tde;
        }else{
            item += '<td style="text-align: center; vertical-align:middle;" width="20%" title="' + quests.list[i].add + '">' + quests.list[i].pt + ' +' + tde;
        }

        switch(quests.list[i].week){
            case 1:
                $('#table_week1').append(item);
                break;
            case 2:
                $('#table_week2').append(item);
                break;
            case 3:
                $('#table_week3').append(item);
                break;
            default:
                break;
        }

        if(quests.list[i].enabled){
            switch(quests.list[i].week){
                case 1:
                    weekSum1 += quests.list[i].pt;
                    break;
                case 2:
                    weekSum2 += quests.list[i].pt;
                    break;
                case 3:
                    weekSum3 += quests.list[i].pt;
                    break;
                default:
                    break;
            }
        }
    }

    for(var i in quests.reward){
        var sum = weekSum1 + weekSum2 + weekSum3;
        var item = '<tr>';
        var td80 = '<td style="text-align: left; vertical-align:middle;" width="80%">';
        var td20 = '<td style="text-align: center; vertical-align:middle;" width="20%">';
        var td0 = '<td style="text-align: center; vertical-align:middle; display:none;">';
        var tde = '</td>';

        $('#sumTotal').text("포인트 합계: " + sum);

        if(quests.reward[i].pt <= sum){
            item = '<tr class="success">';
        }

        item += td20 + quests.reward[i].pt + tde;
        item += td20 + quests.reward[i].text + tde;

        $('#table_reward').append(item);
    }

    var sum = '<tr class="active"><td style="text-align: center;" width="80%"><b>합계</b></td><td style="text-align: center;" width="20%"><b>';
    $('#table_week1').append(sum + weekSum1 + '</b></td></tr>');
    $('#table_week2').append(sum + weekSum2 + '</b></td></tr>');
    $('#table_week3').append(sum + weekSum3 + '</b></td></tr>');

    localStorage.saves = JSON.stringify(quests);
    //console.log(JSON.parse(localStorage.saves));

}
$('#csvDown').off().on('click', function (e) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI("\uFEFF" + thisEvent);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'sample.csv';
    hiddenElement.click();
});
$('#selAll').off().on('click', function (e) {
    for(var i in quests.list){
        quests.list[i].enabled = true;
    }
    refreshTable();
});
$('#selNo').off().on('click', function (e) {
    for(var i in quests.list){
        quests.list[i].enabled = false;
    }
    refreshTable();
});
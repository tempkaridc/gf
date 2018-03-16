var objectList = new Array();
var calcList = new Array();
var selectedList = new Array();
var sortToggle = [0,0,0,0,0,0,0,0,0,0,0]; //0:none 1:asc 2:desc
var areaToggle = [1,1,1,1,1,1,1,1,1,1,1]; //0~10지역
var timeToggle = [0,1,2,3,4,5,6,7,8,9,10,11,12,24]; //14쌍
var time_front = 0, time_end = 13;
var success = 0;
var sw_sucs = false;
var chart;
var chart_time = new Array();
var now;

$(function (){
    init();
    refresh();
}).on('click', '.table-clickable', function(e) {
        e.preventDefault();

        var index = $(this).attr('idx');    //고유값
        var rowName = '#table-row-' + index;

        //var $target = $('#area-list tr').eq(id);

        if($(rowName).hasClass('danger')){
            $(rowName).removeClass('danger');
            for(i in selectedList){
                if(selectedList[i] == index){
                    selectedList.splice(i, 1);
                    break;
                }
            }
        }else{
            $(rowName).addClass('danger');
            selectedList.push(index);

            if(selectedList.length > 4){ //Stack Full
                $('#table-row-' + selectedList[0]).removeClass('danger');
                selectedList.splice(0,1);
            }
        }
        calcStage();
    });
$('[id^=sort-]').off().on('click', function (e) {
    var id = $(this).attr('index');  //close, confirm
    if(sortToggle[id] <= 1){
        sortInit(id);
        $('#icon-'+id).addClass('glyphicon-sort-by-order-alt');
        sortTable(document.getElementById("area-list"), id, 0);
        sortToggle[id] = 2;
    }else{
        sortInit(id);
        $('#icon-'+id).addClass('glyphicon-sort-by-order');
        sortTable(document.getElementById("area-list"), id, 1);
        sortToggle[id] = 1;
    }
});
$('[id^=btn-area-]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));
    if($('#btn-area-' + id).hasClass('btn-success')){
        $('#btn-area-' + id).removeClass('btn-success');
        $('#btn-area-' + id).addClass('btn-default');
        areaToggle[id] = 0;
    }else{
        $('#btn-area-' + id).removeClass('btn-default');
        $('#btn-area-' + id).addClass('btn-success');
        areaToggle[id] = 1;
    }
    refresh();
});
$('[id^=btn-times-]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));
    if(id == 0){
        if(time_front > 0){
            time_front--;
        }
    }else if(id ==1){
        if(time_front < time_end - 1){
            time_front++;
        }
    }
    dispTime();
});
$('[id^=btn-timee-]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));
    if(id == 0){
        if(time_front + 1 < time_end){
            time_end--;
        }
    }else if(id ==1){
        if(time_end < 13){
            time_end++;
        }
    }
    dispTime();
});
$('#btn_toggle_sucs').off().on('click', function (e) {
    if($('#btn_toggle_sucs').hasClass('btn-default')){
        $('#btn_toggle_sucs').removeClass('btn-default');
        $('#btn_toggle_sucs').addClass('btn-success');
        $('#per_level').removeClass('btn-default');
        $('#per_level').addClass('btn-success');
        $('#btn_toggle_sucs').text('적용');
        sw_sucs = true;
    }else{
        $('#btn_toggle_sucs').removeClass('btn-success');
        $('#btn_toggle_sucs').addClass('btn-default');
        $('#per_level').removeClass('btn-success');
        $('#per_level').addClass('btn-default');
        $('#btn_toggle_sucs').text('미적용');
        sw_sucs = false;
    }
    refresh();
});
function dispTime(){
    $('#scr-times').text(timeToggle[time_front] + '시간');
    $('#scr-timee').text(timeToggle[time_end] + '시간');
    objectList.length = 0;
    selectedList.length = 0;
    refresh();
}
function sortInit(d){
    for(var i in sortToggle){
        if(i!=d) sortToggle[i] = 0;
        $('#icon-'+i).removeClass('glyphicon-sort-by-order');
        $('#icon-'+i).removeClass('glyphicon-sort-by-order-alt');
    }
}
function sortTable(table, column, sc){
    var rows, switching, i, x, y, shouldSwitch;
    if(column == 0){column = 12;}
    if(column == 5){column = 13;}
    switching = true;
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[column];      //TD첫번째 Column 기준으로 정렬
            y = rows[i + 1].getElementsByTagName("TD")[column];

            if(sc == 0){
                if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {    // <> 오름차순 내림차순
                    shouldSwitch = true;
                    break;
                }
            }else if(sc == 1){
                if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {    // <> 오름차순 내림차순
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
function calcStage(){
    var sumH = 0, sumA = 0, sumF = 0, sumP = 0;
    var sumT = "", sumItem = "";
    var sumHp = 0, sumAp = 0, sumFp = 0, sumPp = 0, sumTp = 0;
    var aryH = new Array();
    var aryA = new Array();
    var aryF = new Array();
    var aryP = new Array();
    //now = new Date().getTime();
    now = (new Date).getTime() + 32400000; // GMT+9

    for(i in selectedList){
        sumH += objectList[selectedList[i]].Human * (60 / objectList[selectedList[i]].Time);
        sumA += objectList[selectedList[i]].Ammo * (60 / objectList[selectedList[i]].Time);
        sumF += objectList[selectedList[i]].Food * (60 / objectList[selectedList[i]].Time);
        sumP += objectList[selectedList[i]].Part * (60 / objectList[selectedList[i]].Time);
        sumT += objectList[selectedList[i]].Area + '-' + objectList[selectedList[i]].Stage + ', ';

        if(objectList[selectedList[i]].Ticket_makeDoll) sumHp += objectList[selectedList[i]].Ticket_makeDoll * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_makeTool) sumAp += objectList[selectedList[i]].Ticket_makeTool * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_fastMake) sumFp += objectList[selectedList[i]].Ticket_fastMake * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_fastRepair) sumPp += objectList[selectedList[i]].Ticket_fastRepair * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_Tokken) sumTp += objectList[selectedList[i]].Ticket_Tokken * (60 / objectList[selectedList[i]].Time);

        for(var j = 0; j < parseInt((60 * 24 * 1) / objectList[selectedList[i]].Time) + 1; j++){
            timeCount = j * objectList[selectedList[i]].Time;

            var tmp = new Array();
            tmp[0] = timeCount * 60000;
            tmp[1] = objectList[selectedList[i]].Human;
            chkDuplArray(aryH,tmp);

            var tmp = new Array();
            tmp[0] = timeCount * 60000;
            tmp[1] = objectList[selectedList[i]].Ammo;
            chkDuplArray(aryA,tmp);

            var tmp = new Array();
            tmp[0] = timeCount * 60000;
            tmp[1] = objectList[selectedList[i]].Food;
            chkDuplArray(aryF,tmp);

            var tmp = new Array();
            tmp[0] = timeCount * 60000;
            tmp[1] = objectList[selectedList[i]].Part;
            chkDuplArray(aryP,tmp);
        }
    }

    $('#sumH').text(sumH.toFixed(0));
    $('#sumA').text(sumA.toFixed(0));
    $('#sumF').text(sumF.toFixed(0));
    $('#sumP').text(sumP.toFixed(0));
    $('#sumT').text(sumT.slice(0,-2));

    if(sumHp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/doll.png" title="인형제조계약서"><small>(' + (sumHp*100).toFixed(2) +'%) </small></div>';}
    if(sumAp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/tool.png" title="장비제조계약서"><small>(' + (sumAp*100).toFixed(2) +'%) </small></div>';}
    if(sumFp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/fast.png" title="쾌속제조계약서"><small>(' + (sumFp*100).toFixed(2) +'%) </small></div>';}
    if(sumPp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/repr.png" title="쾌속수복계약서"><small>(' + (sumPp*100).toFixed(2) +'%) </small></div>';}
    if(sumTp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/tokn.png" title="구매 토큰"><small>(' + (sumTp*100).toFixed(2) +'%) </small></div>';}

    $('#sumItem').empty();
    $('#sumItem').append(sumItem);

    chart_time = new Array();

    var obj_LineH = new Object();
    obj_LineH.name = "인력";
    aryH.sort(sortFunction);
    stackArray(aryH,1);
    obj_LineH.data = aryH;
    chart_time.push(obj_LineH);

    var obj_LineA = new Object();
    obj_LineA.name = "탄약";
    aryA.sort(sortFunction);
    stackArray(aryA,2);
    obj_LineA.data = aryA;
    chart_time.push(obj_LineA);

    var obj_LineF = new Object();
    obj_LineF.name = "식량";
    aryF.sort(sortFunction);
    stackArray(aryF,3);
    obj_LineF.data = aryF;
    chart_time.push(obj_LineF);

    var obj_LineP = new Object();
    obj_LineP.name = "부품";
    aryP.sort(sortFunction);
    obj_LineP.data = aryP;
    stackArray(aryP,4);
    chart_time.push(obj_LineP);

    chart = new Highcharts.chart({
        chart: {
            renderTo: 'tbl_cht',
            borderWidth: 1,
            backgroundColor:'rgba(255, 255, 255, 0.0)'
        },
        title: {
            text: null
        },
        rangeSelector: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            crosshair: true,
            title: {
                text: ''
            },
            dateTimeLabelFormats: {
                hour: '%H:%M'
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            min: 0
        },
        tooltip: {
            split: true
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: true,
                    radius: 2
                }
            }
        },
        legend: {
            enabled: true,
            align: 'center'
        },
        lang: {
            weekdays: [
                '월','화','수','목','금','토','일'
            ]
        },
        series: chart_time
    });
}
function stackArray(ary, type){
    if(ary[0]){
        switch(type){
            case 1:
                ary[0][1] = parseInt(document.getElementById('pre_huma').value);
                break;
            case 2:
                ary[0][1] = parseInt(document.getElementById('pre_ammo').value);
                break;
            case 3:
                ary[0][1] = parseInt(document.getElementById('pre_food').value);
                break;
            case 4:
                ary[0][1] = parseInt(document.getElementById('pre_part').value);
                break;
            default:
                break;
        }
        if(isNaN(ary[0][1])){
            ary[0][1] = 0;
        }
    }
    for(var i = 1; i < ary.length; i++){
        ary[i][1] += ary[i-1][1];
    }
    for(var i in ary){
        ary[i][0] = new Date(ary[i][0] + now).getTime();
    }
}
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}
function chkDuplArray(ary, obj){
    if(obj[1] == 0){
        return;
    }

    if(obj[0] == 0) {
        obj[1] = 0;
    }

    for(var i in ary){
        if(ary[i][0] == obj[0]){
            ary[i][1] += obj[1];
            return;
        }
    }
    ary.push(obj);
    return;
}
function loadTable(){
    $('#area-list').empty();
    for(var i in objectList){
        var td0 = '<td style="text-align: center; vertical-align:middle; display:none;">';
        var td12 = '<td style="text-align: center; vertical-align:middle;" width="12%">';
        var td28 = '<td style="text-align: center; vertical-align:middle;" width="28%">';
        var tde = '</td>';
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable">';
        /*00*/item += td12 + objectList[i].Area + '-' + objectList[i].Stage + tde;
        /*01*/item += td12 + parseInt(objectList[i].Human/objectList[i].Time*60) + tde;
        /*02*/item += td12 + parseInt(objectList[i].Ammo/objectList[i].Time*60) + tde;
        /*03*/item += td12 + parseInt(objectList[i].Food/objectList[i].Time*60) + tde;
        /*04*/item += td12 + parseInt(objectList[i].Part/objectList[i].Time*60) + tde;
        /*05*/item += td12 + parseInt(objectList[i].Time / 60) + ':' + (objectList[i].Time % 60 == 0 ? '00' : objectList[i].Time % 60) + tde;
        /*06*/item += td0 + objectList[i].Ticket_makeDoll/objectList[i].Time*60 + tde;
        /*07*/item += td0 + objectList[i].Ticket_makeTool/objectList[i].Time*60 + tde;
        /*08*/item += td0 + objectList[i].Ticket_fastMake/objectList[i].Time*60 + tde;
        /*09*/item += td0 + objectList[i].Ticket_fastRepair/objectList[i].Time*60 + tde;
        /*10*/item += td0 + objectList[i].Ticket_Tokken/objectList[i].Time*60 + tde;
        /*11*/item += td28;
        if(objectList[i].Ticket_makeDoll) item += '<img src="img/doll.png" title="인형제조계약서">'
        if(objectList[i].Ticket_makeTool) item += '<img src="img/tool.png" title="장비제조계약서">'
        if(objectList[i].Ticket_fastMake) item += '<img src="img/fast.png" title="쾌속제조계약서">'
        if(objectList[i].Ticket_fastRepair) item += '<img src="img/repr.png" title="쾌속수복계약서">'
        if(objectList[i].Ticket_Tokken) item += '<img src="img/tokn.png" title="구매 토큰">'
        item += tde;
        /*12*/item += td0 + objectList[i].Area * 10 + objectList[i].Stage + tde;
        /*13*/item += td0 + objectList[i].Time + tde;
        $('#area-list').append(item);
    }
    for(var i in sortToggle){
        switch(sortToggle[i]){
            case 0:
                $('#icon-' + i).empty();
                break;
            case 1:
                $('#icon-' + i).empty();
                $('#icon-' + i).addClass('glyphicon glyphicon-sort-by-order');
                break;
            case 2:
                $('#icon-' + i).empty();
                $('#icon-' + i).addClass('glyphicon glyphicon-sort-by-order-alt');
                break;
            default:
                break;
        }
    }
}
function callData(){
    // 11col
    // Area, Stage, Time(Min), Huma, Ammo, MRE, Part, Make_Doll, Make_Tool, Fast_Make, Fast_Repair, Tokken
    var arr = [
        [0,1,50,0,145,145,0,0,0,0.2,0.5,0],
        [0,2,180,550,0,0,350,0.5,0,0,0,0],
        [0,3,720,900,900,900,250,0,0.4,0,0.4,0],
        [0,4,1440,0,1200,800,750,0,0,0,0,1],
        [1,1,15,10,30,15,0,0,0,0,0,0],
        [1,2,30,0,40,60,0,0,0,0,0,0],
        [1,3,60,30,0,30,10,0,0,0,0.6,0],
        [1,4,120,160,160,0,0,0.2,0,0,0,0],
        [2,1,40,100,0,0,30,0,0,0,0,0],
        [2,2,90,60,200,80,0,0,0,0,0.3,0],
        [2,3,240,10,10,10,230,0,0,0.5,0.5,0],
        [2,4,360,0,250,600,60,0.8,0,0,0,0],
        [3,1,20,50,0,75,0,0,0,0,0,0],
        [3,2,45,0,120,70,30,0,0,0,0,0],
        [3,3,90,0,300,0,0,0,0,0.4,0.45,0],
        [3,4,300,0,0,300,300,0.35,0.4,0,0,0],
        [4,1,60,0,185,185,0,0,0.2,0,0,0],
        [4,2,120,0,0,0,210,0,0,0.5,0,0],
        [4,3,360,800,550,0,0,0.7,0,0,0.3,0],
        [4,4,480,400,400,400,150,0,0,1,0,0],
        [5,1,30,0,0,100,45,0,0,0,0,0],
        [5,2,150,0,600,300,0,0,0,0,0.8,0],
        [5,3,240,800,400,400,0,0,0.5,0,0,0],
        [5,4,420,100,0,0,700,0.4,0,0,0,0],
        [6,1,120,300,300,0,100,0,0,0,0,0],
        [6,2,180,0,200,550,100,0,0,0.2,0.5,0],
        [6,3,300,0,0,200,500,0,0.6,0,0,0],
        [6,4,720,800,800,800,0,0,0,0,0,0.8],
        [7,1,150,650,0,650,0,0,0,0,0,0],
        [7,2,240,0,650,0,300,0.7,0,0,0.3,0],
        [7,3,330,900,600,600,0,0,0.7,0,0,0],
        [7,4,480,250,250,250,600,0,0,0.8,0,0],
        [8,1,60,150,150,150,0,0,0.4,0,0,0],
        [8,2,180,0,0,0,450,0,0,0,0.8,0],
        [8,3,360,400,800,800,0,0,0,0.6,0.3,0],
        [8,4,540,1500,400,400,100,0.9,0,0,0,0],
        [9,1,30,0,0,100,50,0,0,0,0,0],
        [9,2,90,180,0,180,100,0,0,0.25,0,0],
        [9,3,270,750,750,0,0,0.7,0,0,0,0],
        [9,4,420,500,900,900,0,0,1,0,0,0],
        [10,1,40,140,200,0,0,0,0,0,0,0],
        [10,2,100,0,240,180,0,0.75,0,0.25,0,0],
        [10,3,320,0,480,480,300,0,0,0.3,0.5,0],
        [10,4,600,660,660,660,330,0,1,0,0,0]
    ]

    for(var i in arr){
        var tmp = new Object();
        tmp.Area = arr[i][0];
        tmp.Stage = arr[i][1];
        tmp.Time = arr[i][2];
        tmp.Human = sw_sucs ? arr[i][3] * (0.5 * success + 1): arr[i][3];
        tmp.Ammo = sw_sucs ? arr[i][4] * (0.5 * success + 1): arr[i][4];
        tmp.Food = sw_sucs ? arr[i][5] * (0.5 * success + 1): arr[i][5];
        tmp.Part = sw_sucs ? arr[i][6] * (0.5 * success + 1): arr[i][6];
        tmp.Ticket_makeDoll = sw_sucs ? success + (1 - success) * arr[i][7]: arr[i][7];     if(!arr[i][7]){tmp.Ticket_makeDoll = 0;}
        tmp.Ticket_makeTool = sw_sucs ? success + (1 - success) * arr[i][8]: arr[i][8];     if(!arr[i][8]){tmp.Ticket_makeTool = 0;}
        tmp.Ticket_fastMake = sw_sucs ? success + (1 - success) * arr[i][9]: arr[i][9];     if(!arr[i][9]){tmp.Ticket_fastMake = 0;}
        tmp.Ticket_fastRepair = sw_sucs ? success + (1 - success) * arr[i][10]: arr[i][10]; if(!arr[i][10]){tmp.Ticket_fastRepair = 0;}
        tmp.Ticket_Tokken = sw_sucs ? success + (1 - success) * arr[i][11]: arr[i][11];     if(!arr[i][11]){tmp.Ticket_Tokken = 0;}

         if( (areaToggle[tmp.Area]) &&
            (timeToggle[time_front] * 60 <= tmp.Time) &&
            (tmp.Time <= timeToggle[time_end] * 60)){
            objectList.push(tmp);
        }
    }
}
function refresh(){
    objectList.length = 0;
    selectedList.length = 0;
    callData();
    loadTable();
    calcStage();
}
function init(){
    var myHeight = 0;
    if( typeof( window.innerWidth ) == 'number' ) {
        myHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        myHeight = document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        myHeight = document.body.clientHeight;
    }
    document.getElementById('tbl_mid').style.height = myHeight * 0.80 + 'px';
    document.getElementById('tbl_help').style.height = myHeight * 0.5 + 'px';
    document.getElementById('tbl_cht').style.height = myHeight * 0.3 + 'px';

    document.getElementById("pre_huma").addEventListener("change",function(){
        calcStage();
    });
    document.getElementById("pre_ammo").addEventListener("change",function(){
        calcStage();
    });
    document.getElementById("pre_food").addEventListener("change",function(){
        calcStage();
    });
    document.getElementById("pre_part").addEventListener("change",function(){
        calcStage();
    });
    document.getElementById("sum_level").addEventListener("change",function(){
        var tmp = parseInt(document.getElementById('sum_level').value);
        if(!isNaN(tmp)){
            if (tmp < 0) tmp = 0;
            if (tmp > 600) tmp = 600;
            tmp = parseInt(tmp / 5);
            tmp = tmp * 0.45;
            tmp = tmp + 15;
            $('#per_level').text('대성공 확률: ' + tmp.toFixed(1) + '%');
            success = tmp / 100;
        }
    });
}
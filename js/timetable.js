var falseNumber     = 100; //1시간 40분이니 걸릴 일 없음

var val = new Object();
val.start           = falseNumber;
val.sw_interval     = false;        // 확인 주기 적용여부
val.interval        = 0;
val.area            = [falseNumber,falseNumber,falseNumber,falseNumber];
val.sleepStart      = falseNumber;
val.sleepArea       = [falseNumber,falseNumber,falseNumber,falseNumber];
val.sw_sleep        = false;

var urlParams = new URLSearchParams(window.location.search);
var myParam = urlParams.get('c');

var result = new Object();

var arr;
var timeArr;
var chart;

$(function (){
    callData();
    chkURLhash();
});

function chkURLhash(){
    if(myParam != null){
        try{
            var param = decodeHEX(myParam);
            val.start           = param[0] * 10;
            val.area            = [param[1],param[2],param[3],param[4]];
            val.sw_interval     = param[5] > 0 ? true : false;
            val.interval        = param[6] * 10;
            val.sw_sleep        = param[7] > 0 ? true : false;
            if(val.sw_sleep){
                val.sleepStart      = param[8] * 10;
                val.sleepArea       = [param[9],param[10],param[11],param[12]];
            }

            $('#selectStart').val(val.start).change();
            $('#selectInterval').val(val.interval).change();
            $('#selectSleepStart').val(val.sleepStart).change();
            for(var i = 0; i < 4; i++){
                $('#selectArea-' + i).val(val.area[i]).change();
                $('#selectSleepArea-' + i).val(val.sleepArea[i]).change();
            }
            preMakeTable();
        }catch(e){
            return;
        }
    }
}

function callData(){
    arr = [ // Area, Stage, Time(Min), Huma, Ammo, MRE, Part, Make_Doll, Make_Tool, Fast_Make, Fast_Repair, Tokken
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
        [10,4,600,660,660,660,330,0,0.9,0,0,0],
        [11,1,240,350,1050,0,0,0.1,0.1,0,0,0],
        [11,2,240,360,540,540,0,1,0,0,0,0],
        [11,3,480,0,750,1500,250,0,0,0,0.1,0],
        [11,4,600,0,1650,0,900,0,0,1,0,0]
    ];

    timeArr = [ '0:00','0:30','1:00','1:30','2:00','2:30','3:00','3:30','4:00','4:30','5:00','5:30','6:00','6:30','7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30',
                    '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'];

    for(var i in timeArr){
        $('#selectStart').append('<option value="' + (i * 30) + '">'+ timeArr[i] +'</option>');
        $('#selectSleepStart').append('<option value="' + (i * 30) + '">'+ timeArr[i] +'</option>');
        $('#selectSleepEnd').append('<option value="' + (i * 30) + '">'+ timeArr[i] +'</option>');
    }

    for(var i in arr){
        $('#selectArea-0').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectArea-1').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectArea-2').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectArea-3').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectSleepArea-0').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectSleepArea-1').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectSleepArea-2').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
        $('#selectSleepArea-3').append('<option value="' + i + '">'+ arr[i][0] + '-' + arr[i][1] +'</option>');
    }
}

function selectStart(elem){
    val.start = parseInt(elem.value);
}
function selectInterval(elem){
    if(parseInt(elem.value) != 0){val.sw_interval = true;}
    else{val.sw_interval = false;}
    val.interval = parseInt(elem.value);
}
function selectSleepStart(elem){
    val.sleepStart = parseInt(elem.value);
}
function selectArea(elem){
    var idx = elem.id.split('-');
    val.area[parseInt(idx[1])] = parseInt(elem.value);
}
function selectSleepArea(elem){
    var idx = elem.id.split('-');
    val.sleepArea[parseInt(idx[1])] = parseInt(elem.value);
}

function copyURL(){
    preMakeTable();

    var hash = new Array();
    /*00*/hash.push(val.start / 10);            //0-141
    /*01*/hash.push(val.area[0]);               //0-43
    /*02*/hash.push(val.area[1]);
    /*03*/hash.push(val.area[2]);
    /*04*/hash.push(val.area[3]);
    /*05*/hash.push(val.sw_interval ? 1 : 0);
    /*06*/hash.push(val.interval / 10);         //0-141
    /*07*/hash.push(val.sw_sleep ? 1: 0);
    if(val.sw_sleep){
    /*08*/hash.push(val.sleepStart / 10);       //0-141
    /*09*/hash.push(val.sleepArea[0]);
    /*10*/hash.push(val.sleepArea[1]);
    /*11*/hash.push(val.sleepArea[2]);
    /*12*/hash.push(val.sleepArea[3]);
    }

    //var encodedString = Base64.encode(JSON.stringify(hash));
    var encodedString = encodeHEX(hash);
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = 'https://tempkaridc.github.io/gf/timetable.html?c=' + encodedString;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert('주소가 클립보드에 복사되었습니다\n' + t.value);
}

function preMakeTable(){
    if(val.sw_interval == true){
        for(var i in arr){
            if((arr[i][2] % val.interval) == 0){
                arr[i][2] = val.interval * (parseInt(arr[i][2] / val.interval));
            }else{
                arr[i][2] = val.interval * (parseInt(arr[i][2] / val.interval) + 1);
            }
        }
    }

    if(val.start == falseNumber){
        alert('기상시간을 입력해주세요');
        return;
    }

    if(val.sleepStart == falseNumber){
        val.sw_sleep = false;
    }else if(val.sleepStart == val.start){
        alert('취침시간과 기상시간은 달라야 합니다');
        return;
    }else{
        val.sw_sleep = true;
    }

    if(val.sw_sleep == true){
        val.sleepPeriod = val.start - val.sleepStart;
        if(val.sleepPeriod < 0){val.sleepPeriod += 1440;}

        for(var i in val.sleepArea){
            if(val.sleepArea[i] != falseNumber){
                if(arr[val.sleepArea[i]][2] > val.sleepPeriod){
                    alert((parseInt(i)+1) + '군수의 소요시간이 수면시간보다 깁니다.');
                    return;
                }
            }
        }
    }
    makeTable();
}

function clearTable(){
    $('#colTime').html('<div class="btn btn-xs btn-default col-md-12 col-xs-12" style="width:100%;">시간</div>');
    $('#colEnc0').html('<div class="btn btn-xs btn-default col-md-12 col-xs-12" style="width:100%;">1군수</div>');
    $('#colEnc1').html('<div class="btn btn-xs btn-default col-md-12 col-xs-12" style="width:100%;">2군수</div>');
    $('#colEnc2').html('<div class="btn btn-xs btn-default col-md-12 col-xs-12" style="width:100%;">3군수</div>');
    $('#colEnc3').html('<div class="btn btn-xs btn-default col-md-12 col-xs-12" style="width:100%;">4군수</div>');
}

function clearResult(){
    result.h = 0;
    result.a = 0;
    result.f = 0;
    result.p = 0;
    result.d = 0;
    result.t = 0;
    result.m = 0;
    result.r = 0;
    result.k = 0;
}

function makeTable(){
    var height = 3;                 //5분당 몇픽셀을 적용할지 비율
    var timeCycle = [0,0,0,0];
    var rowspans = [0,0,0,0];
    var sleepCycle = [0,0,0,0];
    var sleeprowspans = [0,0,0,0];

    for(var i = 0; i < 4; i++){
        if(val.area[i] != falseNumber){
            timeCycle[i] = arr[val.area[i]][2];
        }
    }

    for(var i in rowspans){
        rowspans[i] = timeCycle[i] / 5 * height;
    }

    if(val.sw_sleep == true){
        for(var i = 0; i < 4; i++ ){
            if(val.sleepArea[i] != falseNumber){
                sleepCycle[i] = arr[val.sleepArea[i]][2];
            }
        }

        for(var i = 0; i < 4; i++ ){
            sleeprowspans[i] = sleepCycle[i] / 5 * height;
        }
    }

    clearTable();
    clearResult();

    /*
    var num = 1440 / 30;
    for(var i = 0; i < num; i++){
        var now = (i * 30) + val.start;
        if(now >= 1440){now -= 1440;}

        var colTime = '<div class="btn btn-xs btn-default col-md-12 col-xs-12 text-center" style="padding-top:0px; padding-bottom:0px; width:100%; height:' + (height * 6) + 'px;">' + minToString(now) + ' - ' + minToString((now+30) >= 1440 ? now+30-1440 : now+30) + '</div>';

        $('#colTime').append(colTime);

    }
    */
    var num = 1440 / 60;
    for(var i = 0; i < num; i++){
        var now = (i * 60) + val.start;
        if(now >= 1440){now -= 1440;}
        var colTime = '<div class="btn btn-default col-md-12 col-xs-12 text-center" style="width:100%; height:' + (height * 6 * 2) + 'px;">' + minToString(now) + ' - ' + minToString((now+60) >= 1440 ? now+60-1440 : now+60) + '</div>';
        $('#colTime').append(colTime);
    }

    for(var k = 0; k < 4; k++){
        if(timeCycle[k] > 0){
            var num = 1440 / rowspans[k];
            for(var i = 0; i < num; i++){
                var now = (i * timeCycle[k]);
                if(now + timeCycle[k] > 1440){break;}

                if((val.sw_sleep == true) && (now + timeCycle[k] > 1440 - val.sleepPeriod)){
                    if(val.sleepArea[k] != falseNumber){
                        var emptybox =  '<div class="btn btn-xs btn-title col-md-12 col-xs-12 text-center" style="width:100%; height:'
                            + ((1440 - now - val.sleepPeriod) / 5 * height) +
                            'px;"></div>';

                        if(((1440 - now - val.sleepPeriod) / 5 * height) > 0){
                            $('#colEnc'+k).append(emptybox);
                        }

                        var inframe = makeFrame(arr[val.sleepArea[k]]);
                        var colEnc = '<div class="btn btn-xs btn-title col-md-12 col-xs-12 text-center" value="' + val.sleepArea[k]+ '" onclick="popupAlert(this);" style="overflow:hidden; width:100%; height:' + (val.sleepPeriod / 5 * height) + 'px;">' + inframe + '</div>';

                        addResult(arr[val.sleepArea[k]]);

                        $('#colEnc'+k).append(colEnc);
                    }
                    break;
                }

                var inframe = makeFrame(arr[val.area[k]]);
                var colEnc = '<div class="btn btn-xs btn-default col-md-12 col-xs-12 text-center" value="' + val.area[k]+ '" onclick="popupAlert(this);" style="overflow:hidden; width:100%; height:' + rowspans[k] + 'px;">' + inframe + '</div>';

                addResult(arr[val.area[k]]);
                $('#colEnc'+k).append(colEnc);

            }
        }
    }


    dispResult();
    drawChart();
}

function popupAlert(ont){
    var elem = arr[$(ont).attr('value')];
    var inframe = "";
    inframe += elem[0] + '-' + elem[1];
    inframe += '\n시간: ' + parseInt(elem[2] / 60) + ':' +  (parseInt(elem[2] % 60) == 0 ? '00' : '30');
    inframe += '\n인력: ' + elem[3];
    inframe += '\n탄약: ' + elem[4];
    inframe += '\n식량: ' + elem[5];
    inframe += '\n부품: ' + elem[6];
    if(elem[7] != 0){inframe += '\n인형제조계약서: ' + elem[7] + '개'}
    if(elem[8] != 0){inframe += '\n장비제조계약서: ' + elem[8] + '개'}
    if(elem[9] != 0){inframe += '\n쾌속제조계약서: ' + elem[9] + '개'}
    if(elem[10] != 0){inframe += '\n쾌속수복계약서: ' + elem[10] + '개'}
    if(elem[11] != 0){inframe += '\n구매토큰: ' + elem[11] + '개'}

    alert(inframe);
}

function makeFrame(elem){
    var inframe = "";
    inframe +=  '<table style="margin-left:auto; margin-right:auto; margin-bottom:0px;">' +
                    '<tbody>' +
                        '<tr><td colspan="3">'+(elem[0] + '-' + elem[1])+'</td></tr>' +
                        '<tr><td colspan="3">'+(parseInt(elem[2] / 60) + ':' +  (parseInt(elem[2] % 60) == 0 ? '00' : '30'))+'</td></tr>' +
                        '<tr><td>'+elem[3]+'</td><td>/</td><td>'+elem[4]+'</td></tr>' +
                        '<tr><td>'+elem[5]+'</td><td>/</td><td>'+elem[6]+'</td></tr>' +
                        '<tr><td colspan="3">';
    if(elem[7] != 0){inframe += '<img src="img/doll.png" style="height:1.5em;" title="'+elem[7]+'개">'}
    if(elem[8] != 0){inframe += '<img src="img/tool.png" style="height:1.5em;" title="'+elem[8]+'개">'}
    if(elem[9] != 0){inframe += '<img src="img/fast.png" style="height:1.5em;" title="'+elem[9]+'개">'}
    if(elem[10] != 0){inframe += '<img src="img/repr.png" style="height:1.5em;" title="'+elem[10]+'개">'}
    if(elem[11] != 0){inframe += '<img src="img/tokn.png" style="height:1.5em;" title="'+elem[11]+'개">'}
    inframe += '</td></tr></tbody></table>';
    return inframe;
}

function drawChart(){
    var chart_time = new Array();
    var name = ["인력","탄약","식량","부품"];

    var date = new Date();
    var now = date.getTime() - (date.getTimezoneOffset() * 60 * 1000); // GMT+9

    var aryLine = new Array();
    for(var i = 0; i < 4; i++){
        var obj = new Array();
        aryLine.push(obj);
    }
    for(var i = 0; i < 30; i++){
        var obj = new Object();
        obj.x = now + (i * 1000 * 60 * 60 * 24);    //하루씩
        obj.y = i * result.h;
        aryLine[0].push(obj);
    }
    for(var i = 0; i < 30; i++){
        var obj = new Object();
        obj.x = now + (i * 1000 * 60 * 60 * 24);    //하루씩
        obj.y = i * result.a;
        aryLine[1].push(obj);
    }
    for(var i = 0; i < 30; i++){
        var obj = new Object();
        obj.x = now + (i * 1000 * 60 * 60 * 24);    //하루씩
        obj.y = i * result.f;
        aryLine[2].push(obj);
    }
    for(var i = 0; i < 30; i++){
        var obj = new Object();
        obj.x = now + (i * 1000 * 60 * 60 * 24);    //하루씩
        obj.y = i * result.p;
        aryLine[3].push(obj);
    }

    for(var i = 0; i < 4; i++){
        var line = new Object();
        line.name = name[i];
        line.data = aryLine[i];
        chart_time.push(line);
    }

    Highcharts.setOptions({
        lang: {
            months: [
                '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
            ],
            shortMonths: [
                '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
            ],
            weekdays: [
                '일요일','월요일','화요일','수요일','목요일','금요일','토요일'
            ],
            shortWeekdays: [
                '일','월','화','수','목','금','토'
            ]
        }
    });

    chart = new Highcharts.chart({
        chart: {
            renderTo: 'tbl_cht',
            borderWidth: 1,
            backgroundColor:'rgba(255, 255, 255, 0.0)'
        },
        boost: {
            useGPUTranslations: true
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'datetime',
            crosshair: {
                enabled: true,
                format:{
                    value: "%b %d, %Y"
                }
            },
            title: {
                text: null
            },
            dateTimeLabelFormats: {
                hour:"%a, %H" + "시",
                day:"%a, %H" + "일"
            }
        },
        yAxis: {
            title: {
                text: null
            },
            min: 0
        },
        tooltip: {
            xDateFormat: "%B %d" + "일",
            split: true,
            padding: 3
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },
        legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'top',
            y: 0,
            floating: true
        },
        series: chart_time
    });
}

function dispResult(){
    $('#result_h').html(result.h);
    $('#result_a').html(result.a);
    $('#result_f').html(result.f);
    $('#result_p').html(result.p);
    $('#result_d').html(result.d.toFixed(1));
    $('#result_t').html(result.t.toFixed(1));
    $('#result_m').html(result.m.toFixed(1));
    $('#result_r').html(result.r.toFixed(1));
    $('#result_k').html(result.k.toFixed(1));
}

function addResult(elem){
    // arr = [ // Area, Stage, Time(Min), Huma, Ammo, MRE, Part, Make_Doll, Make_Tool, Fast_Make, Fast_Repair, Tokken]
    result.h += parseFloat(elem[3]);
    result.a += parseFloat(elem[4]);
    result.f += parseFloat(elem[5]);
    result.p += parseFloat(elem[6]);
    result.d += parseFloat(elem[7]);
    result.t += parseFloat(elem[8]);
    result.m += parseFloat(elem[9]);
    result.r += parseFloat(elem[10]);
    result.k += parseFloat(elem[11]);
}

function minToString(time){
    return parseInt(time / 60) + ':' + ((time % 60) == 0 ? '00' : '30');
}

function encodeHEX(ary){var str = "";for(var i in ary){if(ary[i] < 16){str += '0';}str += ary[i].toString(16);}return str;}

function decodeHEX(str) {
    var strary = new Array();
    for (var i = 0; i < str.length; i += 2) {
        strary.push(str.substring(i, i + 2));
    }
    var numary = new Array();
    for (var i in strary) {
        numary.push(parseInt(strary[i], 16));
    }
    return numary;
}

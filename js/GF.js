var version         = 201901161130;         // Version == 최종수정일 시간 분
var updateString    = "2019-01-16 Changelog"
                    + "\n- Restore Missing Text String (Help #9)"
                    + "\n- Ticket estimate for chart"
                    ;

var selLang         = 'ko';   //기본 언어는 한국어
var langPacks;
var langPack;

var objectList      = new Array();
var selectedList    = new Array();
var sync_calcList   = new Array();

var sortToggle      = [0,0,0,0,0,0,0,0,0,0,0,0];            // 0:none 1:asc 2:desc //지역, 인탄식부, 합계, 시간, 계약서5종 = 12
var areaToggle      = [1,1,1,1,1,1,1,1,1,1,1,1];            // [12] 0~11지역
var wghtToggle      = [0,0,0,0];                            // 계약서 가중치 버튼 스위치
var level           = [0,0.1,0.4,0.7];                      // 계약서 가중치 확률
var timeToggle      = [0,1,2,3,4,5,6,7,8,9,10,12,24];       // [13]
var menuToggle      = [1,1,1,1,1,1];                        // 메뉴 토글기능

var time_front      = 0;                                    // Head
var time_end        = timeToggle.length - 1;                // Tail 시간쌍

var sw_sucs         = false;        // 대성공 적용여부
var sw_recovery     = false;        // 자원회복 적용여부
var sw_zero         = true;         // 자원량 0 표기여부
var sw_time         = true;         // 표 자원 시간당 표기 적용여부
var sw_help         = true;         // 도움말 보기 적용여부
var sw_drawChart    = true;         // 차트 드로잉 갱신여부
var sw_drawReserved = false;        // 차트 드로잉 예약여부
var sw_interval     = false;        // 확인 주기 적용여부
var sw_successEvent = false;        // 군수확업 이벤트 트리거

var val_success     = 0.6;          // 대성공 초기성공률 60%
var val_interval    = 30;           // 확인 주기 초기값 30분
var val_sumRate     = new Object(); // 합계 자원비
    val_sumRate.h = 1;
    val_sumRate.a = 1;
    val_sumRate.f = 1;
    val_sumRate.p = 2.2;

var val_sumItem     = new Object(); // 합계 아이템

var urlParams = new URLSearchParams(window.location.search);
var myParam = urlParams.get('c');

var drawTimer;

var chart;
var chart_time = new Array();
var now;

var cptStr;
var config;
var saves;

$(function (){
    init();
    resizeBoxes();
    refresh();
    chkURLhash();
});

$('[id^=sort-]').off().on('click', function (e) {
    var id = $(this).attr('index');  //close, confirm
    sortingTable(id);
});

function click_table_main(elem){
    clickRow(parseInt($(elem).attr('idx')));
}

function click_table_load(elem){
    reload();
    refresh();

    var rows = document.getElementById("area-list").getElementsByTagName("TR");
    var areaList = saves[$(elem).attr('idx')].list;
    for(var i in saves[$(elem).attr('idx')].list){
        clickRow(saves[$(elem).attr('idx')].list[i]);//고유값
    }
    for(var i in areaList){
        rows[i].parentNode.insertBefore(rows[areaList[i]], rows[i]);
    }

    $('#loadModal').modal("hide");
}


function encodeHEX(ary){var str = "";for(var i in ary){if(ary[i] < 16){str += '0';}str += ary[i].toString(16);}return str;}
function decodeHEX(str){var strary = new Array();for(var i = 0; i < str.length; i+=2){strary.push(str.substring(i,i+2));}var numary = new Array();for(var i in strary){numary.push(parseInt(strary[i], 16));}return numary;}
function sortContract(elem){sortingTable(elem.value);}

function sortingTable(id){
    if(id == 99){id = 0; sortToggle[0] = 2;}    // 계약서 첫줄 지역소팅으로 대체

    if(0 < id){
        highlight(2);                           // 코드 순서때문에 어쩔수없이 정렬 펑션부분은 하드코딩
        if(id == 5){
            $('#high_03').addClass('success');
        }
        if((7 <= id) && (id <= 11)){
            $('#high_04').addClass('success');
        }
    }

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
}
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
        if(time_end < timeToggle.length - 1){
            time_end++;
        }
    }
    dispTime();
});

function btn_toggleMenu(btn){
    var id = '#' + $(btn).attr('id');
    var idx = parseInt($(btn).attr('idx'));

    if($(id + '_tr1').hasClass('hide')){    //열기
        $(id + '_tr1').removeClass('hide');
        $(id + '_tr2').removeClass('hide');
        $(id + '_tr3').removeClass('hide');
        menuToggle[idx] = 1;
    }else{                                  //닫기
        $(id + '_tr1').addClass('hide');
        $(id + '_tr2').addClass('hide');
        $(id + '_tr3').addClass('hide');
        menuToggle[idx] = 0;
    }

    disp_summary();
    config.menu = menuToggle;
    localStorage.config = JSON.stringify(config);
}

$('#btn_toggle_sucs').off().on('click', function (e) {
    if($('#btn_toggle_sucs').hasClass('btn-default')){
        $('#btn_toggle_sucs').removeClass('btn-default');
        $('#btn_toggle_sucs').addClass('btn-success');
        $('#per_level').removeClass('btn-default');
        $('#per_level').addClass('btn-success');
        sw_sucs = true;
        highlight(6);
    }else{
        $('#btn_toggle_sucs').removeClass('btn-success');
        $('#btn_toggle_sucs').addClass('btn-default');
        $('#per_level').removeClass('btn-success');
        $('#per_level').addClass('btn-default');
        sw_sucs = false;
        highlight(0);

        $('#btn_toggle_sucs_event').removeClass('btn-success');
        $('#btn_toggle_sucs_event').addClass('btn-default');
        sw_successEvent = false;
    }
    calcSuccessRatio();
    refresh();
});
$('#btn_toggle_sucs_event').off().on('click', function (e) {
    if(sw_sucs){
        if($('#btn_toggle_sucs_event').hasClass('btn-default')){
            $('#btn_toggle_sucs_event').removeClass('btn-default');
            $('#btn_toggle_sucs_event').addClass('btn-success');
            sw_successEvent = true;

        }else{
            $('#btn_toggle_sucs_event').removeClass('btn-success');
            $('#btn_toggle_sucs_event').addClass('btn-default');
            sw_successEvent = false;

        }
        calcSuccessRatio();
        refresh();
    }


    //refresh();
});
$('#btn_toggle_recovery').off().on('click', function (e) {
    if($('#btn_toggle_recovery').hasClass('btn-default')){
        $('#btn_toggle_recovery').removeClass('btn-default');
        $('#btn_toggle_recovery').addClass('btn-success');
        highlight(5);
        sw_recovery = true;
    }else{
        $('#btn_toggle_recovery').removeClass('btn-success');
        $('#btn_toggle_recovery').addClass('btn-default');
        highlight(0);
        sw_recovery = false;
    }
    refresh();
});
$('#btn_toggle_interval').off().on('click', function (e) {
    if($('#btn_toggle_interval').hasClass('btn-default')){
        $('#btn_toggle_interval').removeClass('btn-default');
        $('#btn_toggle_interval').addClass('btn-success');
        highlight(7);
        sw_interval = true;
    }else{
        $('#btn_toggle_interval').removeClass('btn-success');
        $('#btn_toggle_interval').addClass('btn-default');
        highlight(0);
        sw_interval = false;
    }
    refresh();
});
$('#btn_change_sumrate').off().on('click', function (e) {
    val_sumRate.h = parseFloat(document.getElementById('sumrate_huma').value);
    val_sumRate.a = parseFloat(document.getElementById('sumrate_ammo').value);
    val_sumRate.f = parseFloat(document.getElementById('sumrate_food').value);
    val_sumRate.p = parseFloat(document.getElementById('sumrate_part').value);

    if(isNaN(val_sumRate.h)){val_sumRate.h = 1;}
    if(isNaN(val_sumRate.a)){val_sumRate.a = 1;}
    if(isNaN(val_sumRate.f)){val_sumRate.f = 1;}
    if(isNaN(val_sumRate.p)){val_sumRate.p = 2.2;}

    config.sumrate = val_sumRate;
    localStorage.config = JSON.stringify(config);
    highlight(3);

    refresh();
});
$('#help_time').off().on('click', function (e) {
    $('#btn-toggleTime').trigger('click');
});
$('#help_wght').off().on('click', function (e) {
    $('#my_wght').trigger('click');
});
$('#my_wght').off().on('click', function (e) {
    $('#wghtModal').removeClass("hide");
    //$('#wghtModal_margin1').removeClass("hide");
    //$('#wghtModal_margin2').removeClass("hide");
});
$('#close_wght').off().on('click', function (e) {
    $('#wghtModal').addClass("hide");
    //$('#wghtModal_margin1').addClass("hide");
    //$('#wghtModal_margin2').addClass("hide");
});
$('#btn_calcUse').off().on('click', function (e) {
    var tmp = new Array();
    tmp[0] = parseInt(document.getElementById('use_huma').value);
    tmp[1] = parseInt(document.getElementById('use_ammo').value);
    tmp[2] = parseInt(document.getElementById('use_food').value);
    tmp[3] = parseInt(document.getElementById('use_part').value);

    for(var i in tmp){
        if(isNaN(tmp[i])) tmp[i] = 0;
    }
    var min = 9999999999;
    for(var i in tmp){
        if((tmp[i] < min) && (tmp[i] != 0)){
            min = tmp[i];
        }
    }

    for(var i in tmp){
        tmp[i] = tmp[i] / min;
    }

    if((tmp[0] + tmp[1] + tmp[2] + tmp[3]) > 0){
        $('#wgt_huma').val(tmp[0].toFixed(2));
        $('#wgt_ammo').val(tmp[1].toFixed(2));
        $('#wgt_food').val(tmp[2].toFixed(2));
        $('#wgt_part').val(tmp[3].toFixed(2));
    }

    $('#close_wght').trigger('click');
    $('#loadModal').modal("hide");
    $('#recommendLine').addClass('hide');
    $('#tbl_cht').empty();
});
$('#btn_calcUse2').off().on('click', function (e) {
    var tmp = new Array();
    tmp[0] = parseInt(document.getElementById('pre2_huma').value);
    tmp[1] = parseInt(document.getElementById('pre2_ammo').value);
    tmp[2] = parseInt(document.getElementById('pre2_food').value);
    tmp[3] = parseInt(document.getElementById('pre2_part').value);

    var tmpf = new Array();
    tmpf[0] = parseInt(document.getElementById('fin_huma').value);
    tmpf[1] = parseInt(document.getElementById('fin_ammo').value);
    tmpf[2] = parseInt(document.getElementById('fin_food').value);
    tmpf[3] = parseInt(document.getElementById('fin_part').value);

    for(var i in tmp){
        if(tmp[i] > tmpf[i]){
            alert(langPack.HTML.INCODE.ALERT1);
            return;
        }
    }

    for(var i in tmp){
        if(isNaN(tmp[i])) tmp[i] = 0;
        if(isNaN(tmpf[i])) tmpf[i] = tmp[i];
    }

    var tmpd = new Array();
    for(var i in tmp){
        tmpd[i] = tmpf[i] - tmp[i];
    }

    var min = 9999999999;
    for(var i in tmp){
        if((tmp[i] < min) && (tmp[i] != 0)){
            min = tmp[i];
        }
    }

    for(var i in tmpd){
        tmpd[i] = tmpd[i] / min;
    }

    if((tmpd[0] + tmpd[1] + tmpd[2] + tmpd[3]) > 0){
        $('#pre_huma').val(tmp[0]);
        $('#pre_ammo').val(tmp[1]);
        $('#pre_food').val(tmp[2]);
        $('#pre_part').val(tmp[3]);

        $('#wgt_huma').val(tmpd[0].toFixed(2));
        $('#wgt_ammo').val(tmpd[1].toFixed(2));
        $('#wgt_food').val(tmpd[2].toFixed(2));
        $('#wgt_part').val(tmpd[3].toFixed(2));
    }

    $('#close_wght').trigger('click');
    $('#loadModal').modal("hide");
    $('#recommendLine').addClass('hide');
    $('#tbl_cht').empty();
});
$('[id^=btn-tgl]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));
    if(wghtToggle[id] == level[0]){    //dflt -> sucs
        $('#btn-tglT' + id).removeClass('btn-default');
        $('#btn-tglT' + id).addClass('btn-success');
        $('#btn-tglT' + id + '_text').text(' ≥ ' + level[1]);
        $('#btn-tglT' + id).attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + ' ' + level[1] + ' ' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2); // 시간당 0 개 이상
        wghtToggle[id] = level[1];
    }else if(wghtToggle[id] == level[1]){    //sucs -> warn
        $('#btn-tglT' + id).removeClass('btn-success');
        $('#btn-tglT' + id).addClass('btn-warning');
        $('#btn-tglT' + id + '_text').text(' ≥ ' + level[2]);
        $('#btn-tglT' + id).attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + ' ' + level[2] + ' ' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
        wghtToggle[id] = level[2];
    }else if(wghtToggle[id] == level[2]) {    //warn -> dang
        $('#btn-tglT' + id).removeClass('btn-warning');
        $('#btn-tglT' + id).addClass('btn-danger');
        $('#btn-tglT' + id + '_text').text(' ≥ ' + level[3]);
        $('#btn-tglT' + id).attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + ' ' + level[3] + ' ' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
        wghtToggle[id] = level[3];
    }else if(wghtToggle[id] == level[3]){    //warn -> dang
        $('#btn-tglT' + id).removeClass('btn-danger');
        $('#btn-tglT' + id).addClass('btn-default');
        $('#btn-tglT' + id + '_text').text(' ≥ ' + level[0]);
        $('#btn-tglT' + id).attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + ' ' + level[4] + ' ' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
        wghtToggle[id] = level[0];
    }
});
$('[id^=btn-rec]').off().on('click', function (e) {
    //재정렬후 재위치
    sortTable(document.getElementById("area-list"), 0, 1);
    var id = parseInt($(this).attr('idx'));
    var rows = document.getElementById("area-list").getElementsByTagName("TR");

    clearRow();

    sw_drawChart = false;

    for(var i in sync_calcList[id].comb){
        clickRow(sync_calcList[id].comb[i]);
    }
    for(var i in sync_calcList[id].comb){
        rows[i].parentNode.insertBefore(rows[sync_calcList[id].comb[i]], rows[i]);
    }

    sw_drawChart = true;

    calcStage();
});
$('[id^=btn-rangeSelector]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));

    for(var i = 0; i < 4; i++) {
        if ($('#btn-rangeSelector-' + i).hasClass('btn-success')) {
            $('#btn-rangeSelector-' + i).removeClass('btn-success');
            $('#btn-rangeSelector-' + i).addClass('btn-default');
        }
    }
    $('#btn-rangeSelector-' + id).removeClass('btn-default');
    $('#btn-rangeSelector-' + id).addClass('btn-success');

    var extremes = chart.xAxis[0].getExtremes();
    var min = extremes.min;
    var max;

    switch(id){
        case 0:
            max = min + (1000 * 60 * 60 * 24); //1일
            break;
        case 1:
            max = min + (1000 * 60 * 60 * 24 * 7); //1주
            break;
        case 2:
            max = min + (1000 * 60 * 60 * 24 * 14); //2주
            break;
        case 3:
            max = min + (1000 * 60 * 60 * 24 * 28); //1달
            break;
        default:
            break;
    }
    chart.xAxis[0].setExtremes(min, max);

    drawTickets(id);
});
$('#auto_calc').off().on('click', function (e) {
    //$('#btn_wgt').trigger('click');

    var usedRes = new Object();
    var usedResA = new Array();
    sync_calcList.length = 0;

    usedRes.h = parseFloat(document.getElementById('wgt_huma').value);
    usedRes.a = parseFloat(document.getElementById('wgt_ammo').value);
    usedRes.f = parseFloat(document.getElementById('wgt_food').value);
    usedRes.p = parseFloat(document.getElementById('wgt_part').value);

    if(isNaN(usedRes.h)) usedRes.h = 1;
    if(isNaN(usedRes.a)) usedRes.a = 1.5;
    if(isNaN(usedRes.f)) usedRes.f = 1.5;
    if(isNaN(usedRes.p)) usedRes.p = 0.6;

    usedRes.type = binaryType(usedRes.h, usedRes.a, usedRes.f, usedRes.p);
    usedResA.push(usedRes);
    normalizeValues(usedResA);
    //console.log(objectList);

    var calcList = new Array();
    for(var i in objectList){
        var tmp = new Object();
        tmp.h = objectList[i].Human / objectList[i].Time * 60;
        tmp.a = objectList[i].Ammo / objectList[i].Time * 60;//
        tmp.f = objectList[i].Food / objectList[i].Time * 60;//
        tmp.p = objectList[i].Part / objectList[i].Time * 60;//
        tmp.t1 = objectList[i].Ticket_makeDoll / objectList[i].Time * 60;
        tmp.t2 = objectList[i].Ticket_makeTool / objectList[i].Time * 60;
        tmp.t3 = objectList[i].Ticket_fastMake / objectList[i].Time * 60;
        tmp.t4 = objectList[i].Ticket_fastRepair / objectList[i].Time * 60;
        calcList.push(tmp);
    }
    //console.log(calcList);

    var numAry = new Array();
    for(var i in objectList){
        numAry.push(i);
    }
    var comb = k_combinations(numAry, 4);
    //console.log(comb);

    var comb_calcList = new Array();
    for(var i in comb){
        var tmp = new Object;
        var th = 0, ta = 0, tf = 0, tp = 0;
        var tt1 = 0, tt2 = 0, tt3 = 0, tt4 = 0;
        for(var j in comb[i]){
            th += calcList[parseInt(comb[i][j])].h;
            ta += calcList[parseInt(comb[i][j])].a;
            tf += calcList[parseInt(comb[i][j])].f;
            tp += calcList[parseInt(comb[i][j])].p;
            tt1 += calcList[parseInt(comb[i][j])].t1;
            tt2 += calcList[parseInt(comb[i][j])].t2;
            tt3 += calcList[parseInt(comb[i][j])].t3;
            tt4 += calcList[parseInt(comb[i][j])].t4;
        }
        tmp.h = th;
        tmp.a = ta;
        tmp.f = tf;
        tmp.p = tp;
        tmp.total = th + ta + tf + tp;
        if( (tt1 >= wghtToggle[0]) &&
            (tt2 >= wghtToggle[1]) &&
            (tt3 >= wghtToggle[2]) &&
            (tt4 >= wghtToggle[3])){
            tmp.t = true;
        }else{
            tmp.t = false;
        }
        tmp.type = (binaryType(th,ta,tf,tp));
        tmp.idx = parseInt(i);
        tmp.comb = comb[parseInt(i)];
        comb_calcList.push(tmp);
    }
    normalizeValues(comb_calcList);

    var used = usedResA[0];
    for(var i in comb_calcList){
        if(comb_calcList[i].type == used.type){
            var sumH = 0;
            if(comb_calcList[i].h){
                if(comb_calcList[i].h >= used.h) {
                    comb_calcList[i].h = used.h / comb_calcList[i].h;
                }else{
                    comb_calcList[i].h = comb_calcList[i].h / used.h;
                }
                sumH += 1 / comb_calcList[i].h;
            }
            if(comb_calcList[i].a){
                if(comb_calcList[i].a >= used.a) {
                    comb_calcList[i].a = used.a / comb_calcList[i].a;
                }else{
                    comb_calcList[i].a = comb_calcList[i].a / used.a;
                }
                sumH += 1 / comb_calcList[i].a;
            }
            if(comb_calcList[i].f){
                if(comb_calcList[i].f >= used.f) {
                    comb_calcList[i].f = used.f / comb_calcList[i].f;
                }else{
                    comb_calcList[i].f = comb_calcList[i].f / used.f;
                }
                sumH += 1 / comb_calcList[i].f;
            }
            if(comb_calcList[i].p){
                if(comb_calcList[i].p >= used.p) {
                    comb_calcList[i].p = used.p / comb_calcList[i].p;
                }else{
                    comb_calcList[i].p = comb_calcList[i].p / used.p;
                }
                sumH += 1 / comb_calcList[i].p;
            }
            //comb_calcList[i].avgH = 4 / ((1/comb_calcList[i].h) + (1/comb_calcList[i].a) + (1/comb_calcList[i].f) + (1/comb_calcList[i].p));
            comb_calcList[i].avgH = 4 / sumH;
        }
    }
    //console.log(comb_calcList);

    var limit = 0.90;
    while(1){
        for(var i in comb_calcList){
            if((comb_calcList[i].avgH > limit) && (comb_calcList[i].t)){
                if(!((sync_calcList.filter(id => id.idx == comb_calcList[i].idx)).length)){ //중복이 아니면 0이 리턴된다, 중복검사로 쓰자?
                    sync_calcList.push(comb_calcList[i]);
                }
            }
        }
        if(sync_calcList.length > 4) {
            break;
        }else{
            limit = limit - 0.05;
            if(limit < 0.0){
                if(!sync_calcList.length){
                    alert(langPack.HTML.INCODE.ALERT2);
                    $('#recommendLine').addClass('hide');
                    return;
                }else{
                    break;
                }
            }
        }
    }
    sync_calcList.sort(function(a, b){return b.total - a.total});
    if(sync_calcList.length > 4) sync_calcList.length = 4; //0~3 이후로 삭제
    //console.log(sync_calcList);

    for(var i = 0; i < sync_calcList.length; i++){
        $('#btn-rec' + i).text('#' + (i + 1) + ' (' + (sync_calcList[i].avgH * 100).toFixed(1) + '%)');
        $('#btn-rec' + i).attr("title", langPack.HTML.TABLE.HELP.RECOMMEND.SIMM +': ' + (sync_calcList[i].avgH * 100).toFixed(1) + '%');
    }
    $('#recommendLine').removeClass('hide');

    highlight(9);

    function normalizeValues(ary){
        for(var i in ary){
            var div;
            switch(ary[i].type){
                case 0:
                    break;
                case 1:
                case 3:
                case 5:
                case 7:
                    div = ary[i].p;

                    ary[i].h = ary[i].h / div;
                    ary[i].a = ary[i].a / div;
                    ary[i].f = ary[i].f / div;
                    ary[i].p = ary[i].p / div;
                    break;
                case 2:
                case 6:
                case 10:
                case 11:
                    div = ary[i].f;

                    ary[i].h = ary[i].h / div;
                    ary[i].a = ary[i].a / div;
                    ary[i].f = ary[i].f / div;
                    ary[i].p = ary[i].p / div;
                    break;
                case 4:
                case 12:
                case 13:
                case 14:
                    div = ary[i].a;

                    ary[i].h = ary[i].h / div;
                    ary[i].a = ary[i].a / div;
                    ary[i].f = ary[i].f / div;
                    ary[i].p = ary[i].p / div;
                    break;
                case 8:
                case 9:
                case 15:
                    div = ary[i].h;

                    ary[i].h = ary[i].h / div;
                    ary[i].a = ary[i].a / div;
                    ary[i].f = ary[i].f / div;
                    ary[i].p = ary[i].p / div;
                    break;
                default:
                    break;
            }

        }
    }
    function binaryType(a,b,c,d){
        var e = 0;
        if(a) e+=8;
        if(b) e+=4;
        if(c) e+=2;
        if(d) e+=1;
        return e;
    }
    function k_combinations(set, k) {
        var i, j, combs, head, tailcombs;

        // There is no way to take e.g. sets of 5 elements from
        // a set of 4.
        if (k > set.length || k <= 0) {
            return [];
        }

        // K-sized set has only one K-sized subset.
        if (k == set.length) {
            return [set];
        }

        // There is N 1-sized subsets in a N-sized set.
        if (k == 1) {
            combs = [];
            for (i = 0; i < set.length; i++) {
                combs.push([set[i]]);
            }
            return combs;
        }

        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
            // head is a list that includes only our current element.
            head = set.slice(i, i + 1);
            // We take smaller combinations from the subsequent elements
            tailcombs = k_combinations(set.slice(i + 1), k - 1);
            // For each (k-1)-combination we join it with the current
            // and store it to the set of k-combinations.
            for (j = 0; j < tailcombs.length; j++) {
                combs.push(head.concat(tailcombs[j]));
            }
        }
        return combs;
    }
});
$('#btn-toggleTime').off().on('click', function (e) {
    highlight(1);
    if(sw_time){
        sw_time = false;
        config.time = false;
        //document.getElementById('btn-toggleTime').innerHTML = "성공시<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNSUCS);
    }else{
        sw_time = true;
        config.time = true;
        //document.getElementById('btn-toggleTime').innerHTML = "시간당<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    }
    localStorage.config = JSON.stringify(config);
    refresh();
});
$('#btn-toggleHelp').off().on('click', function (e) {
    if($('#panel-help').hasClass('hide')){
        config.help = true;
        localStorage.config = JSON.stringify(config);
        $('#panel-help').removeClass('hide');
        $('#str_toggleHelp').text(langPack.HTML.TABLE.HELP.CLOSE);
    }else{
        config.help = false;
        localStorage.config = JSON.stringify(config);
        $('#panel-help').addClass('hide');
        $('#str_toggleHelp').text(langPack.HTML.TABLE.HELP.OPEN);
    }
});
$('#btn-toggleNotice').off().on('click', function (e) {
    if($('#panel-notice').hasClass('hide')){
        $('#panel-notice').removeClass('hide');
    }else{
        $('#panel-notice').addClass('hide');
    }
});
$('#btn-load').off().on('click', function (e) {
    loadSaves();
    $('#loadModal').modal("show");
});

$('#btn-save').off().on('click', function (e) {
    if(selectedList.length == 0){alert(langPack.HTML.INCODE.ALERT3); return;}
    var desc = prompt(langPack.HTML.INCODE.SAVE);
    var ary = new Array();
    var obj = new Object();
    for(var i in selectedList){
        var t = objectList[parseInt(selectedList[i])].Area * 4 + objectList[parseInt(selectedList[i])].Stage - 1;
        ary.push(t);
    }
    ary.sort(function(a, b){return a - b});
    obj.list = ary;
    obj.desc = desc;
    saves.push(obj);

    localStorage.saves = JSON.stringify(saves);
});

$('#btn-capt').off().on('click', function (e) {
    var absSelect = new Array();
    for(var i in selectedList){absSelect.push(((objectList[parseInt(selectedList[i])].Area * 4) + (objectList[parseInt(selectedList[i])].Stage - 1)));}
    absSelect.sort(sortFunctionPlane);
    var encodedString = encodeHEX(absSelect);
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = 'https://tempkaridc.github.io/gf/index.html?c=' + encodedString + '\n' + cptStr; // cptStr
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert(langPack.HTML.INCODE.ALERT4 + '\n'+ t.value);
    function sortFunctionPlane(a, b) {if (a === b) {return 0;}else {return (a < b) ? -1 : 1;}}
});
$('#btn-timetable').off().on('click', function (e) {
    var code = new Array();
    code.push(42);      // 8시 시작 (420/10)
    var absSelect = new Array();
    for(var i in selectedList){absSelect.push(((objectList[parseInt(selectedList[i])].Area * 4) + (objectList[parseInt(selectedList[i])].Stage - 1)));}
    absSelect.sort(sortFunctionPlane);
    for(var i = 0; i < 4; i++){
        if(absSelect[i] === undefined){
            code.push(10);//    false / 10
        }else{
            code.push(absSelect[i])
        }
    }
    if(sw_interval == true){
        code.push(1);           // 확인 주기 적용여부
        code.push(val_interval / 10);
    }else{
        code.push(0);           // 확인 주기 적용여부
        code.push(0);           // 기본값이 0이더라..?
    }
    code.push(0);           // 수면 False
    //var coded = Base64.encode(JSON.stringify(code));
    var coded = encodeHEX(code);
    window.open('timetable.html?c=' + coded, '_blank');
    function sortFunctionPlane(a, b) {if (a === b) {return 0;}else {return (a < b) ? -1 : 1;}}
});

$(document).ready(function() {
    $(document).on('keydown', 'input', function (e) {
        if (e.which == 13  || e.keyCode == 13 ){
            e.preventDefault();
            var $canfocus = $('input')
            var index = $canfocus.index(document.activeElement) + 1;
            if (index >= $canfocus.length) index = 0;
            $canfocus.eq(index).focus();
        }
    });
});
function highlight(id){
    $('[id^=high_]').removeClass('success');
    if(id > 0){
        $('#high_0' + id).addClass('success');
    }
}

function loadSaves(){
    saves = localStorage.saves;

    if(saves === undefined) {         //no config cache
        saves = new Array();
        localStorage.saves = JSON.stringify(saves);
    }else{
        saves = JSON.parse(localStorage.saves);

        //임시로 이벤트쪽에서 save 섞인 파일 지우는 코드 삽입해둠... 먼 훗날 삭제바람
        if(saves.title !== undefined){
            saves = new Array();
            localStorage.saves = JSON.stringify(saves);
        }
    }
    //console.log(saves);

    $('#load-list').empty();
    for(var i in saves){
        var area = "";
        for(var j in saves[i].list){
            area += parseInt(saves[i].list[j] / 4) + '-' +  ((saves[i].list[j] % 4) + 1) + ', ';
        }
        var td1 = '<td style="text-align: center; vertical-align:middle;" width="10%">';
        var td3 = '<td style="text-align: center; vertical-align:middle;" width="30%">';
        var td6 = '<td style="text-align: center; vertical-align:middle;" width="60%">';
        var tde = '</td>';
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" onClick="click_table_load(this)";>';
        item += td3 + area.slice(0,-2) + tde;
        item += td6 + saves[i].desc + tde;
        item += td1 + '<div id="remove-save-' + i + '" idx ="' + i + '" title="' + langPack.HTML.INCODE.DELETE + '" class="btn"><i class="glyphicon glyphicon-trash"></i></div>' + tde;
        item += '</tr>';
        $('#load-list').append(item);
    }

    $('[id^=remove-save-]').off().on('click', function (e) {
        e.stopPropagation();

        var id = $(this).attr('idx');  //close, confirm
        saves.splice(id, 1);
        localStorage.saves = JSON.stringify(saves);
        loadSaves();
        //refresh();
    });
}
function clearRow(){
    selectedList.length = 0;
    for(var i in objectList) {
        var rowName = '#table-row-' + i;

        if ($(rowName).hasClass('success')) {
            $(rowName).removeClass('success');
        }
    }
}
function clickRow(index){
    var rowName = '#table-row-' + index;

    if($(rowName).hasClass('success')){
        $(rowName).removeClass('success');
        for(i in selectedList){
            if(selectedList[i] == index){
                selectedList.splice(i, 1);
                break;
            }
        }
    }else{
        $(rowName).addClass('success');
        selectedList.push(index);

        //selectedList.sort(function(a, b){return parseInt(a) - parseInt(b)});
        //지울때 큐순서로 지워지게 하는 기능 보완 없으면 못바꿔
        if(selectedList.length > 4){ //Stack Full
            $('#table-row-' + selectedList[0]).removeClass('success');
            selectedList.splice(0,1);
        }
    }
    //console.log('chartshown:' + sw_chartshown + ' mobile:' + sw_mobile);
    calcStage();
}
function clone(obj) {
    if (obj === null || typeof(obj) !== 'object')
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}
function dispTime(){
    $('#str_selecttime_times').text(timeToggle[time_front] + ' ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR); //hours hour 혼용예정
    $('#str_selecttime_timee').text(timeToggle[time_end] + ' ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR);
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
    if(column == 0){column = 13;} //지역소팅
    if(column == 6){column = 14;} //시간소팅

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
    var sumH = 0, sumA = 0, sumF = 0, sumP = 0, sumAll = 0;
    var sumT = "", sumItem = "", sumTime = "";
    //var sumHp = 0, sumAp = 0, sumFp = 0, sumPp = 0, sumTp = 0;
    val_sumItem.d = 0;  val_sumItem.t = 0;  val_sumItem.f = 0;  val_sumItem.r = 0;  val_sumItem.k = 0;
    val_sumItem.dt = 0; val_sumItem.tt = 0; val_sumItem.ft = 0; val_sumItem.rt = 0; val_sumItem.kt = 0;


    var perMin;

    for(i in selectedList){
        if(sw_time){
            perMin = objectList[selectedList[i]].Time / 60;
        }else{
            perMin = 1;
        }

        sumH += objectList[selectedList[i]].Human / perMin;
        sumA += objectList[selectedList[i]].Ammo / perMin;
        sumF += objectList[selectedList[i]].Food / perMin;
        sumP += objectList[selectedList[i]].Part / perMin;
        sumAll = sumH * val_sumRate.h + sumA * val_sumRate.a + sumF * val_sumRate.f + sumP * val_sumRate.p;
        sumT += objectList[selectedList[i]].Area + '-' + objectList[selectedList[i]].Stage + ', ';
        sumTime += + parseInt(objectList[selectedList[i]].Time / 60) + ':' + (objectList[selectedList[i]].Time % 60 == 0 ? '00' : objectList[selectedList[i]].Time % 60);
        sumTime += ', ';

        if(objectList[selectedList[i]].Ticket_makeDoll){
            val_sumItem.d += objectList[selectedList[i]].Ticket_makeDoll;
            val_sumItem.dt += objectList[selectedList[i]].Ticket_makeDoll / objectList[selectedList[i]].Time * 60;
        }
        if(objectList[selectedList[i]].Ticket_makeTool){
            val_sumItem.t += objectList[selectedList[i]].Ticket_makeTool;
            val_sumItem.tt += objectList[selectedList[i]].Ticket_makeTool / objectList[selectedList[i]].Time * 60;
        }
        if(objectList[selectedList[i]].Ticket_fastMake){
            val_sumItem.f += objectList[selectedList[i]].Ticket_fastMake;
            val_sumItem.ft += objectList[selectedList[i]].Ticket_fastMake / objectList[selectedList[i]].Time * 60;
        }
        if(objectList[selectedList[i]].Ticket_fastRepair){
            val_sumItem.r += objectList[selectedList[i]].Ticket_fastRepair;
            val_sumItem.rt += objectList[selectedList[i]].Ticket_fastRepair / objectList[selectedList[i]].Time * 60;
        }
        if(objectList[selectedList[i]].Ticket_Tokken){
            val_sumItem.k += objectList[selectedList[i]].Ticket_Tokken;
            val_sumItem.kt += objectList[selectedList[i]].Ticket_Tokken / objectList[selectedList[i]].Time * 60;
        }
    }

    $('#sumH').text(sumH.toFixed(0));
    $('#sumA').text(sumA.toFixed(0));
    $('#sumF').text(sumF.toFixed(0));
    $('#sumP').text(sumP.toFixed(0));
    $('#sumAll').text(sumAll.toFixed(0));
    $('#sumT').text(sumT.slice(0,-2));

    var timeTitle = langPack.HTML.TABLE.TICKET_PER_HOUR;
    var displayH = '/h';
    if(!sw_time){
        timeTitle = langPack.HTML.TABLE.TICKET_PER_RECV;
        displayH = ''
    }

    if(val_sumItem.d){
        sumItem += '<div class="table-ticket-box" title="' + timeTitle +'">';
        sumItem += '<img class="table-ticket-img" src="img/doll.png" title="' + langPack.HTML.TABLE.TICKET_DOLL + '">';
        sumItem += '<span class="table-ticket-outline">' + (val_sumItem.d).toFixed(2) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.t){
        sumItem += '<div class="table-ticket-box" title="' + timeTitle +'">';
        sumItem += '<img class="table-ticket-img" src="img/tool.png" title="' + langPack.HTML.TABLE.TICKET_TOOL + '">';
        sumItem += '<span class="table-ticket-outline">' + (val_sumItem.t).toFixed(2) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.f){
        sumItem += '<div class="table-ticket-box" title="' + timeTitle +'">';
        sumItem += '<img class="table-ticket-img" src="img/fast.png" title="' + langPack.HTML.TABLE.TICKET_FAST + '">';
        sumItem += '<span class="table-ticket-outline">' + (val_sumItem.f).toFixed(2) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.r) {
        sumItem += '<div class="table-ticket-box" title="' + timeTitle + '">';
        sumItem += '<img class="table-ticket-img" src="img/repr.png" title="' + langPack.HTML.TABLE.TICKET_REPR + '">';
        sumItem += '<span class="table-ticket-outline">' + (val_sumItem.r).toFixed(2) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.k){
        sumItem += '<div class="table-ticket-box" title="' + timeTitle + '">';
        sumItem += '<img class="table-ticket-img" src="img/tokn.png" title="' + langPack.HTML.TABLE.TICKET_TOKN + '">';
        sumItem += '<span class="table-ticket-outline">' + (val_sumItem.k).toFixed(2) + displayH + '</span>';
        sumItem += '</div>';
    }

    $('#sumItem').empty();
    $('#sumItem').append(sumItem);



    var orTime = langPack.HTML.TABLE.PER_RECV;
    if(sw_time){
        orTime = langPack.HTML.TABLE.PER_HOUR;
    }

    cptStr = langPack.HTML.TABLE.AREA + ': ' + sumT.slice(0,-2) + '　\n';
    cptStr += langPack.HTML.TABLE.TIME + ': ' + sumTime.slice(0,-2) + '　\n';
    cptStr += langPack.HTML.TABLE.RSRC + '(' + orTime + '): '
            + langPack.HTML.TABLE.HUMA + '[' + sumH.toFixed(0) + '] '
            + langPack.HTML.TABLE.AMMO + '[' + sumA.toFixed(0) + '] '
            + langPack.HTML.TABLE.FOOD + '[' + sumF.toFixed(0) + '] '
            + langPack.HTML.TABLE.PART + '[' + sumP.toFixed(0) + ']　\n'
            + langPack.HTML.TABLE.TICKET + '(' + orTime + '): ';
    if(val_sumItem.d){cptStr += langPack.HTML.TABLE.TICKET_DOLL + '[' + (val_sumItem.d).toFixed(2) + '] ';}
    if(val_sumItem.t){cptStr += langPack.HTML.TABLE.TICKET_TOOL + '[' + (val_sumItem.t).toFixed(2) + '] ';}
    if(val_sumItem.f){cptStr += langPack.HTML.TABLE.TICKET_FAST + '[' + (val_sumItem.f).toFixed(2) + '] ';}
    if(val_sumItem.r){cptStr += langPack.HTML.TABLE.TICKET_REPR + '[' + (val_sumItem.r).toFixed(2) + '] ';}
    if(val_sumItem.k){cptStr += langPack.HTML.TABLE.TICKET_TOKN + '[' + (val_sumItem.k).toFixed(2) + '] ';}

    //연속입력시 2초안에 입력시 갱신시점 1초뒤로 재갱신,
    if(sw_drawReserved) clearTimeout(drawTimer);

    drawTimer = setTimeout(function(){drawStage()}, 1000);
    sw_drawReserved = true;
}

function drawStage(){
    var sumT = "";
    var aryH = new Array();
    var aryA = new Array();
    var aryF = new Array();
    var aryP = new Array();

    //Mobile Chart Drawing Junction
    if(!sw_drawChart) return;

    var date = new Date();
    now = date.getTime() - (date.getTimezoneOffset() * 60 * 1000); // GMT+9

    for(i in selectedList){
        var maxTimeRange = 60 * 24 * 30; //60min * 24hours * 30days

        sumT += objectList[selectedList[i]].Area + '-' + objectList[selectedList[i]].Stage + ', ';

        //3분에 인탄식 3회복 & 3분에 부품 1회복
        if(sw_recovery){
            for(var j = 0; j < parseInt(maxTimeRange / 60) + 1; j++){
                var tmp = new Array();
                tmp[0] = j * 60 * 60 * 1000;
                tmp[1] = 60;
                chkDuplArray(aryH,tmp);

                var tmp = new Array();
                tmp[0] = j * 60 * 60 * 1000;
                tmp[1] = 60;
                chkDuplArray(aryA,tmp);

                var tmp = new Array();
                tmp[0] = j * 60 * 60 * 1000;
                tmp[1] = 60;
                chkDuplArray(aryF,tmp);

                var tmp = new Array();
                tmp[0] = j * 60 * 60 * 1000;
                tmp[1] = 20;
                chkDuplArray(aryP,tmp);
            }
        }

        for(var j = 0; j < parseInt(maxTimeRange / objectList[selectedList[i]].Time) + 1; j++){
            timeCount = j * objectList[selectedList[i]].Time;

            var tmp = new Array();
            tmp[0] = timeCount * 60 * 1000;
            tmp[1] = objectList[selectedList[i]].Human;
            chkDuplArray(aryH,tmp);

            var tmp = new Array();
            tmp[0] = timeCount * 60 * 1000;
            tmp[1] = objectList[selectedList[i]].Ammo;
            chkDuplArray(aryA,tmp);

            var tmp = new Array();
            tmp[0] = timeCount * 60 * 1000;
            tmp[1] = objectList[selectedList[i]].Food;
            chkDuplArray(aryF,tmp);

            var tmp = new Array();
            tmp[0] = timeCount * 60 * 1000;
            tmp[1] = objectList[selectedList[i]].Part;
            chkDuplArray(aryP,tmp);
        }
    }

    chart_time = new Array();

    var obj_LineH = new Object();
    obj_LineH.name = langPack.HTML.TABLE.HUMA;
    aryH.sort(sortFunction);
    stackArray(aryH,1);
    obj_LineH.data = aryH;
    chart_time.push(obj_LineH);

    var obj_LineA = new Object();
    obj_LineA.name = langPack.HTML.TABLE.AMMO;
    aryA.sort(sortFunction);
    stackArray(aryA,2);
    obj_LineA.data = aryA;
    chart_time.push(obj_LineA);

    var obj_LineF = new Object();
    obj_LineF.name = langPack.HTML.TABLE.FOOD;
    aryF.sort(sortFunction);
    stackArray(aryF,3);
    obj_LineF.data = aryF;
    chart_time.push(obj_LineF);

    var obj_LineP = new Object();
    obj_LineP.name = langPack.HTML.TABLE.PART;
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
        boost: {
            useGPUTranslations: true
        },
        title: {
            text: "와쨩 다이스키!"
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
                hour:"%a, %H" + langPack.HTML.CHART.HOUR,
                day:"%a, %H" + langPack.HTML.CHART.DAY
            }
        },
        yAxis: {
            title: {
                text: null
            },
            min: 0
        },
        tooltip: {
            xDateFormat: "%B %d" + langPack.HTML.CHART.DAY + " %A, %H" + langPack.HTML.CHART.HOUR + " %M" + langPack.HTML.CHART.MIN,
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
            y: 20,
            floating: true
        },
        series: chart_time
    });

    for(var i = 0; i < 4; i++) {
        if ($('#btn-rangeSelector-' + i).hasClass('btn-success')) {
            $('#btn-rangeSelector-' + i).removeClass('btn-success');
            $('#btn-rangeSelector-' + i).addClass('btn-default');
        }
    }
    $('#btn-rangeSelector-0').removeClass('btn-default');
    $('#btn-rangeSelector-0').addClass('btn-success');

    if(sumT.slice(0,-2) == ""){
        $('#text-graphTitle').text("　");
    }else{
        $('#text-graphTitle').text(sumT.slice(0,-2));
    }

    drawTickets(0);

    chart.xAxis[0].setExtremes(now, now + (1000 * 60 * 60 * 24)); //초기값 X-axis range 1dayms
}

function drawTickets(range){
    var time = 24;
    switch(range){
        case 0: time = 24;          break;
        case 1: time = 24 * 7;      break;
        case 2: time = 24 * 7 * 2;  break;
        case 3: time = 24 * 7 * 4;  break;
        default:time = 24;          break;
    }

    $('#num_chart_doll').text((val_sumItem.dt * time).toFixed(2));
    $('#num_chart_tool').text((val_sumItem.tt * time).toFixed(2));
    $('#num_chart_fast').text((val_sumItem.ft * time).toFixed(2));
    $('#num_chart_repr').text((val_sumItem.rt * time).toFixed(2));
    $('#num_chart_tokn').text((val_sumItem.kt * time).toFixed(2));
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
    for(var i in ary){
        if(i > 0){
            ary[i][1] += ary[i-1][1];
        }
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
        if(sw_zero){
            //data가 0일경우 그래프에서 삭제했었는데, 요청으로 0 부활시켜야겠음.
            //push 하지않고 return 시 해당 노드는 삭제됨
            ary.push(obj);
            return;
        }else{
            return;
        }
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
    var perMin = 1;
    var byTime = langPack.HTML.TABLE.TICKET_PER_RECV;
    var byTimeShort = '';
    for(var i in objectList){
        if(sw_time){
            perMin = objectList[i].Time / 60;
            byTime = langPack.HTML.TABLE.TICKET_PER_HOUR;
            byTimeShort = '/h';
        }
        var td0 = '<td style="text-align: center; vertical-align:middle; display:none;">';
        var td11 = '<td class="table-expand-mobile" style="text-align: center; vertical-align:middle;" width="11%">';
        var td23 = '<td style="text-align: center; vertical-align:middle;" width="23%">';
        var tde = '</td>';
        //onClick="btn_toggleMenu(this);"
        //var item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable">';
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" onClick="click_table_main(this)";>';
        /*00*/item += td11 + objectList[i].Area + '-' + objectList[i].Stage + tde;
        /*01*/item += td11 + parseInt(objectList[i].Human / perMin) + tde;
        /*02*/item += td11 + parseInt(objectList[i].Ammo / perMin) + tde;
        /*03*/item += td11 + parseInt(objectList[i].Food / perMin) + tde;
        /*04*/item += td11 + parseInt(objectList[i].Part / perMin) + tde;
        /*05*/item += td11 + parseInt(objectList[i].Human / perMin * val_sumRate.h +
                                      objectList[i].Ammo / perMin * val_sumRate.a +
                                      objectList[i].Food / perMin * val_sumRate.f +
                                      objectList[i].Part / perMin * val_sumRate.p) + tde;
        /*06*/item += td11 + parseInt(objectList[i].Time / 60) + ':' + (objectList[i].Time % 60 == 0 ? '00' : objectList[i].Time % 60) + tde;
        /*07*/item += td0 + objectList[i].Ticket_makeDoll / perMin + tde;
        /*08*/item += td0 + objectList[i].Ticket_makeTool / perMin + tde;
        /*09*/item += td0 + objectList[i].Ticket_fastMake / perMin + tde;
        /*10*/item += td0 + objectList[i].Ticket_fastRepair / perMin + tde;
        /*11*/item += td0 + objectList[i].Ticket_Tokken / perMin + tde;
        /*12*/item += td23 + '<div style="width:100%;">';
                if(objectList[i].Ticket_makeDoll){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_makeDoll * 100 / perMin).toFixed(2) + '%">';
                    item += '<img src="img/doll.png" class="table-ticket-img">';
                    item += '<span class="table-ticket-outline">' + (objectList[i].Ticket_makeDoll / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_makeTool){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_makeTool * 100 / perMin).toFixed(2) + '%">';
                    item += '<img src="img/tool.png" class="table-ticket-img">';
                    item += '<span class="table-ticket-outline">' + (objectList[i].Ticket_makeTool / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_fastMake){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_fastMake * 100 / perMin).toFixed(2) + '%">';
                    item += '<img src="img/fast.png" class="table-ticket-img">';
                    item += '<span class="table-ticket-outline">' + (objectList[i].Ticket_fastMake / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_fastRepair){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_fastRepair * 100 / perMin).toFixed(2) + '%">';
                    item += '<img src="img/repr.png" class="table-ticket-img">';
                    item += '<span class="table-ticket-outline">' + (objectList[i].Ticket_fastRepair / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_Tokken){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_Tokken * 100 / perMin).toFixed(2) + '%">';
                    item += '<img src="img/tokn.png" class="table-ticket-img">';
                    item += '<span class="table-ticket-outline">' + (objectList[i].Ticket_Tokken / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                item += '</div>' + tde;
        /*13*/item += td0 + objectList[i].Area * 10 + objectList[i].Stage + tde;
        /*14*/item += td0 + objectList[i].Time + tde;
        item += '</tr>';
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
    if(sw_time){
        //"시간당<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    }else{
        //"성공시<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNSUCS);
    }
}
function callData(){
    // 11col
    //  Area,   Stage,  Time,   Huma,   Ammo,   MRE,    Part,   Doll,   Tool,   Fast,   Repr,   Tokn
    var arr = [
        [0,     1,      50,     0,      145,    145,    0,      0,      0,      0.2,    0.5,    0   ],
        [0,     2,      180,    550,    0,      0,      350,    0.5,    0,      0,      0,      0   ],
        [0, 3,  720,    900,900,900,250,0,0.4,0,0.4,0],
        [0, 4,  1440,   0,1200,800,750,0,0,0,0,1],
        [1, 1,  15,     10,30,15,0,0,0,0,0,0],
        [1, 2,  30,     0,40,60,0,0,0,0,0,0],
        [1, 3,  60,     30,0,30,10,0,0,0,0.6,0],
        [1, 4,  120,    160,160,0,0,0.2,0,0,0,0],
        [2, 1,  40,     100,0,0,30,0,0,0,0,0],
        [2, 2,  90,     60,200,80,0,0,0,0,0.3,0],
        [2, 3,  240,    10,10,10,230,0,0,0.5,0.5,0],
        [2, 4,  360,    0,250,600,60,0.8,0,0,0,0],
        [3, 1,  20,     50,0,75,0,0,0,0,0,0],
        [3, 2,  45,     0,120,70,30,0,0,0,0,0],
        [3, 3,  90,     0,300,0,0,0,0,0.4,0.45,0],
        [3, 4,  300,    0,0,300,300,0.35,0.4,0,0,0],
        [4, 1,  60,     0,185,185,0,0,0.2,0,0,0],
        [4, 2,  120,    0,0,0,210,0,0,0.5,0,0],
        [4, 3,  360,    800,550,0,0,0.7,0,0,0.3,0],
        [4, 4,  480,    400,400,400,150,0,0,1,0,0],
        [5, 1,  30,     0,0,100,45,0,0,0,0,0],
        [5, 2,  150,    0,600,300,0,0,0,0,0.8,0],
        [5, 3,  240,    800,400,400,0,0,0.5,0,0,0],
        [5, 4,  420,    100,0,0,700,0.4,0,0,0,0],
        [6, 1,  120,    300,300,0,100,0,0,0,0,0],
        [6, 2,  180,    0,200,550,100,0,0,0.2,0.5,0],
        [6, 3,  300,    0,0,200,500,0,0.6,0,0,0],
        [6, 4,  720,    800,800,800,0,0,0,0,0,0.8],
        [7, 1,  150,650,0,650,0,0,0,0,0,0],
        [7, 2,  240,0,650,0,300,0.7,0,0,0.3,0],
        [7, 3,  330,900,600,600,0,0,0.7,0,0,0],
        [7, 4,  480,250,250,250,600,0,0,0.8,0,0],
        [8, 1,  60,150,150,150,0,0,0.4,0,0,0],
        [8, 2,  180,0,0,0,450,0,0,0,0.8,0],
        [8, 3,  360,400,800,800,0,0,0,0.6,0.3,0],
        [8, 4,  540,1500,400,400,100,0.9,0,0,0,0],
        [9, 1,  30,0,0,100,50,0,0,0,0,0],
        [9, 2,  90,180,0,180,100,0,0,0.25,0,0],
        [9, 3,  270,750,750,0,0,0.7,0,0,0,0],
        [9, 4,  420,500,900,900,0,0,1,0,0,0],
        [10,1,  40,140,200,0,0,0,0,0,0,0],
        [10,2,  100,0,240,180,0,0.75,0,0.25,0,0],
        [10,3,  320,0,480,480,300,0,0,0.3,0.5,0],
        [10,4,  600,660,660,660,330,0,0.9,0,0,0],
        [11,1,  240,350,1050,0,0,0.5,0.5,0,0,0],
        [11,2,  240,360,540,540,0,1,0,0,0,0],
        [11,3,  480,0,750,1500,250,0,0,0,0.5,0],
        [11,4,  600,0,1650,0,900,0,0,1,0,0]
    ];

    if(sw_interval == true){
        for(var i in arr){
            if((arr[i][2] % val_interval) == 0){
                arr[i][2] = val_interval * (parseInt(arr[i][2] / val_interval));
            }else{
                arr[i][2] = val_interval * (parseInt(arr[i][2] / val_interval) + 1);
            }
        }
    }

    for(var i in arr){
        var tmp = new Object();
        tmp.Area = arr[i][0];
        tmp.Stage = arr[i][1];
        tmp.Time = arr[i][2];

        if(sw_sucs){
            tmp.Human   = arr[i][3] * (0.5 * val_success + 1);
            tmp.Ammo    = arr[i][4] * (0.5 * val_success + 1);
            tmp.Food    = arr[i][5] * (0.5 * val_success + 1);
            tmp.Part    = arr[i][6] * (0.5 * val_success + 1);

            tmp.Ticket_total = arr[i][7] + arr[i][8] + arr[i][9] + arr[i][10] + arr[i][11];

            if(arr[i][7]){
                tmp.Ticket_makeDoll     =   val_success * arr[i][7] / tmp.Ticket_total + (1 - val_success) * arr[i][7];
            }else{tmp.Ticket_makeDoll   = 0;}
            if(arr[i][8]){
                tmp.Ticket_makeTool     =   val_success * arr[i][8] / tmp.Ticket_total + (1 - val_success) * arr[i][8];
            }else{tmp.Ticket_makeTool   = 0;}
            if(arr[i][9]){
                tmp.Ticket_fastMake     =   val_success * arr[i][9] / tmp.Ticket_total + (1 - val_success) * arr[i][9];
            }else{tmp.Ticket_fastMake   = 0;}
            if(arr[i][10]){
                tmp.Ticket_fastRepair   =   val_success * arr[i][10] / tmp.Ticket_total + (1 - val_success) * arr[i][10];
            }else{tmp.Ticket_fastRepair = 0;}
            if(arr[i][11]){
                tmp.Ticket_Tokken       =   val_success * arr[i][11] / tmp.Ticket_total + (1 - val_success) * arr[i][11];
            }else{tmp.Ticket_Tokken     = 0;}
        }else{
            tmp.Human   = arr[i][3];
            tmp.Ammo    = arr[i][4];
            tmp.Food    = arr[i][5];
            tmp.Part    = arr[i][6];

            if(arr[i][7]){
                tmp.Ticket_makeDoll     = arr[i][7];
            }else{tmp.Ticket_makeDoll   = 0;}
            if(arr[i][8]){
                tmp.Ticket_makeTool     = arr[i][8];
            }else{tmp.Ticket_makeTool   = 0;}
            if(arr[i][9]){
                tmp.Ticket_fastMake     = arr[i][9];
            }else{tmp.Ticket_fastMake   = 0;}
            if(arr[i][10]){
                tmp.Ticket_fastRepair   = arr[i][10];
            }else{tmp.Ticket_fastRepair = 0;}
            if(arr[i][11]){
                tmp.Ticket_Tokken       = arr[i][11];
            }else{tmp.Ticket_Tokken     = 0;}
        }

        if( (areaToggle[tmp.Area])
            && (timeToggle[time_front] * 60 <= tmp.Time)
            && (tmp.Time <= timeToggle[time_end] * 60)
        ){
            objectList.push(tmp);
        }
    }
}

function reload(){
    for(var i in areaToggle){   //전지역 초기화
        areaToggle[i] = 1;
    }
    time_front = 0;
    time_end = timeToggle.length- 1;

    if($('#btn_toggle_interval').hasClass('btn-success')){
        $('#btn_toggle_interval').removeClass('btn-success');
        $('#btn_toggle_interval').addClass('btn-default');
        sw_interval = false;
    }

    for(var i = 0; i < areaToggle.length - 1; i++){
        if(!$('#btn-area-'+i).hasClass('btn-success')){
            $('#btn-area-'+i).addClass('btn-success');
        }
    }

    dispTime();
}

function refresh(){
    $('#sort-0').trigger('click');
    $('#sortContract').val(99);
    objectList.length = 0;
    selectedList.length = 0;
    sync_calcList.length = 0;
    $('#recommendLine').addClass('hide');
    callData();
    loadTable();
    calcStage();
    disp_summary();
}

function chkURLhash(){
    if(myParam != null){
        try{
            var param = decodeHEX(myParam);
            for(var i in param){
                clickRow(param[i]);
            }
            var rows = document.getElementById("area-list").getElementsByTagName("TR");
            for(var i in param){
                rows[i].parentNode.insertBefore(rows[param[i]], rows[i]);
            }
            calcStage();
        }catch(e){
            return;
        }
    }
}

function selectInterval(elem){
    val_interval = parseInt(elem.value);
    if($('#btn_toggle_interval').hasClass('btn-success')){
        $('#btn_toggle_interval').trigger('click');
        $('#btn_toggle_interval').trigger('click');
    }
}

function selectLanguage(elem){
    selLang = elem.value;
    loadLanguage();
}

function loadLanguage(){
    switch(selLang){
        case 'ko':
            langPack = langPacks.ko;
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
            break;
        case 'en':
            langPack = langPacks.en;
            Highcharts.setOptions({
                lang: {
                    months: [
                        'January','February','March','April','May','June','July','August','September','October','November','December'
                    ],
                    shortMonths: [
                        'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
                    ],
                    weekdays: [
                        'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
                    ],
                    shortWeekdays: [
                        'Sun','Mon','Tue','Wed','Thu','Fri','Sat'
                    ]
                }
            });
            break;
        case 'ja':
            langPack = langPacks.ja;
            Highcharts.setOptions({
                lang: {
                    months: [
                        '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
                    ],
                    shortMonths: [
                        '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
                    ],
                    weekdays: [
                        '日','月','火','水','木','金','土'
                    ],
                    shortWeekdays: [
                        '日','月','火','水','木','金','土'
                    ]
                }
            });
            break;
        default:
            langPack = langPacks.ko;
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
            break;
    }
    config.lang = selLang;
    localStorage.config = JSON.stringify(config);

    setLanguage();
}

function setLanguage(){
    //langPack <- 언어별 Language Package
    //document.title = langPack.HTML.TITLE;
    $('#str_area').text(langPack.HTML.TABLE.AREA);
    $('#str_huma').text(langPack.HTML.TABLE.HUMA);
    $('#str_ammo').text(langPack.HTML.TABLE.AMMO);
    $('#str_food').text(langPack.HTML.TABLE.FOOD);
    $('#str_part').text(langPack.HTML.TABLE.PART);
    $('#str_sum').text(langPack.HTML.TABLE.SUM);
    $('#sort-5').attr('title', langPack.HTML.TABLE.SUMRATIO + val_sumRate.h + ':' + val_sumRate.a + ':' + val_sumRate.f + ':' + val_sumRate.p);
    $('#str_time').text(langPack.HTML.TABLE.TIME);

    $('#sortContract option[value=99]').text('- ' + langPack.HTML.TABLE.TICKET + ' -');
    $('#sortContract option[value=7]').text(langPack.HTML.TABLE.TICKET_DOLL);
    $('#sortContract option[value=8]').text(langPack.HTML.TABLE.TICKET_TOOL);
    $('#sortContract option[value=9]').text(langPack.HTML.TABLE.TICKET_FAST);
    $('#sortContract option[value=10]').text(langPack.HTML.TABLE.TICKET_REPR);
    $('#sortContract option[value=11]').text(langPack.HTML.TABLE.TICKET_TOKN);

    $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    $('#str_selectedarea').html(langPack.HTML.TABLE.SELAREA);
    $('#str_load').text(langPack.HTML.TABLE.LOAD);
    $('#str_save').text(langPack.HTML.TABLE.SAVE);
    $('#str_copy').text(langPack.HTML.TABLE.COPY);
    $('#str_timetable').text(langPack.HTML.TABLE.TIMETABLE);

    $('#str_toggleHelp').text(langPack.HTML.TABLE.HELP.OPEN);
    $('#help_01').html(langPack.HTML.TABLE.HELP.TIPS.TIP1);
    $('#help_02').html(langPack.HTML.TABLE.HELP.TIPS.TIP2);
    $('#help_03').html(langPack.HTML.TABLE.HELP.TIPS.TIP3);
    $('#help_04').html(langPack.HTML.TABLE.HELP.TIPS.TIP4);
    $('#help_05').html(langPack.HTML.TABLE.HELP.TIPS.TIP5);
    $('#help_05a').html(langPack.HTML.TABLE.HELP.TIPS.TIP5a);
    $('#help_06').html(langPack.HTML.TABLE.HELP.TIPS.TIP6);
    $('#help_07').html(langPack.HTML.TABLE.HELP.TIPS.TIP7);
    $('#help_08').html(langPack.HTML.TABLE.HELP.TIPS.TIP8);
    $('#help_09').html(langPack.HTML.TABLE.HELP.TIPS.TIP9);
    $('#help_09a').html(langPack.HTML.TABLE.HELP.TIPS.TIP9a);
    $('#help_09b').html(langPack.HTML.TABLE.HELP.TIPS.TIP9b);
    $('#help_09c').html(langPack.HTML.TABLE.HELP.TIPS.TIP9c);

    $('#str_selectarea_title').text(langPack.HTML.TABLE.HELP.AREASELECT.TITLE);

    $('#str_selecttime_title').text(langPack.HTML.TABLE.HELP.TIMESELECT.TITLE);
    $('#str_selecttime_times').html('0 ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR);
    $('#str_selecttime_timee').html('24 ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR);

    $('#str_sumrate_title').text(langPack.HTML.TABLE.HELP.SUMRATE.TITLE);
    $('#btn_change_sumrate').text(langPack.HTML.TABLE.HELP.SUMRATE.BTN);
    $('#sumrate_huma').attr('placeholder', langPack.HTML.TABLE.HUMA + ': ' + val_sumRate.h);
    $('#sumrate_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO + ': ' + val_sumRate.a);
    $('#sumrate_food').attr('placeholder', langPack.HTML.TABLE.FOOD + ': ' + val_sumRate.f);
    $('#sumrate_part').attr('placeholder', langPack.HTML.TABLE.PART + ': ' + val_sumRate.p);

    $('#str_presource_title').text(langPack.HTML.TABLE.HELP.PRESOURCE.TITLE);
    $('#btn_toggle_recovery').text(langPack.HTML.TABLE.HELP.PRESOURCE.REFILL);
    $('#pre_huma').attr('placeholder', langPack.HTML.TABLE.HUMA + ': 0');
    $('#pre_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO + ': 0');
    $('#pre_food').attr('placeholder', langPack.HTML.TABLE.FOOD + ': 0');
    $('#pre_part').attr('placeholder', langPack.HTML.TABLE.PART + ': 0');

    $('#str_success_title').text(langPack.HTML.TABLE.HELP.SUCCESS.TITLE);
    $('#sum_level').attr('placeholder', langPack.HTML.TABLE.HELP.SUCCESS.SUMLEVEL + ': 500');
    $('#per_level').text(langPack.HTML.TABLE.HELP.SUCCESS.SUCSRATIO + ': ' + (val_success * 100).toFixed(1) + '%');
    $('#btn_toggle_sucs').html(langPack.HTML.TABLE.HELP.SUCCESS.BTN);
    $('#btn_toggle_sucs_event').text(langPack.HTML.TABLE.HELP.SUCCESS.EVENTBTN);
    $('#btn_toggle_sucs_event').attr('title', langPack.HTML.TABLE.HELP.SUCCESS.EVENT);

    $('#str_interval_title').text(langPack.HTML.TABLE.HELP.INTERVAL.TITLE);
    $('#btn_toggle_interval').html(langPack.HTML.TABLE.HELP.INTERVAL.BTN);

    $('#str_rcmd_title').text(langPack.HTML.TABLE.HELP.RECOMMEND.TITLE);
    $('#str_rcmd_myratio').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.BTN_RATIO);
    $('#str_rcmd_day_title').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TITLE);
    $('#str_rcmd_day_text').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TEXT);
    $('#str_rcmd_day_table1').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLE1);
    $('#str_rcmd_day_table1_huma').text(langPack.HTML.TABLE.HUMA);
    $('#str_rcmd_day_table1_ammo').text(langPack.HTML.TABLE.AMMO);
    $('#str_rcmd_day_table1_food').text(langPack.HTML.TABLE.FOOD);
    $('#str_rcmd_day_table1_part').text(langPack.HTML.TABLE.PART);
    $('#str_rcmd_day_table2').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLE2);
    $('#str_rcmd_day_table3').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLE3);
    $('#str_rcmd_day_table4').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLE4);
    $('#str_rcmd_day_table5').html(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLE5);
    $('#str_rcmd_day_table6').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLE6);
    $('#use_huma').attr('placeholder', langPack.HTML.TABLE.HUMA);
    $('#use_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO);
    $('#use_food').attr('placeholder', langPack.HTML.TABLE.FOOD);
    $('#use_part').attr('placeholder', langPack.HTML.TABLE.PART);
    $('#btn_calcUse').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.BTN_CALC);
    $('#str_rcmd_ratio_text').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CALC_TEXT);

    $('#str_rcmd_uses_title').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TITLE);
    $('#str_rcmd_uses_text').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TEXT);
    $('#str_rcmd_uses_table1').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLE1);
    $('#str_rcmd_uses_table1_huma').text(langPack.HTML.TABLE.HUMA);
    $('#str_rcmd_uses_table1_ammo').text(langPack.HTML.TABLE.AMMO);
    $('#str_rcmd_uses_table1_food').text(langPack.HTML.TABLE.FOOD);
    $('#str_rcmd_uses_table1_part').text(langPack.HTML.TABLE.PART);
    $('#str_rcmd_uses_table2').html(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLE2);
    $('#str_rcmd_uses_table3').html(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLE3);
    $('#str_rcmd_uses_table4').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLE4);
    $('#str_rcmd_uses_table5').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLE5);
    $('#pre2_huma').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1 + langPack.HTML.TABLE.HUMA);
    $('#pre2_ammo').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1 + langPack.HTML.TABLE.AMMO);
    $('#pre2_food').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1 + langPack.HTML.TABLE.FOOD);
    $('#pre2_part').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1 + langPack.HTML.TABLE.PART);
    $('#fin_huma').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2 + langPack.HTML.TABLE.HUMA);
    $('#fin_ammo').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2 + langPack.HTML.TABLE.AMMO);
    $('#fin_food').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2 + langPack.HTML.TABLE.FOOD);
    $('#fin_part').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2 + langPack.HTML.TABLE.PART);
    $('#btn_calcUse2').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.BTN_CALC);
    $('#str_rcmd_ratio_text2').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CALC_TEXT);

    $('#wgt_huma').attr('placeholder', langPack.HTML.TABLE.HUMA + ':1');
    $('#wgt_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO + ':1.5');
    $('#wgt_food').attr('placeholder', langPack.HTML.TABLE.FOOD + ':1.5');
    $('#wgt_part').attr('placeholder', langPack.HTML.TABLE.PART + ':0.6');

    $('#str_rcmd_sucsratio').text(langPack.HTML.TABLE.HELP.RECOMMEND.SUCSRATIO);
    $('#auto_calc').text(langPack.HTML.TABLE.HELP.RECOMMEND.BTN_RCMD);
    $('#str_rcmd_result').text(langPack.HTML.TABLE.HELP.RECOMMEND.RESULT);
    $('#btn-tglT0').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + '0' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT1').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + '0' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT2').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + '0' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT3').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + '0' + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);

    $('#str_chart_area').text(langPack.HTML.CHART.AREA);
    $('#str_chart_time').text(langPack.HTML.CHART.TIME);
    $('#str_chart_btn1').text(langPack.HTML.CHART.BTN1);
    $('#str_chart_btn2').text(langPack.HTML.CHART.BTN2);
    $('#str_chart_btn3').text(langPack.HTML.CHART.BTN3);
    $('#str_chart_btn4').text(langPack.HTML.CHART.BTN4);

    $('#str_modal_load_title').text(langPack.HTML.MODAL.LOAD.TITLE);
    $('#str_modal_load_area').text(langPack.HTML.MODAL.LOAD.AREA);
    $('#str_modal_load_desc').text(langPack.HTML.MODAL.LOAD.HELP);

    $('#str_bottom_addr').text(langPack.HTML.BOTTOM.ADDR);
    $('#str_bottom_sgst').text(langPack.HTML.BOTTOM.SGST);
    $('#str_bottom_opti').text(langPack.HTML.BOTTOM.OPTI);

    refresh();
}

function disp_summary(){
    for(var t = 0; t < menuToggle.length; t++){
        if(menuToggle[t] == 1){
            $('#summ_' + t).html("");
            continue;
        }

        var stext = "";
        switch(t){
            case 0:
                var cont = false;
                for(var i = 0; i < areaToggle.length; i++){
                    if(areaToggle[i] == 0){
                        continue;
                    }else{
                        if(i == areaToggle.length - 1){
                            stext += i + ", ";
                        }
                        else if(areaToggle[i+1] == 0){
                            stext += i + ", ";
                            cont = false;
                        }
                        else if(areaToggle[i+1] == 1){
                            if(cont == false){
                                stext += i + "-";
                                cont = true;
                            }
                        }
                    }
                }
                stext = stext.slice(0,-2);
                break;
            case 1:
                stext = timeToggle[time_front] + "-" + timeToggle[time_end] + ' ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR;
                break;
            case 2:
                var ary = new Array();
                ary.push(parseInt(document.getElementById('pre_huma').value));
                ary.push(parseInt(document.getElementById('pre_ammo').value));
                ary.push(parseInt(document.getElementById('pre_food').value));
                ary.push(parseInt(document.getElementById('pre_part').value));

                for(var j in ary){
                    if(isNaN(ary[j])) {
                        ary[j] = 0;
                    }
                    stext += ary[j] +', ';
                }
                stext = stext.slice(0,-2)
                if(sw_recovery) stext += ' + ' + langPack.HTML.TABLE.HELP.PRESOURCE.REFILL;
                break;
            case 3:
                if(sw_sucs){
                    var tmp = calcSuccessRatio();
                    stext = tmp.toFixed(1) + '%';
                }else{
                    stext = '0%';
                }
                break;
            case 4:
                break;
            case 5:
                if(sw_interval){
                    stext = parseInt(val_interval / 60) + ':';
                    if(parseInt(val_interval % 60) == 0){stext += '00';}
                    else{stext += parseInt(val_interval % 60);}

                }else{
                    stext = "0:00";
                }
                break;
            case 6:
                    stext = val_sumRate.h + ':' + val_sumRate.a + ':' + val_sumRate.f + ':' + val_sumRate.p;
                break;
            default:
                break;
        }
        $('#summ_' + t).html(stext);
    }
}

function calcSuccessRatio(){
    var tmp = parseInt(document.getElementById('sum_level').value);
    if(!isNaN(tmp)){
        if (tmp < 0){tmp = 0;}
        else if (tmp > 600){tmp = 600;}
        $('#sum_level').val(tmp);
    }else{tmp = 500;}

    var sucsrate;
    if(!sw_successEvent){
        sucsrate = parseInt((parseInt(tmp / 5) * 0.45) + 15);
        $('#per_level').text(langPack.HTML.TABLE.HELP.SUCCESS.SUCSRATIO + ': ' + sucsrate + '%');
    }else{
        sucsrate = parseInt((parseInt(tmp / 5) * 0.60) + 30);
        $('#per_level').text(langPack.HTML.TABLE.HELP.SUCCESS.SUCSRATIO + ': ' + sucsrate + '%' + ' (+' + (parseInt((parseInt(tmp / 5) * 0.60) + 30) - parseInt((parseInt(tmp / 5) * 0.45) + 15)) + '%)');
    }

    val_success = sucsrate / 100;
    if(val_success > 1){val_success = 1;}

    return sucsrate;
}

function resizeBoxes(){
    var myHeight = 0;
    var myWidth = window.innerWidth;

    if( typeof( window.innerWidth ) == 'number' ) {
        myHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        myHeight = document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        myHeight = document.body.clientHeight;
    }

    if(myWidth < 768){
        //Mobile UI 고정형 bootstrap-xs
        document.getElementById('tbl_mid').style.height = '400px';
        document.getElementById('tbl_cht').style.height = '380px';
        //document.getElementById('tbl_mid').style.height = ((myHeight * 0.60) -125) + 'px';
        //document.getElementById('tbl_cht').style.height = myHeight * 0.40 + 'px';
        sw_drawChart = true;
    }else{
        //Desktop UI 대응형 bootstrap-sm
        document.getElementById('tbl_mid').style.height = '570px';
        document.getElementById('tbl_cht').style.height = '260px';
        //document.getElementById('tbl_mid').style.height = ((myHeight * 0.9) - 100) + 'px';
        //document.getElementById('tbl_cht').style.height = ((myHeight * 0.40) + 0) + 'px';
        sw_drawChart = true;
    }
}

$(window).scroll(function() {
    chkScroll();
});

function chkScroll(){
    var scrollBottom = $(this).scrollTop() + window.innerHeight;

    if(scrollBottom > $('#tbl_cht').offset().top){
        if(sw_drawChart == false){
            sw_drawChart = true;
            drawStage();
        }
    }else{sw_drawChart = false;}
}

function init(){
    //localStorage.removeItem("config");
    var jsonText = '{"ko":{"HTML":{"TITLE":"소녀전선 - 군수지원 효율계산 / 추천 시뮬레이터","TABLE":{"RSRC":"자원","AREA":"지역","HUMA":"인력","AMMO":"탄약","FOOD":"식량","PART":"부품","SUM":"합계","SUMRATIO":"자원 합계비> ","TIME":"시간","BTNSUCS":"성공시<br>획득","BTNTIME":"시간당<br>획득","SELAREA":"선택<br>지역","LOAD":" 불러오기","SAVE":" 저장","COPY":" URL 복사","TIMETABLE":" 시간표","TICKET":"계약서","TICKET_DOLL":"인형제조계약서","TICKET_TOOL":"장비제조계약서","TICKET_FAST":"쾌속제조계약서","TICKET_REPR":"쾌속수복계약서","TICKET_TOKN":"구매 토큰","TICKET_PER_HOUR":"시간당 획득률","TICKET_PER_RECV":"성공시 획득률","PER_HOUR":"시간당","PER_RECV":"성공시","TICKET_RATIO":"획득확률","HELP":{"OPEN":"도움말 열기","CLOSE":"도움말 닫기","TIPS":{"TIP1":"1. 자원량 / 계약서 획득량은 표 좌측 하단의 <span id=\\"help_time\\"><a href=\\"#\\">시간당 / 성공시 획득 전환 버튼</a></span> 으로 변경 가능","TIP2":"2. 표 상단의 <a href=\\"#\\">자원명</a> <font color=\\"red\\">클릭 시</font>, 오름 / 내림차순 정렬","TIP3":"3. 표의 <a href=\\"#\\">합계</a> 값은 <font color=\\"red\\">자원 합계비</font>에 따라 계산. 기본값 1:1:1:2.2","TIP4":"4. 표의 계약서 획득확률은 <a href=\\"https://pan.baidu.com/s/1c3iS9Ks#list/path=/Girls%20Frontline\\" target=\\"_blank\\">철혈시트</a> 기준 추정 <font color=\\"red\\">가중치</font>","TIP5":"5. 하단 예상 그래프는 <a href=\\"#\\">현재자원</a> <font color=\\"red\\">값부터 합산</font>, 미입력시 0부터 계산","TIP5a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#\\">자동회복</a> 활성화 시 3분당 인탄식부 3:3:3:1 회복</div>","TIP6":"6. <a href=\\"#\\">대성공률</a> 적용 시, 자원 및 계약서 획득률을 대성공 기대치로 재계산","TIP7":"7. <a href=\\"#\\">확인주기</a> 적용 시, 모든 군수의 시간을 주기의 배수로 변경","TIP8":"8. <div class=\\"btn btn-danger\\"></div><div class=\\"btn btn-primary\\"></div> 기능/선택 버튼, <div class=\\"btn btn-default\\"></div><div class=\\"btn btn-success\\"></div> 켜기/끄기 버튼","TIP9":"9. <a href=\\"#\\">자동추천</a> 은 입력된 <font color=\\"red\\">가중치 비율의 자원 획득</font>을 위한 군수 조합 추천","TIP9a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#\\">지역선택</a>, <a href=\\"#\\">시간대설정</a>, <a href=\\"#\\">대성공률</a>, <a href=\\"#\\">계약서 획득률</a>, <a href=\\"#\\">확인 주기</a>를 모두 반영</div>","TIP9b":"<div style=\\"margin-left:10px;\\">b. <span id=\\"help_wght\\"><a href=\\"#\\">내 가중치</a></span> 버튼 클릭 시, 개인 가중치 계산 가능</div>","TIP9c":"<div style=\\"margin-left:10px;\\">c. 추천조합의 백분율 표시는 입력된 가중치와 결과값 사이의 가중치 일치율을 의미</div>"},"AREASELECT":{"TITLE":"지역선택"},"TIMESELECT":{"TITLE":"시간대","SELTIMEHOUR":"시간"},"SUMRATE":{"TITLE":"자원 합계비","BTN":"적용"},"PRESOURCE":{"TITLE":"현재자원","REFILL":"자동회복"},"SUCCESS":{"TITLE":"대성공","SUMLEVEL":"제대 레벨합계","SUCSRATIO":"대성공 확률","BTN":"적용","EVENT":"군수지원 대성공 확률 UP 이벤트","EVENTBTN":"확률UP"},"INTERVAL":{"TITLE":"확인주기","BTN":"적용"},"RECOMMEND":{"TITLE":"자동추천","RATIO":{"BTN_RATIO":"내 가중치","CHOICE":{"DAY":{"TITLE":"일일사용량 기반 계산","TEXT":"하루에 사용하는 자원량에 의거한 개인 가중치 계산","TABLE1":"일일사용량 기반 계산 예","TABLE2":"인형제조 범용1식 4회","TABLE3":"장비제조 범용1식 4회","TABLE4":"전역 9회 클리어","TABLE5":"합계 <small>(아래 입력)</small>","TABLE6":"가중치"},"USES":{"TITLE":"최종목표치 기반 계산","TEXT":"목표로 삼은 자원량에서 역산한 개인 가중치 계산","TABLE1":"최종목표량 기반 계산 예","TABLE2":"현재 자원량 <small>(아래 입력)</small>","TABLE3":"목표 자원량 <small>(아래 입력)</small>","TABLE4":"오차","TABLE5":"가중치","TABLEs1":"현재","TABLEs2":"목표"}},"BTN_CALC":"계산","CALC_TEXT":"\'계산\'클릭 시, 가중치 자동입력"},"SUCSRATIO":"계약서 확률","TEXT_PERHOUR1":"시간당 ","TEXT_PERHOUR2":"개 이상","BTN_RCMD":"지역 추천","RESULT":"추천조합","SIMM":"가중치 일치율"}}},"CHART":{"AREA":"지역:","TIME":"기간:","BTN1":"1일","BTN2":"1주","BTN3":"2주","BTN4":"4주","DAY":"일","HOUR":"시","MIN":"분"},"MODAL":{"LOAD":{"TITLE":"저장된 조합 불러오기","AREA":"지역","HELP":"설명"}},"BOTTOM":{"ADDR":"주소: ","SGST":"건의사항: ","OPTI":"이 페이지는 Chrome, FF, Edge에 최적화되어 있습니다."},"INCODE":{"ALERT1":"최종목표치는 현재보다 크거나 같아야 합니다","ALERT2":"검색 결과가 없습니다","ALERT3":"하나 이상의 군수지역을 선택해야 합니다","ALERT4":"주소가 클립보드에 복사되었습니다","SAVE":"저장할 조합의 이름을 입력하세요","DELETE":"지우기"}}},"en":{"HTML":{"TITLE":"Girls\' Frontline Logistic Support Calculator","TABLE":{"RSRC":"Resource","AREA":"Mission","HUMA":"Manpw.","AMMO":"Ammo","FOOD":"Rations","PART":"Parts","SUM":"Total","SUMRATIO":"Total Sumrate> ","TIME":"Time","BTNSUCS":"Per<br>Mission","BTNTIME":"Per<br>Hour","SELAREA":"Selected<br>Mission","LOAD":" Load","SAVE":" Save","COPY":" Copy URL","TIMETABLE":" Agenda","TICKET":"Contracts","TICKET_DOLL":"T-Doll Contract","TICKET_TOOL":"Equipment Production Contract","TICKET_FAST":"Quick Production Contract","TICKET_REPR":"Quick Restoration Contract","TICKET_TOKN":"Token","TICKET_PER_HOUR":"Chance per hour","TICKET_PER_RECV":"Chance per mission","PER_HOUR":"perHour","PER_RECV":"perMission","TICKET_RATIO":"Chance","HELP":{"OPEN":"Open Help","CLOSE":"Close Help","TIPS":{"TIP1":"1. Toggle \'Resource & Contract gain per HOUR or MISSION\' with <span id=\\"help_time\\"><a href=\\"#toggleTime\\">Button left-bottom of the table</a></span>","TIP2":"2. When you click <a href=\\"#\\">Resource Name</a>, ASC / DESC Sort","TIP3":"3. <a href=\\"#\\">Total</a> calculated with <font color=\\"red\\">Total Sumrate</font> multiplier. Default 1:1:1:2.2","TIP4":"4. Contract Gain Chance reference: <a href=\\"https://pan.baidu.com/s/1c3iS9Ks#list/path=/Girls%20Frontline\\" target=\\"_blank\\">Sangvis Ferri Sheet</a> <font color=\\"red\\">(Assumption)</font>","TIP5":"5. Graph starts from <a href=\\"#\\">Pre Resources</a> <font color=\\"red\\"></font>, default is 0","TIP5a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#\\">Auto Resupply</a> add 3 : 3 : 3 : 1 resource per 3 min</div>","TIP6":"6. When you apply <a href=\\"#\\">Great Success</a>, recaluculate resource & contracts gain to expectation value","TIP7":"7. When you apply <a href=\\"#\\">Check Cycle</a>, recalculate every time to multiple of cycle time","TIP8":"8. <div class=\\"btn btn-danger\\"></div><div class=\\"btn btn-primary\\"></div> Function / Select Button, <div class=\\"btn btn-default\\"></div><div class=\\"btn btn-success\\"></div> On / Off Toggle Button","TIP9":"9. <a href=\\"#\\">Recommend</a> provides mission combination with <font color=\\"red\\">Resource Weight</font>","TIP9a":"<div style=\\"margin-left:10px;\\">a. Reflect <a href=\\"#\\">Chapters</a>, <a href=\\"#\\">Time Periods</a>, <a href=\\"#\\">Great Success</a>, <a href=\\"#\\">Contract Chance</a>, <a href=\\"#\\">Check Cycle</a></div>","TIP9b":"<div style=\\"margin-left:10px;\\">b. Calculate personal resource weights with <span id=\\"help_wght\\"><a href=\\"#\\">Calc weights</a></span> </div>","TIP9c":"<div style=\\"margin-left:10px;\\">c. Result % means similarity between input ratio & result</div>"},"AREASELECT":{"TITLE":"Chapters"},"TIMESELECT":{"TITLE":"Time Periods","SELTIMEHOUR":"hour"},"SUMRATE":{"TITLE":"Total Sumrate","BTN":"Apply"},"PRESOURCE":{"TITLE":"Pre Resources","REFILL":"Auto Resupply"},"SUCCESS":{"TITLE":"Great Success","SUMLEVEL":"Echelon\'s levelsum","SUCSRATIO":"GS Chance","BTN":"Apply","EVENT":"Great Success rate-up event","EVENTBTN":"Rate-UP"},"INTERVAL":{"TITLE":"Check Cycle","BTN":"Apply"},"RECOMMEND":{"TITLE":"Recommend","RATIO":{"BTN_RATIO":"Calc weights","CHOICE":{"DAY":{"TITLE":"Daily Weight","TEXT":"Calculate with daily uses","TABLE1":"Example","TABLE2":"T-DOLL Standard Set x 4","TABLE3":"Equipment Standard Set x 4","TABLE4":"Clear 9 Areas","TABLE5":"Sum <small>(input below)</small>","TABLE6":"Weight"},"USES":{"TITLE":"Target Weight","TEXT":"Calculate with target amount","TABLE1":"Example","TABLE2":"Present Resource <small>(input below)</small>","TABLE3":"Goal Resource <small>(input below)</small>","TABLE4":"Difference","TABLE5":"Weight","TABLEs1":"Pre","TABLEs2":"Obj"}},"BTN_CALC":"Calculate","CALC_TEXT":"Click \'Calculate\' to get your own weight"},"SUCSRATIO":"Contracts","TEXT_PERHOUR1":"Over ","TEXT_PERHOUR2":"/h","BTN_RCMD":"Recommend Combination","RESULT":"Results","SIMM":"Weight Similarity"}}},"CHART":{"AREA":"Area:","TIME":"Period:","BTN1":"1D","BTN2":"1W","BTN3":"2W","BTN4":"4W","DAY":"","HOUR":"","MIN":""},"MODAL":{"LOAD":{"TITLE":"Load saved missions","AREA":"Missions","HELP":"Description"}},"BOTTOM":{"ADDR":"Address: ","SGST":"Suggestions: ","OPTI":"This website is optimized for Chrome, FF, Edge"},"INCODE":{"ALERT1":"Goal must bigger than present","ALERT2":"No result","ALERT3":"You muse select at least one mission","ALERT4":"URL copied to clipboard","SAVE":"Name your save","DELETE":"Delete"}}},"ja":{"HTML":{"TITLE":"ドールフロ - 後方支援 効率計算 / 推選 シミュレータ","TABLE":{"RSRC":"資源","AREA":"戦役","HUMA":"人力","AMMO":"弾薬","FOOD":"配給","PART":"パーツ","SUM":"合算","SUMRATIO":"合算レート> ","TIME":"時間","BTNSUCS":"成功時<br>獲得","BTNTIME":"時間当たり<br>獲得","SELAREA":"選択<br>戦役","LOAD":" ロード","SAVE":" セーブ","COPY":" URL 複写","TIMETABLE":" タイムテーブル","TICKET":"契約","TICKET_DOLL":"人形製造契約","TICKET_TOOL":"装備製造契約","TICKET_FAST":"快速製造契約","TICKET_REPR":"快速修復契約","TICKET_TOKN":"購買トークン","TICKET_PER_HOUR":"時間当たり獲得率","TICKET_PER_RECV":"成功時獲得率","PER_HOUR":"時間当たり","PER_RECV":"成功時","TICKET_RATIO":"獲得率","HELP":{"OPEN":"ヘルプを開く","CLOSE":"ヘルプを閉じる","TIPS":{"TIP1":"1. 資源量 / 契約獲得量は表左側下段の <span id=\\"help_time\\"><a href=\\"#toggleTime\\">時間当たり / 成功時獲得転換ボタン</a></span> で転換可能","TIP2":"2. 表上段の <a href=\\"#\\">資源</a> <font color=\\"red\\">クリック時</font>, 昇順 / 降順整列","TIP3":"3. 表の <a href=\\"#\\">合計</a> は資源比 <font color=\\"red\\">合算レート</font>で計算. デフォルトち 1:1:1:2.2","TIP4":"4. 表の契約獲得率は <a href=\\"https://pan.baidu.com/s/1c3iS9Ks#list/path=/Girls Frontline\\" target=\\"_blank\\">鉄血シート</a> 基準推定 <font color=\\"red\\">重み付け</font>","TIP5":"5. 下段予想グラフは <a href=\\"#\\">現在資源</a> <font color=\\"red\\">量から合算</font>, 入力なしと０から計算","TIP5a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#\\">自動回復</a> 活性化時3分当たり人弾配パ3:3:3:1回復</div>","TIP6":"6. <a href=\\"#\\">大成功率</a> 適用時資源及び契約獲得率は大成功期待値で再計算","TIP7":"7. <a href=\\"#\\">確認サイクル</a> 適用時全後方支援の時間を確認サイクルの倍数で再計算","TIP8":"8. <div class=\\"btn btn-danger\\"></div><div class=\\"btn btn-primary\\"></div> 機能/選択ボタン, <div class=\\"btn btn-default\\"></div><div class=\\"btn btn-success\\"></div> オン・オフボタン","TIP9":"9. <a href=\\"#\\">自動推選</a> は入力された <font color=\\"red\\">重み付け比率の資源獲得</font>ための配置推選","TIP9a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#\\">戦役選択</a>, <a href=\\"#\\">時間帯設定</a>, <a href=\\"#\\">大成功率</a>, <a href=\\"#\\">契約獲得率</a>, <a href=\\"#\\">確認サイクル</a> 全て反映</div>","TIP9b":"<div style=\\"margin-left:10px;\\">b. <span id=\\"help_wght\\"><a href=\\"#\\">私の重み付け</a></span> ボタンクリック時、個人重み付け計算可能</div>","TIP9c":"<div style=\\"margin-left:10px;\\">c. 推選配置の百分率表しは入力された重み付けと結果値あいだの重み付け一致率を意味します。</div>"},"AREASELECT":{"TITLE":"戦役選択"},"TIMESELECT":{"TITLE":"時間帯設定","SELTIMEHOUR":"時間"},"SUMRATE":{"TITLE":"合算レート","BTN":"適用"},"PRESOURCE":{"TITLE":"現在資源","REFILL":"自動回復"},"SUCCESS":{"TITLE":"大成功率","SUMLEVEL":"梯隊レベル合計","SUCSRATIO":"大成功率","BTN":"適用","EVENT":"後方支援大成功確率UP","EVENTBTN":"確率UP"},"INTERVAL":{"TITLE":"確認サイクル","BTN":"適用"},"RECOMMEND":{"TITLE":"自動推選","RATIO":{"BTN_RATIO":"私の重み付け","CHOICE":{"DAY":{"TITLE":"一日使用量で計算","TEXT":"一日に使用する資源量を基盤とする個人重み付け計算","TABLE1":"一日使用量で計算例","TABLE2":"人形製造汎用式4回","TABLE3":"装備製造汎用式4回","TABLE4":"戦役9回クリア","TABLE5":"合計 <small>(下に入力)</small>","TABLE6":"重み付け"},"USES":{"TITLE":"最終目標値で計算","TEXT":"目標とした資源量から逆算した個人重み付け計算","TABLE1":"最終目標値で計算例","TABLE2":"現在資源量 <small>(下に入力)</small>","TABLE3":"目標資源量 <small>(下に入力)</small>","TABLE4":"誤差","TABLE5":"重み付け","TABLEs1":"現在","TABLEs2":"目標"}},"BTN_CALC":"計算","CALC_TEXT":"\'計算\'クリック時、重み付け自動入力"},"SUCSRATIO":"獲得率","TEXT_PERHOUR1":"時間当たり","TEXT_PERHOUR2":"個以上","BTN_RCMD":"戦役推選","RESULT":"推選結果","SIMM":"重み付け一致率"}}},"CHART":{"AREA":"戦役:","TIME":"期間:","BTN1":"1日","BTN2":"1週","BTN3":"2週","BTN4":"4週","DAY":"日","HOUR":"時","MIN":"分"},"MODAL":{"LOAD":{"TITLE":"セーブされた配置ロード","AREA":"戦役","HELP":"ヘルプ"}},"BOTTOM":{"ADDR":"アドレス: ","SGST":"建議事項: ","OPTI":"このページは Chrome、FF、Edgeに最適化されています。"},"INCODE":{"ALERT1":"最終目標値は現在より大きいか同じでなければなりません。","ALERT2":"検索結果が有りません。","ALERT3":"一つ以上の支援を選択してください。","ALERT4":"クリップボードにURLを複写しました。","SAVE":"セーブする配置の名前を入力してください。","DELETE":"デリート"}}}}';
    langPacks = JSON.parse(jsonText);

    config = localStorage.config;

    function getLanguage() {
        var tmp = navigator.language || navigator.userLanguage;

        switch(tmp){
            case 'ko':
            case 'ko-KR':
                return 'ko';
            case 'ja':
            case 'ja-JP':
                return 'ja';
            case 'en':
            case 'en-US':
            case 'en-GB':
            case 'en-CA':
                return 'en';
            default:
                return 'en';
        }
    }

    if(config === undefined){         //no config cache
        config = new Object();
        config.time = true;
        config.help = true;
        config.version = version;
        config.menu = menuToggle;
        config.sumrate = val_sumRate;
        localStorage.config = JSON.stringify(config);

        selLang = getLanguage;
    }else{                      //config cache here
        config = JSON.parse(localStorage.config);

        if(config.time !==undefined){
            sw_time = config.time;
        }
        if(config.help !==undefined){
            sw_help = config.help;
        }
        if(config.lang !==undefined){
            selLang = config.lang;
        }else{
            selLang = getLanguage();
        }
        if(config.menu !==undefined){
            menuToggle = config.menu;
        }
        if((config.version === undefined) || (config.version < version)){
            alert(updateString);
            config.version = version;
            localStorage.config = JSON.stringify(config);
        }
        if(config.sumrate !==undefined){
            val_sumRate = config.sumrate;
        }
    }

    $('#selectLang').val(selLang).change();

    if(sw_help){
        $('#panel-help').removeClass('hide');
        $('#str_toggleHelp').text(langPack.HTML.TABLE.HELP.CLOSE);
    }
    else{
        $('#panel-help').addClass('hide');
        $('#str_toggleHelp').text(langPack.HTML.TABLE.HELP.OPEN);
    }

    for(var i in menuToggle){
        if(menuToggle[i] == 1){    // opened
            $('#menu_' + i + '_tr1').removeClass('hide');
            $('#menu_' + i + '_tr2').removeClass('hide');
            $('#menu_' + i + '_tr3').removeClass('hide');
        }else{                                      // closed
            $('#menu_' + i + '_tr1').addClass('hide');
            $('#menu_' + i + '_tr2').addClass('hide');
            $('#menu_' + i + '_tr3').addClass('hide');
        }
    }

    loadSaves();

    document.getElementById("pre_huma").addEventListener("change",function(){highlight(5);calcStage();});
    document.getElementById("pre_ammo").addEventListener("change",function(){highlight(5);calcStage();});
    document.getElementById("pre_food").addEventListener("change",function(){highlight(5);calcStage();});
    document.getElementById("pre_part").addEventListener("change",function(){highlight(5);calcStage();});

    document.getElementById("sum_level").addEventListener("input",function(){
        //calcSuccessRatio();
        if($('#btn_toggle_sucs').hasClass('btn-success')){
            $('#btn_toggle_sucs').trigger('click');
            $('#btn_toggle_sucs').trigger('click');
        }else{
            $('#btn_toggle_sucs').trigger('click');
        }
    });

    var date = version + "";
    date = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8) + " " + date.substring(8,10) + ":" + date.substring(10,12);
    $('#lastUpdate').text(date);

    $('#loadModal').modal("hide");
}
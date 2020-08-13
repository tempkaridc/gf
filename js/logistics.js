var lastUpdate      = '2020-08-13 17:00'
var version         = parseInt(lastUpdate.replace(/[^0-9]/g,''));

var updateDate      = 'Changelog (' + lastUpdate + ')';

var updateString    =   '13-4 Vector Simulator'
                    +   '<br> > Guide update: Remove formation recommendation'
                    ;

var updateImage     = false;

var selLang         = 'ko';
var langPacks;
var langPack;

var objectList      = new Array();
var selectedList    = new Array();
var sync_calcList   = new Array();

//var sortToggle      = [0,0,0,0,0,0,0,0,0,0,0,0];            // 0:none 1:asc 2:desc //지역, 인탄식부, 합계, 시간, 계약서5종 = 12
var areaToggle      = [1,1,1,1,1,1,1,1,1,1,1,1,1,1];        // [14] 0 ~ 13지역
var wghtToggle      = [0,0,0,0];                            // 계약서 4종 가중치 0 ~ 1.0
var timeToggle      = [0,1,2,3,4,5,6,7,8,9,10,12,24];       // [13]
var menuToggle      = [0,0,0,0,1,0,0];                      // 메뉴 토글기능 7개, (도움말 제외)

var time_front      = 0;                                    // Head
var time_end        = timeToggle.length - 1;                // Tail 시간쌍

var sw_sucs         = false;        // 대성공 적용여부
var sw_recovery     = false;        // 자원회복 적용여부
var sw_zero         = true;         // 자원량 0 표기여부
var sw_time         = true;         // 표 자원 시간당 표기 적용여부
var sw_help         = false;        // 도움말 보기 적용여부
var sw_drawChart    = true;         // 차트 드로잉 갱신여부
var sw_drawReserved = false;        // 차트 드로잉 예약여부
var sw_interval     = false;        // 확인 주기 적용여부
var sw_successEvent = false;        // 군수확업 이벤트 트리거

var val_success     = 0.6;          // 대성공 초기성공률 60%
var val_interval    = 30;           // 확인 주기 초기값 30분
var val_sumRate     = new Object(); // 합계 자원비
    val_sumRate.h   = 1;
    val_sumRate.a   = 1;
    val_sumRate.f   = 1;
    val_sumRate.p   = 2.2;

var val_sumItem     = new Object(); // 합계 아이템

var urlParams       = new URLSearchParams(window.location.search);
var myParam         = urlParams.get('c');

var drawTimer;

var chart;
var chart_time      = new Array();
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

function btn_removeItem(elem){
    clickRow(parseInt($(elem).attr('idx')));
}

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
    if(id == 99){                               // 계약서 첫줄 지역소팅으로 대체
        id = 0;
        //sortToggle[0] = 2;                    ***** 190123 이후 일괄 desc로 폐기. ******
    }

    if(0 < id){
        highlight(2);                           // 코드 순서때문에 어쩔수없이 정렬 펑션부분은 하드코딩
        if(id == 5){
            $('#high_03').addClass('success');
        }
        if((7 <= id) && (id <= 11)){
            $('#high_04').addClass('success');
        }
    }

    if((id == 0) || (id == 6)){ //지역 & 시간은 asc로 sorting
        sortTable(document.getElementById("area-list"), id, 1);
    }else{
        sortTable(document.getElementById("area-list"), id, 0);
    }

    /*
    if(sortToggle[id] <= 1){
        sortTable(document.getElementById("area-list"), id, 0);
        sortToggle[id] = 2;
    }else{
        sortTable(document.getElementById("area-list"), id, 1);
        sortToggle[id] = 1;
    }
    */
}
function btn_selArea(id){
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
}
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

function btn_notice(){
    $('#str_notice_head').html(updateDate);
    $('#str_notice').html(updateString);
    if(updateImage == true){$('#pic_notice').removeClass('hide');}else{$('#pic_notice').addClass('hide');}
    $('#noticeModal').modal("show");
}

function btn_reset(){
    alert(langPack.HTML.INCODE.ALERT5);
    localStorage.removeItem('config');
    window.location.reload();
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
    $('#feedbackLine').addClass('hide');
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
    $('#feedbackLine').addClass('hide');
    $('#tbl_cht').empty();
});
$('[id^=btn-tglT]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));
    var btn = document.getElementById('btn-tglT' + id);

    if(wghtToggle[id] == 1) {
        wghtToggle[id] = 0;
        btn.style.backgroundColor = '#fff0';
        btn.style.borderColor = '#ccc';
    }else{
        wghtToggle[id] = parseFloat((wghtToggle[id] + 0.1).toFixed(1));
        btn.style.backgroundColor = '#5cb85c' + (wghtToggle[id] * 10).toString(16) + '0' ;
        btn.style.borderColor = '#398439' + (wghtToggle[id] * 10).toString(16) + '0' ;
    }

    $('#label-tglT' + id).text(wghtToggle[id] + '　≤');
    $('#btn-tglT' + id).attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[id] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2); // 시간당 0 개 이상

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
$('[id^=btn-fdb]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));

    var usedRes = new Object();
    usedRes.h = parseFloat(document.getElementById('wgt_huma').value);
    usedRes.a = parseFloat(document.getElementById('wgt_ammo').value);
    usedRes.f = parseFloat(document.getElementById('wgt_food').value);
    usedRes.p = parseFloat(document.getElementById('wgt_part').value);
    if(isNaN(usedRes.h)) usedRes.h = 1;
    if(isNaN(usedRes.a)) usedRes.a = 1.5;
    if(isNaN(usedRes.f)) usedRes.f = 1.5;
    if(isNaN(usedRes.p)) usedRes.p = 0.6;

    switch(id){
        case 0:
            $('#wgt_huma').val(parseFloat(usedRes.h + 0.1).toFixed(1));
            break;
        case 1:
            $('#wgt_ammo').val(parseFloat(usedRes.a + 0.1).toFixed(1));
            break;
        case 2:
            $('#wgt_food').val(parseFloat(usedRes.f + 0.1).toFixed(1));
            break;
        case 3:
            $('#wgt_part').val(parseFloat(usedRes.p + 0.1).toFixed(1));
            break;
        default:
            break;
    }

    $('#auto_calc').trigger('click');

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
    auto_calculation();
});

function auto_calculation(){
    var originalList;
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
            (tt4 >= wghtToggle[3])  ){
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
                    $('#feedbackLine').addClass('hide');
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
    $('#feedbackLine').removeClass('hide');

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
}

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

function captureImage(){
    document.querySelector('#tbl_btn').setAttribute('data-html2canvas-ignore', ''); //Pure JS
    document.getElementById('tbl_mid').style.height = null;

    html2canvas(document.querySelector("#tbl_left")).then(canvas => {
        document.querySelector('#tbl_btn').removeAttribute('data-html2canvas-ignore', ''); //Pure JS
        document.getElementById('tbl_mid').style.height = config.scr.mid;

        var link = document.createElement('a');

        var name = "L";
        for(var i in selectedList){name += '_' + parseInt(selectedList[i] / 4) + parseInt((selectedList[i] % 4) + 1);}

        if (typeof link.download === 'string'){
            link.href = canvas.toDataURL();
            link.download = name + '.png';

            //Firefox requires the link to be in the body
            document.body.appendChild(link);

            //simulate click
            link.click();

            //remove the link when done
            document.body.removeChild(link);
        }
        else{
            window.open(uri);
        }
    });
}

$('#btn-capt').off().on('click', function (e) {
    captureImage();
});

$('#btn-url').off().on('click', function (e) {
    var absSelect = new Array();
    for(var i in selectedList){absSelect.push(((objectList[parseInt(selectedList[i])].Area * 4) + (objectList[parseInt(selectedList[i])].Stage - 1)));}
    absSelect.sort(sortFunctionPlane);
    var encodedString = encodeHEX(absSelect);
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    //t.value = 'https://tempkaridc.github.io/gf/index.html?c=' + encodedString; // + '\n' + cptStr; // cptStr
    t.value = cptStr + ' https://tempkaridc.github.io/gf/index.html?c=' + encodedString; // + '\n' + cptStr; // cptStr
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
    window.open('agenda.html?c=' + coded, '_blank');
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
        document.querySelector(rowName).setAttribute('data-html2canvas-ignore',''); //Pure JS
        for(i in selectedList){
            if(selectedList[i] == index){
                selectedList.splice(i, 1);
                break;
            }
        }
    }else{
        $(rowName).addClass('success');
        document.querySelector(rowName).removeAttribute('data-html2canvas-ignore',''); //Pure JS
        selectedList.push(index);

        //selectedList.sort(function(a, b){return parseInt(a) - parseInt(b)});
        //지울때 큐순서로 지워지게 하는 기능 보완 없으면 못바꿔!
        if(selectedList.length > 4){ //Stack Full
            $('#table-row-' + selectedList[0]).removeClass('success');
            document.querySelector('#table-row-' + selectedList[0]).setAttribute('data-html2canvas-ignore',''); //Pure JS
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
    var sumT = "", sumItem = "", sumTime = "", sumThtml = "";
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
        sumThtml += '<div class="btn btn-xs btn-default col-xs-6" idx="' + selectedList[i] + '" onClick="btn_removeItem(this);">' + objectList[selectedList[i]].Area + '-' + objectList[selectedList[i]].Stage + '</div>';
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
    $('#sumT').html(sumThtml);

    var timeTitle = langPack.HTML.TABLE.TICKET_PER_HOUR;
    var displayH = '/h';
    if(!sw_time){
        timeTitle = langPack.HTML.TABLE.TICKET_PER_RECV;
        displayH = ''
    }

    if(val_sumItem.d){
        sumItem += '<div class="table-ticket-box-result" title="' + timeTitle +'" style="background-image: url(\'img/doll.png\');">';
        sumItem += '<span class="table-ticket-outline-result">' + (sw_time ? (val_sumItem.dt).toFixed(2) : (val_sumItem.d).toFixed(2)) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.t){
        sumItem += '<div class="table-ticket-box-result" title="' + timeTitle +'" style="background-image: url(\'img/tool.png\');">';
        sumItem += '<span class="table-ticket-outline-result">' + (sw_time ? (val_sumItem.tt).toFixed(2) : (val_sumItem.t).toFixed(2)) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.f){
        sumItem += '<div class="table-ticket-box-result" title="' + timeTitle +'" style="background-image: url(\'img/fast.png\');">';
        sumItem += '<span class="table-ticket-outline-result">' + (sw_time ? (val_sumItem.ft).toFixed(2) : (val_sumItem.f).toFixed(2)) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.r) {
        sumItem += '<div class="table-ticket-box-result" title="' + timeTitle +'" style="background-image: url(\'img/repr.png\');">';
        sumItem += '<span class="table-ticket-outline-result">' + (sw_time ? (val_sumItem.rt).toFixed(2) : (val_sumItem.r).toFixed(2)) + displayH + '</span>';
        sumItem += '</div>';
    }
    if(val_sumItem.k){
        sumItem += '<div class="table-ticket-box-result" title="' + timeTitle +'" style="background-image: url(\'img/tokn.png\');">';
        sumItem += '<span class="table-ticket-outline-result">' + (sw_time ? (val_sumItem.kt).toFixed(2) : (val_sumItem.k).toFixed(2)) + displayH + '</span>';
        sumItem += '</div>';
    }

    $('#sumItem').empty();
    $('#sumItem').append(sumItem);



    var orTime = langPack.HTML.TABLE.PER_RECV;
    if(sw_time){
        orTime = langPack.HTML.TABLE.PER_HOUR;
    }

    //cptStr = langPack.HTML.TABLE.AREA + ': ' + sumT.slice(0,-2);// + '　\n';
    cptStr = sumT.slice(0,-2);// + '　\n';


    /* 클립보드 간략화
    ****************
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
    */


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
        if((sw_recovery) && (i == 0)){ //한번만 실행되야지?
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
            valueDecimals: 0,
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
        var td14 = '<td class="table-expand-mobile" style="text-align: center; vertical-align:middle;" width="14%">';
        var td20 = '<td style="text-align: center; vertical-align:middle;" width="20%">';
        var tde = '</td>';
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" onClick="click_table_main(this)"; style="height:2em;" data-html2canvas-ignore>';
        /*00*/item += td14 + objectList[i].Area + '-' + objectList[i].Stage + tde;
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
        /*12*/item += td20 + '<div style="width:100%;">';
                if(objectList[i].Ticket_makeDoll){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_makeDoll * 100 / perMin).toFixed(2) + '%" style="background-image: url(\'img/doll.png\');">';
                    item += '<span class="table-ticket-outline-result">' + (objectList[i].Ticket_makeDoll / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_makeTool){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_makeTool * 100 / perMin).toFixed(2) + '%" style="background-image: url(\'img/tool.png\');">';
                    item += '<span class="table-ticket-outline-result">' + (objectList[i].Ticket_makeTool / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_fastMake){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_fastMake * 100 / perMin).toFixed(2) + '%" style="background-image: url(\'img/fast.png\');">';
                    item += '<span class="table-ticket-outline-result">' + (objectList[i].Ticket_fastMake / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_fastRepair){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_fastRepair * 100 / perMin).toFixed(2) + '%" style="background-image: url(\'img/repr.png\');">';
                    item += '<span class="table-ticket-outline-result">' + (objectList[i].Ticket_fastRepair / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                if(objectList[i].Ticket_Tokken){
                    item += '<div class="table-ticket-box" title="' + byTime + ': ' + (objectList[i].Ticket_Tokken * 100 / perMin).toFixed(2) + '%" style="background-image: url(\'img/tokn.png\');">';
                    item += '<span class="table-ticket-outline-result">' + (objectList[i].Ticket_Tokken / perMin).toFixed(2) + byTimeShort + '</span>';
                    item += '</div>';
                }
                item += '</div>' + tde;
        /*13*/item += td0 + objectList[i].Area * 10 + objectList[i].Stage + tde;
        /*14*/item += td0 + objectList[i].Time + tde;
        item += '</tr>';
        $('#area-list').append(item);
    }
    /* 190123 이후 일괄 desc로 폐기. ******
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
    */
    if(sw_time){
        //"시간당<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    }else{
        //"성공시<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNSUCS);
    }
}
function callData(){
    if(sw_interval == true){
        for(var i in arr){
            if((arr[i][2] % val_interval) == 0){
                arr[i][2] = val_interval * (parseInt(arr[i][2] / val_interval));
            }else{
                arr[i][2] = val_interval * (parseInt(arr[i][2] / val_interval) + 1);
            }
        }
    }else{
        for(var i = 0; i < arr.length; i++){
            arr[i][2] = timeOriginal[i];
        }
    }

    for(var i = 0; i < arr.length; i++){
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

        if((areaToggle[tmp.Area])
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
    $('#feedbackLine').addClass('hide');
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
            break;
        case 'en':
            langPack = langPacks.en;
            break;
        case 'ja':
            langPack = langPacks.ja;
            break;
        default:
            langPack = langPacks.ko;
            break;
    }

    Highcharts.setOptions(langPack.CHART);

    config.lang = selLang;

    localStorage.config = JSON.stringify(config);

    setLanguage();
}

function setLanguage(){
    //langPack <- 언어별 Language Package
    document.title = langPack.HTML.TITLE;
    $('#str_area').text(langPack.HTML.TABLE.AREA);
    $('#str_huma').text(langPack.HTML.TABLE.HUMA);
    $('#str_ammo').text(langPack.HTML.TABLE.AMMO);
    $('#str_food').text(langPack.HTML.TABLE.FOOD);
    $('#str_part').text(langPack.HTML.TABLE.PART);
    $('#str_sum').text(langPack.HTML.TABLE.SUM);
    $('#sort-5').attr('title', langPack.HTML.TABLE.SUMRATIO + val_sumRate.h + ':' + val_sumRate.a + ':' + val_sumRate.f + ':' + val_sumRate.p);
    $('#str_time').text(langPack.HTML.TABLE.TIME);

    $('#sortContract option[value=99]').text(langPack.HTML.TABLE.TICKET);
    $('#sortContract option[value=7]').text(langPack.HTML.TABLE.TICKET_DOLL);
    $('#sortContract option[value=8]').text(langPack.HTML.TABLE.TICKET_TOOL);
    $('#sortContract option[value=9]').text(langPack.HTML.TABLE.TICKET_FAST);
    $('#sortContract option[value=10]').text(langPack.HTML.TABLE.TICKET_REPR);
    $('#sortContract option[value=11]').text(langPack.HTML.TABLE.TICKET_TOKN);

    $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    $('#str_selectedarea').html(langPack.HTML.TABLE.SELAREA);
    $('#str_load').text(langPack.HTML.TABLE.LOAD);
    $('#str_save').text(langPack.HTML.TABLE.SAVE);
    $('#str_capt').text(langPack.HTML.TABLE.CAPT);
    $('#str_copy').text(langPack.HTML.TABLE.COPY);
    $('#str_timetable').text(langPack.HTML.TABLE.TIMETABLE);

    $('#str_toggleHelp').text(langPack.HTML.TABLE.HELP.OPEN);
    $('#str_btnNotice').text(langPack.HTML.TABLE.HELP.NOTICE);
    $('#str_reset').text(langPack.HTML.TABLE.HELP.RESET);
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
    $('#help_09d').html(langPack.HTML.TABLE.HELP.TIPS.TIP9d);

    $('#str_selectarea_title').text(langPack.HTML.TABLE.HELP.AREASELECT.TITLE);

    $('#str_selecttime_title').text(langPack.HTML.TABLE.HELP.TIMESELECT.TITLE);
    $('#str_selecttime_times').html('0 ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR);
    $('#str_selecttime_timee').html('24 ' + langPack.HTML.TABLE.HELP.TIMESELECT.SELTIMEHOUR);

    $('#str_sumrate_title').text(langPack.HTML.TABLE.HELP.SUMRATE.TITLE);
    $('#btn_change_sumrate').text(langPack.HTML.TABLE.HELP.SUMRATE.BTN);
    //$('#sumrate_huma').attr('placeholder', langPack.HTML.TABLE.HUMA + ': ' + val_sumRate.h);
    //$('#sumrate_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO + ': ' + val_sumRate.a);
    //$('#sumrate_food').attr('placeholder', langPack.HTML.TABLE.FOOD + ': ' + val_sumRate.f);
    //$('#sumrate_part').attr('placeholder', langPack.HTML.TABLE.PART + ': ' + val_sumRate.p);
    $('#sumrate_huma').attr('placeholder', val_sumRate.h);
    $('#sumrate_ammo').attr('placeholder', val_sumRate.a);
    $('#sumrate_food').attr('placeholder', val_sumRate.f);
    $('#sumrate_part').attr('placeholder', val_sumRate.p);

    $('#str_presource_title').text(langPack.HTML.TABLE.HELP.PRESOURCE.TITLE);
    $('#btn_toggle_recovery').text(langPack.HTML.TABLE.HELP.PRESOURCE.REFILL);
    //$('#pre_huma').attr('placeholder', langPack.HTML.TABLE.HUMA + ': 0');
    //$('#pre_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO + ': 0');
    //$('#pre_food').attr('placeholder', langPack.HTML.TABLE.FOOD + ': 0');
    //$('#pre_part').attr('placeholder', langPack.HTML.TABLE.PART + ': 0');
    $('#pre_huma').attr('placeholder', '0');
    $('#pre_ammo').attr('placeholder', '0');
    $('#pre_food').attr('placeholder', '0');
    $('#pre_part').attr('placeholder', '0');

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
    $('#use_huma').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLEs1);
    $('#use_ammo').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLEs1);
    $('#use_food').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLEs1);
    $('#use_part').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.DAY.TABLEs1);
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
    $('#pre2_huma').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1);
    $('#pre2_ammo').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1);
    $('#pre2_food').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1);
    $('#pre2_part').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs1);
    $('#fin_huma').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2);
    $('#fin_ammo').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2);
    $('#fin_food').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2);
    $('#fin_part').attr('placeholder', langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CHOICE.USES.TABLEs2);
    $('#btn_calcUse2').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.BTN_CALC);
    $('#str_rcmd_ratio_text2').text(langPack.HTML.TABLE.HELP.RECOMMEND.RATIO.CALC_TEXT);

    $('#wgt_huma').attr('placeholder', '1');
    $('#wgt_ammo').attr('placeholder', '1.5');
    $('#wgt_food').attr('placeholder', '1.5');
    $('#wgt_part').attr('placeholder', '0.6');

    $('#str_rcmd_sucsratio').text(langPack.HTML.TABLE.HELP.RECOMMEND.SUCSRATIO);
    $('#auto_calc').text(langPack.HTML.TABLE.HELP.RECOMMEND.BTN_RCMD);
    $('#str_rcmd_result').text(langPack.HTML.TABLE.HELP.RECOMMEND.RESULT);
    $('#btn-tglT0').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[0] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT1').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[1] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT2').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[2] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT3').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[3] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#str_feedback').text(langPack.HTML.TABLE.HELP.RECOMMEND.FEEDBACK);

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
                    stext += ary[j] + ', ';
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
        if(sucsrate > 100){sucsrate = 100;}
        $('#per_level').text(langPack.HTML.TABLE.HELP.SUCCESS.SUCSRATIO + ': ' + sucsrate + '%');
    }else{
        sucsrate = parseInt((parseInt(tmp / 5) * 0.60) + 30);
        if(sucsrate > 100){sucsrate = 100;}
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

    var scr = new Object();
    config.scr = scr;

    if(myWidth < 768){
        //Mobile UI 고정형 bootstrap-xs
        config.scr.mid = '240px';
        config.scr.cht = '380px';
        //document.getElementById('tbl_mid').style.height = ((myHeight * 0.60) -125) + 'px';
        //document.getElementById('tbl_cht').style.height = myHeight * 0.40 + 'px';
        sw_drawChart = true;
    }else{
        //Desktop UI 대응형 bootstrap-sm
        config.scr.mid = '629px';
        config.scr.cht = '260px';
        //document.getElementById('tbl_mid').style.height = ((myHeight * 0.9) - 100) + 'px';
        //document.getElementById('tbl_cht').style.height = ((myHeight * 0.40) + 0) + 'px';
        sw_drawChart = true;
    }
    document.getElementById('tbl_mid').style.height = config.scr.mid;
    document.getElementById('tbl_cht').style.height = config.scr.cht;
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

    timeOriginal = new Array();
    for(var i = 0; i < arr.length; i++){
        timeOriginal[i] = arr[i][2];
    }

    $('#area_btn_list').empty();
    for(var i = 0; i < areaToggle.length; i++){
        var btn = '<div class="btn-group">';
            if(areaToggle[i] == 0){
                btn += '<button id="btn-area-'+i+'" type="button" class="btn btn-sm btn-default btn-font-responsive" style="padding:0.5rem" onclick="btn_selArea('+i+')">'+i+'</button>';
            }else if(areaToggle[i] == 1){
                btn += '<button id="btn-area-'+i+'" type="button" class="btn btn-sm btn-success btn-font-responsive" style="padding:0.5rem" onclick="btn_selArea('+i+')">'+i+'</button>';
            }
            btn += '</div>';
        $('#area_btn_list').append(btn);
    }

    langPacks = languagePack_logistics;
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
                return 'en';    //기본언어 'en'
        }
    }

    if(config === undefined){         //no config cache
        config = new Object();
        config.time = true;
        config.help = false;
        config.version = version;
        config.menu = menuToggle;
        config.sumrate = val_sumRate;
        localStorage.config = JSON.stringify(config);

        selLang = getLanguage();
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
            $('#str_notice_head').html(updateDate);
            $('#str_notice').html(updateString);
            if(updateImage == true){$('#pic_notice').removeClass('hide');}else{$('#pic_notice').addClass('hide');}
            $('#noticeModal').modal("show");

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

    $('#lastUpdate').text(lastUpdate);
    $('#loadModal').modal("hide");
}
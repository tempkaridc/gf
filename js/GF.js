/*
    모바일 플ㄹ랫폼 변화시 table에서 일괄 condensed 클래스 제거 & 버튼사이즈 재조정 하기바람.
 */

var version = 201805210;         // Version == 최종수정일 + Trial
var updateString = "2018-05-21 업데이트\n그래프에 기간 설정 버튼 추가 완료";

var objectList      = new Array();
var selectedList    = new Array();
var sync_calcList   = new Array();

var sortToggle      = [0,0,0,0,0,0,0,0,0,0,0,0];            // 0:none 1:asc 2:desc //지역, 인탄식부, 합계, 시간, 계약서5종 = 12
var areaToggle      = [1,1,1,1,1,1,1,1,1,1,1];              // [11] 0~10지역
var wghtToggle      = [0,0,0,0];
var level           = [0,0.1,0.4,0.7];                      // Item 발견 가중치
var wgtH = 1, wgtA = 1, wgtF = 1, wgtP = 0.45;              // 초기 자원 가중치 1:1:1:0.45
var timeToggle      = [0,1,2,3,4,5,6,7,8,9,10,11,12,24];    // 14쌍
var time_front      = 0, time_end = 13;                     // 시간쌍 0~13
var success         = 0.6;                                  // 대성공 초기성공률 60%

var sw_sucs         = false;    // 대성공 적용여부
var sw_time         = true;     // 표 자원 시간당 표기 적용여부
var sw_help         = true;     // 도움말 보기 적용여부

var chart;
var chart_time = new Array();
var now;
var cptStr;
var config;
var saves;

$(function (){
    init();
    //loadNotice();
    refresh();
})
.on('click', '.table-clickable', function(e) {
    e.preventDefault();

    clickRow($(this).attr('idx'));//고유값
})
.on('click', '.table-clickable3', function(e) {
    e.preventDefault();

    reload();
    refresh();
    var rows = document.getElementById("area-list").getElementsByTagName("TR");
    var areaList = saves[$(this).attr('idx')].list;
    for(var i in saves[$(this).attr('idx')].list){
        clickRow(saves[$(this).attr('idx')].list[i]);//고유값
    }
    for(var i in areaList){
        rows[i].parentNode.insertBefore(rows[areaList[i]], rows[i]);
    }

    $('#loadModal').modal("hide");
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
        highlight(0);
    }else{
        $('#btn_toggle_sucs').removeClass('btn-success');
        $('#btn_toggle_sucs').addClass('btn-default');
        $('#per_level').removeClass('btn-success');
        $('#per_level').addClass('btn-default');
        $('#btn_toggle_sucs').text('미적용');
        sw_sucs = false;
        highlight();
    }
    refresh();
});
$('#my_wght').off().on('click', function (e) {
    $('#wghtModal').removeClass("hide");
});
$('#close_wght').off().on('click', function (e) {
    $('#wghtModal').addClass("hide");
});
$('#btn_calcUse').off().on('click', function (e) {
    var tmp = new Array();
    tmp[0] = parseInt(document.getElementById('use_huma').value);
    tmp[1] = parseInt(document.getElementById('use_ammo').value);
    tmp[2] = parseInt(document.getElementById('use_food').value);
    tmp[3] = parseInt(document.getElementById('use_part').value);

    for(var i in tmp){
        if(isNaN(tmp[i])) tmp[i] = 1;
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

    $('#wgt_huma').val(tmp[0].toFixed(2));
    $('#wgt_ammo').val(tmp[1].toFixed(2));
    $('#wgt_food').val(tmp[2].toFixed(2));
    $('#wgt_part').val(tmp[3].toFixed(2));

    $('#wghtModal').addClass("hide");
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
            alert('최종목표치는 현재보다 크거나 같아야 합니다');
            return;
        }
    }

    for(var i in tmp){
        if(isNaN(tmp[i])) tmp[i] = 0;
        if(isNaN(tmpf[i])) tmpf[i] = 0;
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
    console.log(min);

    for(var i in tmpd){
        tmpd[i] = tmpd[i] / min;
    }

    $('#pre_huma').val(tmp[0]);
    $('#pre_ammo').val(tmp[1]);
    $('#pre_food').val(tmp[2]);
    $('#pre_part').val(tmp[3]);

    $('#wgt_huma').val(tmpd[0].toFixed(2));
    $('#wgt_ammo').val(tmpd[1].toFixed(2));
    $('#wgt_food').val(tmpd[2].toFixed(2));
    $('#wgt_part').val(tmpd[3].toFixed(2));

    $('#wghtModal').addClass("hide");
    $('#loadModal').modal("hide");
    $('#recommendLine').addClass('hide');
    $('#tbl_cht').empty();
});
$('[id^=btn-tgl]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));
    if(wghtToggle[id] == level[0]){    //dflt -> sucs
        $('#btn-tglT' + id).removeClass('btn-default');
        $('#btn-tglT' + id).addClass('btn-success');
        $('#btn-tglT' + id + '_text').text(' 저확률');
        $('#btn-tglT' + id).attr('title', '시간당 ' + level[1] + '개 이상');
        wghtToggle[id] = level[1];
    }else if(wghtToggle[id] == level[1]){    //sucs -> warn
        $('#btn-tglT' + id).removeClass('btn-success');
        $('#btn-tglT' + id).addClass('btn-warning');
        $('#btn-tglT' + id + '_text').text(' 중확률');
        $('#btn-tglT' + id).attr('title', '시간당 ' + level[2] + '개 이상');
        wghtToggle[id] = level[2];
    }else if(wghtToggle[id] == level[2]) {    //warn -> dang
        $('#btn-tglT' + id).removeClass('btn-warning');
        $('#btn-tglT' + id).addClass('btn-danger');
        $('#btn-tglT' + id + '_text').text(' 고확률');
        $('#btn-tglT' + id).attr('title', '시간당 ' + level[3] + '개 이상');
        wghtToggle[id] = level[3];
    }else if(wghtToggle[id] == level[3]){    //warn -> dang
        $('#btn-tglT' + id).removeClass('btn-danger');
        $('#btn-tglT' + id).addClass('btn-default');
        $('#btn-tglT' + id + '_text').text(' 전체');
        $('#btn-tglT' + id).attr('title', '시간당 ' + level[0] + '개 이상');
        wghtToggle[id] = level[0];
    }
});
$('[id^=btn-rec]').off().on('click', function (e) {
    //재정렬후 재위치
    sortTable(document.getElementById("area-list"), 0, 1);
    var id = parseInt($(this).attr('idx'));
    var rows = document.getElementById("area-list").getElementsByTagName("TR");
    clearRow();
    for(var i in sync_calcList[id].comb){
        clickRow(sync_calcList[id].comb[i]);
    }
    for(var i in sync_calcList[id].comb){
        rows[i].parentNode.insertBefore(rows[sync_calcList[id].comb[i]], rows[i]);
    }
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
});
$('#auto_calc').off().on('click', function (e) {
    //$('#btn_wgt').trigger('click');
    highlight(2);

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

    var limit = 0.95;
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
                    alert('검색 결과가 없습니다.');
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
        $('#btn-rec' + i).text('추천 ' + (i+1) + ' (' + (sync_calcList[i].avgH * 100).toFixed(1) + '%)');
    }
    $('#recommendLine').removeClass('hide');

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
    if(sw_time){
        sw_time = false;
        config.time = false;
    }else{
        sw_time = true;
        config.time = true;
    }
    localStorage.config = JSON.stringify(config);
    refresh();
});
$('#btn-toggleHelp').off().on('click', function (e) {
    if($('#panel-help').hasClass('hide')){
        config.help = true;
        localStorage.config = JSON.stringify(config);
        $('#panel-help').removeClass('hide');
    }else{
        config.help = false;
        localStorage.config = JSON.stringify(config);
        $('#panel-help').addClass('hide');
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
    if(selectedList.length == 0){alert('하나 이상의 군수지역을 선택해야 합니다'); return;}
    var desc = prompt('저장할 군수의 이름을 입력하세요');
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
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = cptStr;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert('클립보드에 아래 내용을 복사하였습니다\n\n' + cptStr);
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
function loadSaves(){
    saves = localStorage.saves;
    if(saves === undefined) {         //no config cache
        saves = new Array();
        localStorage.saves = JSON.stringify(saves);
    }else{
        saves = JSON.parse(localStorage.saves);
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
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable3">';
        item += td3 + area.slice(0,-2) + tde;
        item += td6 + saves[i].desc + tde;
        item += td1 + '<div id="remove-save-' + i + '" idx ="' + i + '" title="지우기" class="btn"><i class="glyphicon glyphicon-trash"></i></div>' + tde;
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
function highlight(id){
    document.getElementById('highlight_0').style.background = 'transparent';
    document.getElementById('highlight_1').style.background = 'transparent';
    document.getElementById('highlight_2').style.background = 'transparent';
    if(id != undefined) document.getElementById('highlight_' + id).style.background = '#ffe5cc';
}
function clearRow(){
    selectedList.length = 0;
    for(var i in objectList) {
        var rowName = '#table-row-' + i;

        if ($(rowName).hasClass('danger')) {
            $(rowName).removeClass('danger');
        }
    }
}
function clickRow(index){
    var rowName = '#table-row-' + index;

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
    var sumT = "", sumItem = "";
    var sumHp = 0, sumAp = 0, sumFp = 0, sumPp = 0, sumTp = 0;
    var perMin;
    var aryH = new Array();
    var aryA = new Array();
    var aryF = new Array();
    var aryP = new Array();
    //now = new Date().getTime();
    now = (new Date).getTime() + 32400000; // GMT+9

    for(i in selectedList){
        if(sw_time){perMin = objectList[selectedList[i]].Time / 60;}
        else{perMin = 1;}

        sumH += objectList[selectedList[i]].Human / perMin;
        sumA += objectList[selectedList[i]].Ammo / perMin;
        sumF += objectList[selectedList[i]].Food / perMin;
        sumP += objectList[selectedList[i]].Part / perMin;
        sumAll = sumH * 1 + sumA * 1 + sumF * 1 + sumP * 2.2;
        sumT += objectList[selectedList[i]].Area + '-' + objectList[selectedList[i]].Stage + ', ';

        if(objectList[selectedList[i]].Ticket_makeDoll) sumHp += objectList[selectedList[i]].Ticket_makeDoll * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_makeTool) sumAp += objectList[selectedList[i]].Ticket_makeTool * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_fastMake) sumFp += objectList[selectedList[i]].Ticket_fastMake * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_fastRepair) sumPp += objectList[selectedList[i]].Ticket_fastRepair * (60 / objectList[selectedList[i]].Time);
        if(objectList[selectedList[i]].Ticket_Tokken) sumTp += objectList[selectedList[i]].Ticket_Tokken * (60 / objectList[selectedList[i]].Time);

        var maxTimeRange = 60 * 24 * 30; //60min * 24hours * 30days
        for(var j = 0; j < parseInt(maxTimeRange / objectList[selectedList[i]].Time) + 1; j++){
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
    $('#sumAll').text(sumAll.toFixed(0));
    $('#sumT').text(sumT.slice(0,-2));

    if(sumHp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/doll.png" title="인형제조계약서"><small>(' + (sumHp*100).toFixed(2) +'%) </small></div>';}
    if(sumAp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/tool.png" title="장비제조계약서"><small>(' + (sumAp*100).toFixed(2) +'%) </small></div>';}
    if(sumFp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/fast.png" title="쾌속제조계약서"><small>(' + (sumFp*100).toFixed(2) +'%) </small></div>';}
    if(sumPp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/repr.png" title="쾌속수복계약서"><small>(' + (sumPp*100).toFixed(2) +'%) </small></div>';}
    if(sumTp){sumItem += '<div style="display:inline-block; width:50%;" title="시간당 획득률"><img src="img/tokn.png" title="구매 토큰"><small>(' + (sumTp*100).toFixed(2) +'%) </small></div>';}

    $('#sumItem').empty();
    $('#sumItem').append(sumItem);

    cptStr = '지역: ' + sumT.slice(0,-2) + '\n'
            +'인력/1시간: ' + sumH.toFixed(0) + '\n'
            +'탄약/1시간: ' + sumA.toFixed(0) + '\n'
            +'식량/1시간: ' + sumF.toFixed(0) + '\n'
            +'부품/1시간: ' + sumP.toFixed(0) + '\n';
    if(sumHp){cptStr += '인형제조계약서/1시간: ' + (sumHp).toFixed(2) + '장\n';}
    if(sumAp){cptStr += '장비제조계약서/1시간: ' + (sumAp).toFixed(2) + '장\n';}
    if(sumFp){cptStr += '쾌속제조계약서/1시간: ' + (sumFp).toFixed(2) + '장\n';}
    if(sumPp){cptStr += '쾌속수복계약서/1시간: ' + (sumPp).toFixed(2) + '장\n';}
    if(sumTp){cptStr += '구매토큰/1시간: ' + (sumTp).toFixed(2) + '개\n';}

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

    console.log(chart_time);

    chart = new Highcharts.chart({
        chart: {
            renderTo: 'tbl_cht',
            borderWidth: 1,
            backgroundColor:'rgba(255, 255, 255, 0.0)'
        },
        title: {
            text: sumT.slice(0,-2),
            style:{
                "fontSize": "13px"
            }
        },
        xAxis: {
            type: 'datetime',
            crosshair: true,
            title: {
                text: null
            },
            dateTimeLabelFormats: {
                hour:"%a, %H시",
                day:"%a, %H시"
            }
        },
        yAxis: {
            title: {
                text: null
            },
            min: 0
        },
        tooltip: {
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
    chart.xAxis[0].setExtremes(now, now + (1000 * 60 * 60 * 24)); //초기값 X-axis range 1dayms
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
    var perMin;
    for(var i in objectList){
        if(sw_time){perMin = objectList[i].Time / 60;}
        else{perMin = 1;}
        var td0 = '<td style="text-align: center; vertical-align:middle; display:none;">';
        var td10 = '<td style="text-align: center; vertical-align:middle;" width="10%">';
        var td30 = '<td style="text-align: center; vertical-align:middle;" width="30%">';
        var tde = '</td>';
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable">';
        /*00*/item += td10 + objectList[i].Area + '-' + objectList[i].Stage + tde;
        /*01*/item += td10 + parseInt(objectList[i].Human / perMin) + tde;
        /*02*/item += td10 + parseInt(objectList[i].Ammo / perMin) + tde;
        /*03*/item += td10 + parseInt(objectList[i].Food / perMin) + tde;
        /*04*/item += td10 + parseInt(objectList[i].Part / perMin) + tde;
        /*05*/item += td10 + parseInt(  objectList[i].Human / perMin * 1 +
                                        objectList[i].Ammo / perMin * 1 +
                                        objectList[i].Food / perMin * 1 +
                                        objectList[i].Part / perMin * 2.2) + tde;
        /*06*/item += td10 + parseInt(objectList[i].Time / 60) + ':' + (objectList[i].Time % 60 == 0 ? '00' : objectList[i].Time % 60) + tde;
        /*07*/item += td0 + objectList[i].Ticket_makeDoll / perMin + tde;
        /*08*/item += td0 + objectList[i].Ticket_makeTool / perMin + tde;
        /*09*/item += td0 + objectList[i].Ticket_fastMake / perMin + tde;
        /*10*/item += td0 + objectList[i].Ticket_fastRepair / perMin + tde;
        /*11*/item += td0 + objectList[i].Ticket_Tokken / perMin + tde;
        /*12*/item += td30;
        if(objectList[i].Ticket_makeDoll) item += '<img src="img/doll.png" title="획득확률: ' + (objectList[i].Ticket_makeDoll * 100) + '%">'
        if(objectList[i].Ticket_makeTool) item += '<img src="img/tool.png" title="획득확률: ' + (objectList[i].Ticket_makeTool * 100) + '%">'
        if(objectList[i].Ticket_fastMake) item += '<img src="img/fast.png" title="획득확률: ' + (objectList[i].Ticket_fastMake * 100) + '%">'
        if(objectList[i].Ticket_fastRepair) item += '<img src="img/repr.png" title="획득확률: ' + (objectList[i].Ticket_fastRepair * 100) + '%">'
        if(objectList[i].Ticket_Tokken) item += '<img src="img/tokn.png" title="획득확률: ' + (objectList[i].Ticket_Tokken * 100) + '%">'
        item += tde;
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
        document.getElementById('text_tablesum').innerHTML = "시간당<br>획득";
    }else{
        document.getElementById('text_tablesum').innerHTML = "전체<br>획득";
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
    ];

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
function reload(){
    areaToggle = [1,1,1,1,1,1,1,1,1,1,1]; //0~10지역
    time_front = 0, time_end = 13;
    for(var i = 0; i < 11; i++){
        if(!$('#btn-area-'+i).hasClass('btn-success')){
            $('#btn-area-'+i).addClass('btn-success');
        }
    }
    dispTime();
}
function refresh(){
    $('#sort-0').trigger('click');
    objectList.length = 0;
    selectedList.length = 0;
    sync_calcList.length = 0;
    $('#recommendLine').addClass('hide');
    callData();
    loadTable();
    calcStage();
}
function init(){
    //localStorage.removeItem("saves");
    config = localStorage.config;
    if(config === undefined){         //no config cache
        config = new Object();
        config.time = true;
        config.help = true;
        config.version = version;
        localStorage.config = JSON.stringify(config);
    }else{                      //config cache here
        config = JSON.parse(localStorage.config);
        sw_time = config.time;
        sw_help = config.help;

        if((config.version === undefined) || (config.version < version)){
            //$('#panel-notice').removeClass('hide');
            alert(updateString);
            config.version = version;
            localStorage.config = JSON.stringify(config);
        }
    }

    if(sw_help){$('#panel-help').removeClass('hide');}
    else{$('#panel-help').addClass('hide');}

    loadSaves();

    var myHeight = 0;
    if( typeof( window.innerWidth ) == 'number' ) {
        myHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        myHeight = document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        myHeight = document.body.clientHeight;
    }
    document.getElementById('tbl_mid').style.height = myHeight * 0.80 + 'px';
    document.getElementById('tbl_cht').style.height = myHeight * 0.3 + 'px';

    document.getElementById("pre_huma").addEventListener("change",function(){calcStage();});
    document.getElementById("pre_ammo").addEventListener("change",function(){calcStage();});
    document.getElementById("pre_food").addEventListener("change",function(){calcStage();});
    document.getElementById("pre_part").addEventListener("change",function(){calcStage();});

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

            if($('#btn_toggle_sucs').hasClass('btn-success')) $('#btn_toggle_sucs').trigger('click');
        }

    });
    $('#loadModal').modal("hide");
}

//GarbageCode
/*
$('#btn_wgt').off().on('click', function (e) {
    wgtH = parseFloat(document.getElementById('wgt_huma').value);
    wgtA = parseFloat(document.getElementById('wgt_ammo').value);
    wgtF = parseFloat(document.getElementById('wgt_food').value);
    wgtP = parseFloat(document.getElementById('wgt_part').value);
    if(isNaN(wgtH)) wgtH = 1;
    if(isNaN(wgtA)) wgtA = 1;
    if(isNaN(wgtF)) wgtF = 1;
    if(isNaN(wgtP)) wgtP = 2.2;
    highlight(1);
    refresh();
    //sortToggle[5] = 0;
    //$('#sort-5').trigger('click');
});

function loadNotice(){
    var text = "";

    text +=
        "2018-04-16 BUG 수정\n" +
        "- 나만의 가중치 계산버튼위치 변경 및 모바일 대응\n" +
        "- 가중치 0 미계산 버그 수정\n\n";

    text +=
        "2018-04-12 UI수정\n" +
        "- 차트 및 기타 UI 일부수정\n\n";

    text +=
        "2018-04-10 가중치 개념 분리\n" +
        "- 자원량 합계의 부품 가중치를 1:1:1:2.2 로 고정\n" +
        "- 자원 가중치 '적용'기능 삭제. (자원량합계 불변)\n" +
        "- 기존 자원 가중치 기능은 추천지역 자동계산에만 사용\n" +
        "└ 가중치가 높을수록 해당 자원 우선적용\n";

    text = text.replace(/\r?\n/g, '<br />');
    $('#list-notice').append(text);
}
 */
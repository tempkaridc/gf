var version         = 201808082330;         // Version == 최종수정일 시간 분
var updateString    = "2018-08-08 Changelog"
                    + "\n- 다국어 지원"
                    + "\n- 그래프 속도 개선"
                    ;

var selLang;
var langPacks;
var langPack;

var objectList      = new Array();
var selectedList    = new Array();
var sync_calcList   = new Array();

var sortToggle      = [0,0,0,0,0,0,0,0,0,0,0,0];            // 0:none 1:asc 2:desc //지역, 인탄식부, 합계, 시간, 계약서5종 = 12
var areaToggle      = [1,1,1,1,1,1,1,1,1,1,1];              // [11] 0~10지역
var wghtToggle      = [0,0,0,0];                            // 계약서 가중치 버튼 스위치
var level           = [0,0.1,0.4,0.7];                      // 계약서 가중치 확률
var timeToggle      = [0,1,2,3,4,5,6,7,8,9,10,12,24];       // [13]

var time_front      = 0;                                    // Head
var time_end        = timeToggle.length - 1;                // Tail 시간쌍
var success         = 0.6;                                  // 대성공 초기성공률 60%

var sw_sucs         = false;    // 대성공 적용여부
var sw_recovery     = false;    // 자원회복 적용여부
var sw_zero         = true;     // 자원량 0 표기여부
var sw_time         = true;     // 표 자원 시간당 표기 적용여부
var sw_help         = true;     // 도움말 보기 적용여부
var sw_drawChart    = true;     // 차트 드로잉 갱신여부

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
});
$('[id^=btn-area-]').off().on('click', function (e) {
    var id = parseInt($(this).attr('idx'));

    if(id == 0){    //0지역은 토글
        if($('#btn-area-0').hasClass('btn-success')){
            $('#btn-area-0').removeClass('btn-success');
            $('#btn-area-0').addClass('btn-default');
            areaToggle[0] = 0;
        }else{
            $('#btn-area-0').removeClass('btn-default');
            $('#btn-area-0').addClass('btn-success');
            areaToggle[0] = 1;
        }
    }else{          //그 외 지역은 해당 지역까지 쭉
        for(var i = 1; i < areaToggle.length; i++){
            $('#btn-area-' + i).removeClass('btn-success');
            $('#btn-area-' + i).addClass('btn-default');
            areaToggle[i] = 0;
        }
        for(var i = 1; i <= id; i++){
            $('#btn-area-' + i).removeClass('btn-default');
            $('#btn-area-' + i).addClass('btn-success');
            areaToggle[i] = 1;
        }
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
$('#btn_toggle_sucs').off().on('click', function (e) {
    if($('#btn_toggle_sucs').hasClass('btn-default')){
        $('#btn_toggle_sucs').removeClass('btn-default');
        $('#btn_toggle_sucs').addClass('btn-success');
        $('#per_level').removeClass('btn-default');
        $('#per_level').addClass('btn-success');
        $('#btn_toggle_sucs').html(langPack.HTML.TABLE.HELP.SUCCESS.BTN_OK);
        sw_sucs = true;
        highlight(6);
    }else{
        $('#btn_toggle_sucs').removeClass('btn-success');
        $('#btn_toggle_sucs').addClass('btn-default');
        $('#per_level').removeClass('btn-success');
        $('#per_level').addClass('btn-default');
        $('#btn_toggle_sucs').html(langPack.HTML.TABLE.HELP.SUCCESS.BTN_NO);
        sw_sucs = false;
        highlight(0);
    }
    refresh();
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
$('#help_time').off().on('click', function (e) {
    $('#btn-toggleTime').trigger('click');
});
$('#help_wght').off().on('click', function (e) {
    $('#my_wght').trigger('click');
});
$('#my_wght').off().on('click', function (e) {
    $('#wghtModal').removeClass("hide");
    $('#wghtModal_margin1').removeClass("hide");
    $('#wghtModal_margin2').removeClass("hide");
});
$('#close_wght').off().on('click', function (e) {
    $('#wghtModal').addClass("hide");
    $('#wghtModal_margin1').addClass("hide");
    $('#wghtModal_margin2').addClass("hide");
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

    highlight(8);

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
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = cptStr;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert(langPack.HTML.INCODE.ALERT4 + cptStr);
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

        //임시로 이벤트쪽에서 save 섞인 파일 지우는 코드 삽입해둠...
        if(saves.title == undefined) {

        }else{
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
        var item = '<tr id="table-row-' + i + '" idx="' + i + '" class="table-clickable3">';
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
    if(sw_drawChart){
        calcStage();
    }
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
    $('#scr-times').text(timeToggle[time_front] + ' ' + langPack.HTML.TABLE.HELP.SELTIMEHOUR); //hours hour 혼용예정
    $('#scr-timee').text(timeToggle[time_end] + ' ' + langPack.HTML.TABLE.HELP.SELTIMEHOUR);
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
    var sumHp = 0, sumAp = 0, sumFp = 0, sumPp = 0, sumTp = 0;
    var perMin;
    var aryH = new Array();
    var aryA = new Array();
    var aryF = new Array();
    var aryP = new Array();
    now = (new Date).getTime() + (9 * 60 * 60 * 1000); // GMT+9

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
        sumAll = sumH * 1 + sumA * 1 + sumF * 1 + sumP * 2.2;
        sumT += objectList[selectedList[i]].Area + '-' + objectList[selectedList[i]].Stage + ', ';
        sumTime += + parseInt(objectList[selectedList[i]].Time / 60) + ':' + (objectList[selectedList[i]].Time % 60 == 0 ? '00' : objectList[selectedList[i]].Time % 60);
        sumTime += ', ';

        if(objectList[selectedList[i]].Ticket_makeDoll) sumHp += objectList[selectedList[i]].Ticket_makeDoll / perMin;
        if(objectList[selectedList[i]].Ticket_makeTool) sumAp += objectList[selectedList[i]].Ticket_makeTool / perMin;
        if(objectList[selectedList[i]].Ticket_fastMake) sumFp += objectList[selectedList[i]].Ticket_fastMake / perMin;
        if(objectList[selectedList[i]].Ticket_fastRepair) sumPp += objectList[selectedList[i]].Ticket_fastRepair / perMin;
        if(objectList[selectedList[i]].Ticket_Tokken) sumTp += objectList[selectedList[i]].Ticket_Tokken / perMin;

        var maxTimeRange = 60 * 24 * 30; //60min * 24hours * 30days

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
    $('#sumH').text(sumH.toFixed(0));
    $('#sumA').text(sumA.toFixed(0));
    $('#sumF').text(sumF.toFixed(0));
    $('#sumP').text(sumP.toFixed(0));
    $('#sumAll').text(sumAll.toFixed(0));
    $('#sumT').text(sumT.slice(0,-2));

    var timeTitle = langPack.HTML.TABLE.TICKET_PER_HOUR;
    if(!sw_time){
        timeTitle = langPack.HTML.TABLE.TICKET_PER_RECV;
    }
    if(sumHp){sumItem += '<div class-"table-font-responsive;" style="display:inline-block; width:50%;" title="' + timeTitle +'"><img src="img/doll.png" title="' + langPack.HTML.TABLE.TICKET_DOLL + '" style="height:1.7em"><small>(' + (sumHp*100).toFixed(2) +'%) </small></div>';}
    if(sumAp){sumItem += '<div class-"table-font-responsive;" style="display:inline-block; width:50%;" title="' + timeTitle +'"><img src="img/tool.png" title="' + langPack.HTML.TABLE.TICKET_TOOL + '" style="height:1.7em"><small>(' + (sumAp*100).toFixed(2) +'%) </small></div>';}
    if(sumFp){sumItem += '<div class-"table-font-responsive;" style="display:inline-block; width:50%;" title="' + timeTitle +'"><img src="img/fast.png" title="' + langPack.HTML.TABLE.TICKET_FAST + '" style="height:1.7em"><small>(' + (sumFp*100).toFixed(2) +'%) </small></div>';}
    if(sumPp){sumItem += '<div class-"table-font-responsive;" style="display:inline-block; width:50%;" title="' + timeTitle +'"><img src="img/repr.png" title="' + langPack.HTML.TABLE.TICKET_REPR + '" style="height:1.7em"><small>(' + (sumPp*100).toFixed(2) +'%) </small></div>';}
    if(sumTp){sumItem += '<div class-"table-font-responsive;" style="display:inline-block; width:50%;" title="' + timeTitle +'"><img src="img/tokn.png" title="' + langPack.HTML.TABLE.TICKET_TOKN + '" style="height:1.7em"><small>(' + (sumTp*100).toFixed(2) +'%) </small></div>';}

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
    if(sumHp){cptStr += langPack.HTML.TABLE.TICKET_DOLL + '[' + (sumHp).toFixed(2) + '] ';}
    if(sumAp){cptStr += langPack.HTML.TABLE.TICKET_TOOL + '[' + (sumAp).toFixed(2) + '] ';}
    if(sumFp){cptStr += langPack.HTML.TABLE.TICKET_FAST + '[' + (sumFp).toFixed(2) + '] ';}
    if(sumPp){cptStr += langPack.HTML.TABLE.TICKET_REPR + '[' + (sumPp).toFixed(2) + '] ';}
    if(sumTp){cptStr += langPack.HTML.TABLE.TICKET_TOKN + '[' + (sumTp).toFixed(2) + '] ';}

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

    chart.xAxis[0].setExtremes(now, now + (1000 * 60 * 60 * 24)); //초기값 X-axis range 1dayms
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
    for(var i in objectList){
        if(sw_time){
            perMin = objectList[i].Time / 60;
            byTime = langPack.HTML.TABLE.TICKET_PER_HOUR;
        }
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
        if(objectList[i].Ticket_makeDoll) item      += '<img src="img/doll.png" title="' + byTime + ': ' + (objectList[i].Ticket_makeDoll * 100 / perMin).toFixed(2) + '%" style="height:1.8em;">'
        if(objectList[i].Ticket_makeTool) item      += '<img src="img/tool.png" title="' + byTime + ': ' + (objectList[i].Ticket_makeTool * 100 / perMin).toFixed(2) + '%" style="height:1.8em;">'
        if(objectList[i].Ticket_fastMake) item      += '<img src="img/fast.png" title="' + byTime + ': ' + (objectList[i].Ticket_fastMake * 100 / perMin).toFixed(2) + '%" style="height:1.8em;">'
        if(objectList[i].Ticket_fastRepair) item    += '<img src="img/repr.png" title="' + byTime + ': ' + (objectList[i].Ticket_fastRepair * 100 / perMin).toFixed(2) + '%" style="height:1.8em;">'
        if(objectList[i].Ticket_Tokken) item        += '<img src="img/tokn.png" title="' + byTime + ': ' + (objectList[i].Ticket_Tokken * 100 / perMin).toFixed(2) + '%" style="height:1.8em;">'
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
        //document.getElementById('btn-toggleTime').innerHTML = "시간당<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    }else{
        //document.getElementById('btn-toggleTime').innerHTML = "성공시<br>획득";
        $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNSUCS);
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
        [10,4,600,660,660,660,330,0,0.9,0,0,0]
    ];

    for(var i in arr){
        var tmp = new Object();
        tmp.Area = arr[i][0];
        tmp.Stage = arr[i][1];
        tmp.Time = arr[i][2];

        if(sw_sucs){
            tmp.Human   = arr[i][3] * (0.5 * success + 1);
            tmp.Ammo    = arr[i][4] * (0.5 * success + 1);
            tmp.Food    = arr[i][5] * (0.5 * success + 1);
            tmp.Part    = arr[i][6] * (0.5 * success + 1);

            tmp.Ticket_total = arr[i][7] + arr[i][8] + arr[i][9] + arr[i][10] + arr[i][11];

            if(arr[i][7]){
                tmp.Ticket_makeDoll     =   success * arr[i][7] / tmp.Ticket_total + (1 - success) * arr[i][7];
            }else{tmp.Ticket_makeDoll   = 0;}
            if(arr[i][8]){
                tmp.Ticket_makeTool     =   success * arr[i][8] / tmp.Ticket_total + (1 - success) * arr[i][8];
            }else{tmp.Ticket_makeTool   = 0;}
            if(arr[i][9]){
                tmp.Ticket_fastMake     =   success * arr[i][9] / tmp.Ticket_total + (1 - success) * arr[i][9];
            }else{tmp.Ticket_fastMake   = 0;}
            if(arr[i][10]){
                tmp.Ticket_fastRepair   =   success * arr[i][10] / tmp.Ticket_total + (1 - success) * arr[i][10];
            }else{tmp.Ticket_fastRepair = 0;}
            if(arr[i][11]){
                tmp.Ticket_Tokken       =   success * arr[i][11] / tmp.Ticket_total + (1 - success) * arr[i][11];
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

        if( (areaToggle[tmp.Area]) &&
            (timeToggle[time_front] * 60 <= tmp.Time) &&
            (tmp.Time <= timeToggle[time_end] * 60)){
            objectList.push(tmp);
        }
    }
}
function reload(){
    for(var i in areaToggle){   //전지역 초기화
        areaToggle[i] = 1;
    }
    time_front = 0, time_end = timeToggle.length- 1;
    for(var i = 0; i < areaToggle.length - 1; i++){
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

function selectLanguage(elem){
    selLang = elem.value;
    loadLanguage();
}

function loadLanguage(){
    switch(selLang){
        case 'kr':
            langPack = langPacks.kr;
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
                        'Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'
                    ],
                    weekdays: [
                        'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
                    ],
                    shortWeekdays: [
                        'Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'
                    ]
                }
            });
            break;
        default:
            langPack = langPacks.kr;
            Highcharts.setOptions({
                lang: {
                    months: [
                        'January','February','March','April','May','June','July','August','September','October','November','December'
                    ],
                    shortMonths: [
                        'Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'
                    ],
                    weekdays: [
                        'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
                    ],
                    shortWeekdays: [
                        'Sun.','Mon.','Tue.','Wed.','Thu.','Fri.','Sat.'
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
    $('#sort-5').attr('title', langPack.HTML.TABLE.SUMRATIO);
    $('#str_time').text(langPack.HTML.TABLE.TIME);
    $('#sort-7').attr('title', langPack.HTML.TABLE.TICKET_DOLL);
    $('#sort-8').attr('title', langPack.HTML.TABLE.TICKET_TOOL);
    $('#sort-9').attr('title', langPack.HTML.TABLE.TICKET_FAST);
    $('#sort-10').attr('title', langPack.HTML.TABLE.TICKET_REPR);
    $('#sort-11').attr('title', langPack.HTML.TABLE.TICKET_TOKN);
    $('#btn-toggleTime').html(langPack.HTML.TABLE.BTNTIME);
    $('#str_selarea').html(langPack.HTML.TABLE.SELAREA);
    $('#str_load').text(langPack.HTML.TABLE.LOAD);
    $('#str_save').text(langPack.HTML.TABLE.SAVE);
    $('#str_copy').text(langPack.HTML.TABLE.COPY);

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
    $('#help_08a').html(langPack.HTML.TABLE.HELP.TIPS.TIP8a);
    $('#help_08b').html(langPack.HTML.TABLE.HELP.TIPS.TIP8b);

    $('#str_title_selarea').text(langPack.HTML.TABLE.HELP.SELAREA);
    $('#str_title_resource').text(langPack.HTML.TABLE.HELP.RESOURCE);
    $('#str_title_refill').text(langPack.HTML.TABLE.HELP.REFILL);
    $('#pre_huma').attr('placeholder', langPack.HTML.TABLE.HUMA + ': 0');
    $('#pre_ammo').attr('placeholder', langPack.HTML.TABLE.AMMO + ': 0');
    $('#pre_food').attr('placeholder', langPack.HTML.TABLE.FOOD + ': 0');
    $('#pre_part').attr('placeholder', langPack.HTML.TABLE.PART + ': 0');

    $('#str_title_seltime').text(langPack.HTML.TABLE.HELP.SELTIME);
    $('#scr-times').html('0 ' + langPack.HTML.TABLE.HELP.SELTIMEHOUR);
    $('#scr-timee').html('24 ' + langPack.HTML.TABLE.HELP.SELTIMEHOUR);
    $('#str_success_title').text(langPack.HTML.TABLE.HELP.SUCCESS.TEXT);
    $('#str_success_sumlevel').text(langPack.HTML.TABLE.HELP.SUCCESS.SUMLEVEL);
    $('#per_level').text(langPack.HTML.TABLE.HELP.SUCCESS.SUCSRATIO + ': 60.0%');
    $('#btn_toggle_sucs').html(langPack.HTML.TABLE.HELP.SUCCESS.BTN_NO);

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

    if(myWidth <= 991){ //Mobile UI
        document.getElementById('tbl_mid').style.height = myHeight * 0.60 + 'px';
        document.getElementById('tbl_cht').style.height = myHeight * 0.40 + 'px';
    }else{              //Desktop UI
        document.getElementById('tbl_mid').style.height = myHeight * 0.80 + 'px';
        document.getElementById('tbl_cht').style.height = myHeight * 0.30 + 'px';
    }
}

function init(){
    //localStorage.removeItem("config");
    var userLang = window.navigator.userLanguage || window.navigator.language;
    var jsonLine = '{"kr":{"HTML":{"TITLE":"소녀전선 - 군수지원 효율계산 / 추천 시뮬레이터","TABLE":{"RSRC":"자원","AREA":"지역","HUMA":"인력","AMMO":"탄약","FOOD":"식량","PART":"부품","SUM":"합계","SUMRATIO":"인탄식부 1:1:1:2.2 계산","TIME":"시간","BTNSUCS":"성공시<br>획득","BTNTIME":"시간당<br>획득","SELAREA":"선택<br>지역","LOAD":" 불러오기","SAVE":" 저장","COPY":" 클립보드에 복사","TICKET":"계약서","TICKET_DOLL":"인형제조계약서","TICKET_TOOL":"장비제조계약서","TICKET_FAST":"쾌속제조계약서","TICKET_REPR":"쾌속수복계약서","TICKET_TOKN":"구매 토큰","TICKET_PER_HOUR":"시간당 획득률","TICKET_PER_RECV":"성공시 획득률","PER_HOUR":"시간당","PER_RECV":"성공시","TICKET_RATIO":"획득확률","HELP":{"OPEN":"도움말 열기","CLOSE":"도움말 닫기","TIPS":{"TIP1":"1. 자원량 / 계약서 획득량은 표 좌측 하단의 <span id=\\"help_time\\"><a href=\\"#toggleTime\\">시간당 / 성공시 획득 전환 버튼</a></span> 으로 변경 가능","TIP2":"2. 표 상단의 <a href=\\"#\\">자원명</a> <font color=\\"red\\">클릭 시</font>, 오름 / 내림차순 정렬","TIP3":"3. 표의 <a href=\\"#\\">합계</a> 값은 자원비 <font color=\\"red\\">1 : 1 : 1 : 2.2</font> 로 계산","TIP4":"4. 표의 계약서 획득확률은 <a href=\\"https://pan.baidu.com/s/1c3iS9Ks#list/path=/Girls%20Frontline\\" target=\\"_blank\\">철혈시트</a> 기준 추정 <font color=\\"red\\">가중치</font>","TIP5":"5. 하단 예상 그래프는 <a href=\\"#anchor_resource\\">현재자원</a> <font color=\\"red\\">값부터 합산</font>, 미입력시 0부터 계산","TIP5a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#anchor_resource\\">자동회복</a> 활성화 시 3분당 인탄식부 3:3:3:1 회복</div>","TIP6":"6. <a href=\\"#anchor_success\\">대성공률</a> 적용 시, 자원 및 계약서 획득률을 대성공 기대치로 재계산","TIP7":"7. <div class=\\"btn btn-danger\\"></div><div class=\\"btn btn-primary\\"></div> 기능/선택 버튼, <div class=\\"btn btn-default\\"></div><div class=\\"btn btn-success\\"></div> 켜기/끄기 버튼","TIP8":"8. <a href=\\"#anchor_recommend\\">자동추천</a> 은 입력된 <font color=\\"red\\">가중치 비율의 자원 획득</font>을 위한 군수 조합 추천","TIP8a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#anchor_areas\\">지역선택</a>, <a href=\\"#anchor_timeline\\">시간대</a>, <a href=\\"#anchor_success\\">대성공</a>, <a href=\\"#anchor_contract\\">계약서 획득률</a> 모두 반영</div>","TIP8b":"<div style=\\"margin-left:10px;\\">b. <span id=\\"help_wght\\"><a href=\\"#anchor_recommend\\">내 가중치</a></span> 버튼 클릭 시, 개인 가중치 계산 가능</div>"},"SELAREA":"지역선택","RESOURCE":"현재자원","REFILL":"자동회복","SELTIME":"시간대","SELTIMEHOUR":"시간","SUCCESS":{"TEXT":"대성공","SUMLEVEL":"제대 레벨합계","SUCSRATIO":"대성공 확률","BTN_OK":"적용","BTN_NO":"미적용"},"RECOMMEND":{"TITLE":"자동추천","RATIO":{"BTN_RATIO":"내 가중치","CHOICE":{"DAY":{"TITLE":"일일사용량 기반 계산","TEXT":"하루에 사용하는 자원량에 의거한 개인 가중치 계산","TABLE1":"일일사용량 기반 계산 예","TABLE2":"인형제조 범용1식 4회","TABLE3":"장비제조 범용1식 4회","TABLE4":"전역 9회 클리어","TABLE5":"합계 <small>(아래 입력)</small>","TABLE6":"가중치"},"USES":{"TITLE":"최종목표치 기반 계산","TEXT":"목표로 삼은 자원량에서 역산한 개인 가중치 계산","TABLE1":"최종목표량 기반 계산 예","TABLE2":"현재 자원량 <small>(아래 입력)</small>","TABLE3":"목표 자원량 <small>(아래 입력)</small>","TABLE4":"오차","TABLE5":"가중치","TABLEs1":"현재","TABLEs2":"목표"}},"BTN_CALC":"계산","CALC_TEXT":"\'계산\'클릭 시, 가중치 자동입력"},"SUCSRATIO":"획득률","TEXT_PERHOUR1":"시간당 ","TEXT_PERHOUR2":"개 이상","BTN_RCMD":"지역 추천","RESULT":"추천결과","SIMM":"가중치 일치율"}}},"CHART":{"AREA":"지역:","TIME":"기간:","BTN1":"1일","BTN2":"1주","BTN3":"2주","BTN4":"4주","DAY":"일","HOUR":"시","MIN":"분"},"MODAL":{"LOAD":{"TITLE":"저장된 조합 불러오기","AREA":"지역","HELP":"설명"}},"BOTTOM":{"ADDR":"주소: ","SGST":"건의사항: ","OPTI":"이 페이지는 Chrome, FF, Edge에 최적화되어 있습니다."},"INCODE":{"ALERT1":"최종목표치는 현재보다 크거나 같아야 합니다","ALERT2":"검색 결과가 없습니다","ALERT3":"하나 이상의 군수지역을 선택해야 합니다","ALERT4":"클립보드에 아래 내용을 복사하였습니다\\n\\n","SAVE":"저장할 조합의 이름을 입력하세요","DELETE":"지우기"}}},"en":{"HTML":{"TITLE":"Girls\' Frontline Logistic Support Calculator","TABLE":{"RSRC":"Resource","AREA":"Mission","HUMA":"Manpw.","AMMO":"Ammo","FOOD":"Rations","PART":"Parts","SUM":"Total","SUMRATIO":"Multiplier - Manpw.(1x) : Ammo(1x) : Rations(1x) : Parts(2x)","TIME":"Time","BTNSUCS":"Per<br>Mission","BTNTIME":"Per<br>Hour","SELAREA":"Selected<br>Mission","LOAD":" Load","SAVE":" Save","COPY":" Copy to clipboard","TICKET":"Contracts","TICKET_DOLL":"T-Doll Contract","TICKET_TOOL":"Equipment Production Contract","TICKET_FAST":"Quick Production Contract","TICKET_REPR":"Quick Restoration Contract","TICKET_TOKN":"Token","TICKET_PER_HOUR":"Chance per hour","TICKET_PER_RECV":"Chance per mission","PER_HOUR":"perHour","PER_RECV":"perMission","TICKET_RATIO":"Chance","HELP":{"OPEN":"Open Help","CLOSE":"Close Help","TIPS":{"TIP1":"1. Toggle \'Resource & Contract gain per HOUR or MISSION\' with <span id=\\"help_time\\"><a href=\\"#toggleTime\\">Button left-bottom of the table</a></span>","TIP2":"2. When you click <a href=\\"#\\">Resource Name</a>, ASC / DESC Sort","TIP3":"3. <a href=\\"#\\">Total</a> calculated with <font color=\\"red\\">1x : 1x : 1x : 2.2x</font> multiplier","TIP4":"4. Contract Gain Chance reference: <a href=\\"https://pan.baidu.com/s/1c3iS9Ks#list/path=/Girls%20Frontline\\" target=\\"_blank\\">Sangvis Ferri Sheet</a> <font color=\\"red\\">(Assumption)</font>","TIP5":"5. Graph starts from <a href=\\"#anchor_resource\\">Pre Resource</a> <font color=\\"red\\"></font>, default is 0","TIP5a":"<div style=\\"margin-left:10px;\\">a. <a href=\\"#anchor_resource\\">Auto Resupply</a> add 3 : 3 : 3 : 1 resource per 3 min</div>","TIP6":"6. When you apply <a href=\\"#anchor_success\\">Great Success</a>, recaluculate resource & contracts gain to expectation value","TIP7":"7. <div class=\\"btn btn-danger\\"></div><div class=\\"btn btn-primary\\"></div> Function / Select Button, <div class=\\"btn btn-default\\"></div><div class=\\"btn btn-success\\"></div> On / Off Toggle Button","TIP8":"8. <a href=\\"#anchor_recommend\\">Recommend</a> provides mission combination with <font color=\\"red\\">Resource Weight</font>","TIP8a":"<div style=\\"margin-left:10px;\\">a. Reflect <a href=\\"#anchor_areas\\">Chapters</a>, <a href=\\"#anchor_timeline\\">Time Periods</a>, <a href=\\"#anchor_success\\">Great Success</a>, <a href=\\"#anchor_contract\\">Contract Chance</a></div>","TIP8b":"<div style=\\"margin-left:10px;\\">b. Calculate personal resource weights with <span id=\\"help_wght\\"><a href=\\"#anchor_recommend\\">My Weights</a></span> </div>"},"SELAREA":"Chapters","RESOURCE":"Pre Resource","REFILL":"Auto Resupply","SELTIME":"Time Periods","SELTIMEHOUR":"hour","SUCCESS":{"TEXT":"Great Success","SUMLEVEL":"Echelon\'s levelsum","SUCSRATIO":"GS Chance","BTN_OK":"Apply","BTN_NO":"Apply"},"RECOMMEND":{"TITLE":"Recommend","RATIO":{"BTN_RATIO":"My weights","CHOICE":{"DAY":{"TITLE":"Daily Weight","TEXT":"Calculate with daily uses","TABLE1":"Example","TABLE2":"T-DOLL Standard Set x 4","TABLE3":"Equipment Standard Set x 4","TABLE4":"Clear 9 Areas","TABLE5":"Sum <small>(input below)</small>","TABLE6":"Weight"},"USES":{"TITLE":"Target Weight","TEXT":"Calculate with target amount","TABLE1":"Example","TABLE2":"Present Resource <small>(input below)</small>","TABLE3":"Goal Resource <small>(input below)</small>","TABLE4":"Difference","TABLE5":"Weight","TABLEs1":"Pre","TABLEs2":"Obj"}},"BTN_CALC":"Calculate","CALC_TEXT":"Click \'Calculate\' to get your own weight"},"SUCSRATIO":"Contracts","TEXT_PERHOUR1":"Over ","TEXT_PERHOUR2":"/h","BTN_RCMD":"Recommend Missions","RESULT":"Results","SIMM":"Weight Similarity"}}},"CHART":{"AREA":"Area:","TIME":"Period:","BTN1":"1D","BTN2":"1W","BTN3":"2W","BTN4":"4W","DAY":"","HOUR":"","MIN":""},"MODAL":{"LOAD":{"TITLE":"Load saved missions","AREA":"Missions","HELP":"Description"}},"BOTTOM":{"ADDR":"Address: ","SGST":"Suggestions: ","OPTI":"This website is optimized for Chrome, FF, Edge"},"INCODE":{"ALERT1":"Goal must bigger than present","ALERT2":"No result","ALERT3":"You muse select at least one mission","ALERT4":"Copy to clipboard\\n\\n","SAVE":"Name your save","DELETE":"Delete"}}}}';
    langPacks = JSON.parse(jsonLine);

    config = localStorage.config;

    if(config === undefined){         //no config cache
        config = new Object();
        config.time = true;
        config.help = true;
        config.version = version;
        if(userLang == 'ko') 
            selLang = 'kr';
        else 
            selLang = 'en';
		    config.lang = selLang;
		    localStorage.config = JSON.stringify(config);
    }else{                      //config cache here
        config = JSON.parse(localStorage.config);
        sw_time = config.time;
        sw_help = config.help;
        selLang = config.lang;

        if((config.version === undefined) || (config.version < version)){
            //$('#panel-notice').removeClass('hide');
            alert(updateString);
            config.version = version;
            localStorage.config = JSON.stringify(config);
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

    loadSaves();

    document.getElementById("pre_huma").addEventListener("change",function(){highlight(5);calcStage();});
    document.getElementById("pre_ammo").addEventListener("change",function(){highlight(5);calcStage();});
    document.getElementById("pre_food").addEventListener("change",function(){highlight(5);calcStage();});
    document.getElementById("pre_part").addEventListener("change",function(){highlight(5);calcStage();});

    document.getElementById("sum_level").addEventListener("change",function(){
        var tmp = parseInt(document.getElementById('sum_level').value);
        if(!isNaN(tmp)){
            if (tmp < 0){
                tmp = 0;
                $('#sum_level').val(0);
            }
            if (tmp > 600){
                tmp = 600;
                $('#sum_level').val(600);
            }

            tmp = parseInt(tmp / 5);
            tmp = tmp * 0.45;
            tmp = tmp + 15;
            $('#per_level').text(langPack.HTML.TABLE.HELP.SUCCESS.SUCSRATIO + ': ' + tmp.toFixed(1) + '%');
            success = tmp / 100;

            if($('#btn_toggle_sucs').hasClass('btn-success')) $('#btn_toggle_sucs').trigger('click');
        }

    });

    var date = version + "";
    date = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8) + " " + date.substring(8,10) + ":" + date.substring(10,12);
    $('#lastUpdate').text(date);

    $('#loadModal').modal("hide");
}

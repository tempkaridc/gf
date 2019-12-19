var area    = 81;   //8-1n default
var frame   = [
    //      0:불가능,    1:위험,     2: 안전
    //      frame       6-3n        8-1n
    [       0,          0,          0       ],
    [       52,         0,          1       ],
    [       54,         0,          2       ],
    [       56,         2,          2       ],
    [       61,         2,          2       ],
    [       63,         2,          2       ],
    [       58,         0,          0       ],
    [       66,         0,          1       ],
    [       69,         2,          2       ],
    [       72,         2,          2       ],
    [       76,         0,          0       ],
    [       79,         2,          2       ],
    [       84,         2,          2       ],
    [       89,         0,          0       ],
    [       94,         2,          2       ],
    [       101,        0,          0       ],
    [       108,        2,          2       ],
    [       116,        0,          2       ],
    [       121,        0,          0       ],
    [       999,        0,          0       ]
];

$(function (){


});

function btn_selArea(idx){
    switch(idx){
        case 81:
            $('#btn-area-81').addClass("btn-primary");
            $('#btn-area-81').removeClass("btn-default");
            $('#btn-area-63').addClass("btn-default");
            $('#btn-area-63').removeClass("btn-primary");
            area = 81;
            break;
        case 63:
            $('#btn-area-63').addClass("btn-primary");
            $('#btn-area-63').removeClass("btn-default");
            $('#btn-area-81').addClass("btn-default");
            $('#btn-area-81').removeClass("btn-primary");
            area = 63;
            break;
        default:
            break;
    }
    reCalc();
}

function btn_showModal(idx){
    $('#help'+idx).modal("show");
}

function btn_hideModal(idx){
    $('#help'+idx).modal("hide");
}


function btn_openHelp(){
    for(var i = 1; i < 9; i++){
        $('#btn-help-' + i).removeClass("hide");
    }
}

function btn_toggleHelp(me){
    for(var i = 1; i < 9; i++){
        $('#btn-help-' + i + 'a').addClass("hide");
    }
    $('#btn-help-' + me + 'a').removeClass("hide");
}

function reCalc(){
    var dollFire = parseFloat(document.getElementById('doll_fire').value),
        dollRate = parseFloat(document.getElementById('doll_rate').value),
        fairyFire = parseFloat(document.getElementById('fairy_fire').value),
        buffFire = parseFloat(document.getElementById('buff_fire').value),
        buffRate = parseFloat(document.getElementById('buff_rate').value);



    if(dollFire < 0)    {
        dollFire = 0;
        $('#doll_fire').val(0);
    }
    if(dollFire > 100){
        dollFire = 100;
        $('#doll_fire').val(100);
    }
    if(dollRate < 0){
        dollRate = 0;
        $('#doll_rate').val(0);
    }
    if(dollRate > 121){
        dollRate = 121;
        $('#doll_rate').val(121);
    }
    if(fairyFire < 0){
        fairyFire = 0;
        $('#fairy_fire').val(0);
    }
    if(fairyFire > 100){
        fairyFire = 100;
        $('#fairy_fire').val(100);
    }
    if(buffFire < 0){
        buffFire = 0;
        $('#buff_fire').val(0);
    }
    if(buffFire > 100){
        buffFire = 100;
        $('#buff_fire').val(100);
    }
    if(buffRate < 0){
        buffRate = 0;
        $('#buff_rate').val(0);
    }
    if(buffRate > 100){
        buffRate = 100;
        $('#buff_rate').val(100);
    }

    var finalFire = Math.ceil(Math.ceil(dollFire * (1 + (fairyFire / 100))) * (1 + (buffFire / 100)) * (0.85) + 2);
    var finalRate = Math.floor(dollRate * (1 + (buffRate / 100)));

    console.log('fire ' + finalFire);
    console.log('rate ' + finalRate);


    chkFire(finalFire);
    chkRate(finalRate);
}

function chkFire(num){
    if(isNaN(num)){dispFire(3,'화력 계산 불가');return;}

    var min81 = 82;
    if(area == 81){
        if(num >= min81){
            dispFire(2, '화력 만족: ' + num + ' (+' + (num - min81) + ')');
        }else{
            dispFire(0, '화력 부족: ' + num + ' (' + (num - min81) + ')');
        }
    }else{
        if(num >= 63){
            dispFire(2, '화력 만족: ' + num + ' (+' + (num - 63) + ')');
        }else{
            dispFire(0, '화력 부족: ' + num + ' (' + (num - 63) + ')');
        }
    }
}

function chkRate(num){
    if(isNaN(num)){dispRate(3,'사속 계산 불가');return;}

    if(area == 81){
        for(var i = 0; i < frame.length - 1; i++){
            if((frame[i][0] <= num) && (num < frame[i+1][0])){
                dispRate(frame[i][2], num);
                return;
            }
        }
    }else{
        for(var i = 0; i < frame.length - 1; i++){
            if((frame[i][0] <= num) && (num < frame[i+1][0])){
                dispRate(frame[i][1], num);
                return;
            }
        }
    }
}


// i: 0-불가능 1-주의 2-가능 3-값 미입력
function dispFire(i,text){
    $('#btn-calc-fire').removeClass("btn-danger");
    $('#btn-calc-fire').removeClass("btn-success");
    $('#btn-calc-fire').removeClass("btn-default");

    switch(i){
        case 0:
            $('#btn-calc-fire').addClass("btn-danger");
            break;
        case 2:
            $('#btn-calc-fire').addClass("btn-success");
            break;
        case 3:
            $('#btn-calc-fire').addClass("btn-default");
            break;
        default:
            break;
    }
    $('#btn-calc-fire').text(text);
}
function dispRate(i, num){
    $('#btn-calc-rate').removeClass("btn-danger");
    $('#btn-calc-rate').removeClass("btn-warning");
    $('#btn-calc-rate').removeClass("btn-success");
    $('#btn-calc-rate').removeClass("btn-default");

    switch(i){
        case 0:
            $('#btn-calc-rate').addClass("btn-danger");
            $('#btn-calc-rate').text('사속: ' + num + ' (불가능)');
            break;
        case 1:
            $('#btn-calc-rate').addClass("btn-warning");
            $('#btn-calc-rate').text('사속: ' + num + ' (주의, 자스 4번 필수) ');
            break;
        case 2:
            $('#btn-calc-rate').addClass("btn-success");
            $('#btn-calc-rate').text('사속: ' + num + ' (안전)');
            break;
        case 3:
            $('#btn-calc-rate').addClass("btn-default");
            $('#btn-calc-rate').text("사속 계산 불가");
            break;
        default:
            break;
    }
}


function selectLanguage(){
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
    config.lang = selLang;
    localStorage.config = JSON.stringify(config);

    setLanguage();
}

function setLanguage(){
    //langPack <- 언어별 Language Package
    document.title = langPack.HTML.TITLE;
    /*
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
    $('#btn-tglT0').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[0] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT1').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[1] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT2').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[2] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);
    $('#btn-tglT3').attr('title', langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR1 + wghtToggle[3] + langPack.HTML.TABLE.HELP.RECOMMEND.TEXT_PERHOUR2);

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
    */
}
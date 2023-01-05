/*
 * Reference
 * 1.
 *      https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=363156
 * 2.
 *      https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=393875
 * 3.
 *      https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=1635670
 *      https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=1637488
 */

var area    = 81;   // 8-1n default
var frame   = [     // frame i <= x < i+1
    //      0:불가능,    1: 안전,     2:위험
    //      frame       6-3n        8-1n
    [       0,          0,          1       ],
    [       51,         0,          0       ],
    [       52,         2,          0       ],
    [       54,         0,          1       ],
    [       56,         1,          1       ],
    [       58,         1,          1       ],
    [       61,         1,          1       ],
    [       63,         0,          0       ],
    [       66,         2,          2       ],
    [       69,         1,          1       ],
    [       72,         1,          1       ],
    [       76,         0,          0       ],
    [       79,         1,          1       ],
    [       84,         1,          1       ],
    [       89,         0,          0       ],
    [       94,         1,          1       ],
    [       101,        0,          0       ],
    [       108,        1,          0       ],
    [       116,        0,          1       ],
    [       121,        0,          0       ],
    [       999,        0,          0       ]
];
var dangerZone = 0;


//                      살상1   살상2    돌격     격양
var selected_talent     = [ 0,      0,      0,      0   ];
//var fairy_talent_fire   = [ 12,     15,     10,     8  ];
//var fairy_talent_rate   = [ 0,      0,      8,      0  ];
var buff_talent_fire    = 0;
var buff_talent_rate    = 0;

var fairy_talent_fire   = [[5,    7,    9,    10,    12 ],
                           [6,    8,   11,    13,    15 ],
                           [4,    6,    7,     9,    10 ],
                           [3,    6,    7,     9,    10 ]];

var fairy_talent_rate   = [[0,    0,    0,     0,     0 ],
                           [0,    0,    0,     0,     0 ],
                           [3,    4,    6,     7,     8 ],
                           [0,    0,    0,     0,     0 ]];

var selected_rare       = [ 0,    0,    0,    0,    0   ];

var selLang         = 'ko';
var langPack;
var langPacks;
var config;

$(function (){
    langPacks = languagepack_zas;
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
        selLang = getLanguage();
		
		config = new Object();
        config.lang = selLang;
        localStorage.config = JSON.stringify(config);
    }else{                      //config cache here
        config = JSON.parse(localStorage.config);

        if(config.lang !==undefined){
            selLang = config.lang;
        }else{
            selLang = getLanguage();
        }
    }

    $('#selectLang').val(selLang).change();
	
});


function disp_selTalent(){
    for(var i = 0; i < selected_talent.length; i++){
        if(selected_talent[i] == 1){
            $('#btn-talent-' + i).removeClass('btn-default');
            $('#btn-talent-' + i).addClass('btn-success');
        }else{
            $('#btn-talent-' + i).removeClass('btn-success');
            $('#btn-talent-' + i).addClass('btn-default');
        }
    }
}

function btn_selTalent(id){
    if(selected_talent[id] == 1){
        selected_talent[id] = 0;
        //buff_talent_fire = 0;
        //buff_talent_rate = 0;
    }else{
        for(var i = 0; i < selected_talent.length; i++){
            selected_talent[i] = 0;
        }
        selected_talent[id] = 1;
        //buff_talent_fire = fairy_talent_fire[id];
        //buff_talent_rate = fairy_talent_rate[id];
    }
    disp_selTalent();
    reCalc();
}

function disp_selRare(){
    for(var i = 0; i < 5; i++){
        if(selected_rare[i] == 1){
            $('#btn-rare-' + i).removeClass('btn-default');
            $('#btn-rare-' + i).addClass('btn-success');
        }else{
            $('#btn-rare-' + i).removeClass('btn-success');
            $('#btn-rare-' + i).addClass('btn-default');
        }
    }
}

function btn_selRare(id){
    if(selected_rare[id] == 1){
        selected_rare[id] = 0;
    }else{
        for(var i = 0; i < 5; i++){
            selected_rare[i] = 0;
        }
        selected_rare[id] = 1;
    }
    disp_selRare();
    reCalc();
}

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
    if((idx == 3) && (dangerZone == 0)){return;}

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
    
    var talent_id=-1;
    var rare_id=-1;
    for(var i = 0; i < 5; i++){
        if(selected_rare[i]==1)
            rare_id=i;
    }
    for(var i = 0; i < 4; i++){
        if(selected_talent[i]==1)
            talent_id=i;
    }

    buff_talent_fire=(talent_id != -1 && rare_id != -1) ? (fairy_talent_fire[talent_id][rare_id]) : 0;
    buff_talent_rate=(talent_id != -1 && rare_id != -1) ? (fairy_talent_rate[talent_id][rare_id]) : 0;
    
    var finalFire = Math.floor(Math.floor(dollFire * (1 + (fairyFire / 100))) * (1 + (buffFire / 100)) * (1 + (buff_talent_fire / 100)) + 1); // * (0.85)
    var finalRate = Math.floor(dollRate * (1 + (buffRate / 100)) * (1 + (buff_talent_rate / 100)));

    chkFire(finalFire);
    chkRate(finalRate);
}

function chkFire(num){
    if(isNaN(num)){dispFire(3,langPack.result.fire.fail);return;}

    var minFire = 93;

    if(area == 81){
        if(num >= minFire){
            dispFire(2, langPack.result.fire.enable + num + ' (+' + (num - minFire) + ')');
        }else{
            dispFire(0, langPack.result.fire.disable + num + ' (' + (num - minFire) + ')');
        }
    }else{
        if(num >= 63){
            dispFire(2, langPack.result.fire.enable + num + ' (+' + (num - 63) + ')');
        }else{
            dispFire(0, langPack.result.fire.disable + num + ' (' + (num - 63) + ')');
        }
    }
}

function chkRate(num){
    if(isNaN(num)){dispRate(3,langPack.result.rate.fail);return;}

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
    dangerZone = 0;

    switch(i){
        case 0:
            $('#btn-calc-rate').addClass("btn-danger");
            $('#btn-calc-rate').text(num + ' (' + langPack.result.rate.impossible + ')');
            break;
        case 1:
            $('#btn-calc-rate').addClass("btn-success");
            $('#btn-calc-rate').text(num + ' (' + langPack.result.rate.safe + ')');
            break;
        case 2:
            $('#btn-calc-rate').addClass("btn-warning");
            $('#btn-calc-rate').text(num + ' (' + langPack.result.rate.warning + ')');
            dangerZone = 1;
            break;
        case 3:
            $('#btn-calc-rate').addClass("btn-default");
            $('#btn-calc-rate').text(langPack.result.rate.fail);
            break;
        default:
            break;
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
		
	config.lang = selLang;
    localStorage.config = JSON.stringify(config);
	
	setLanguage();
}

function setLanguage(){
    document.title = langPack.title;

    $('#text-title').text(langPack.title);
    $('#text-area').text(langPack.area);

    $('#text-doll-title').text(langPack.doll.title);
    $('#doll_fire').attr('placeholder', langPack.doll.fire);
    $('#doll_rate').attr('placeholder', langPack.doll.rate);

    $('#text-fairy-title').text(langPack.fairy.title);
    $('#fairy_fire').attr('placeholder', langPack.fairy.fire);

    $('#text-place-title').text(langPack.place.title);
    $('#buff_fire').attr('placeholder', langPack.place.fire);
    $('#buff_rate').attr('placeholder', langPack.place.rate);

    $('#text-talent-title').html(langPack.talent.title);
    for (let i = 1; i <= 4; i++) {
        $('#btn-talent-'+(i-1)).text(langPack.talent['t'+ i]);
    }

    $('#text-rare-title').html(langPack.rare.title);
    for (let i = 1; i <= 5; i++) {
        $('#btn-rare-'+(i-1)).text( "★".repeat(i) );
    }

    $('#text-result-title').text(langPack.result.title);

    $('#help_pic_stat').attr("src", 'img/zas/help_stat_' + selLang + '.png');
    $('#help_pic_fairy').attr("src", 'img/zas/help_fairy_' + selLang + '.png');
    $('#help_pic_buff').attr("src", 'img/zas/help_buff_' + selLang + '.png');
    $('#help_pic_danger').attr("src", 'img/zas/help_danger_' + selLang + '.png');

    $('#btn-name-fire').text(langPack.fire);
    $('#btn-name-rate').text(langPack.rate);

    $('#btn-help').text(langPack.qna.title);

    for (let i = 1; i <= 8; i++) {
        $('#btn-help-'+i).text(langPack.qna['q'+ i]);
        $('#btn-help-'+i+'t').html(langPack.qna['a'+ i]);
    }

    reCalc();
}

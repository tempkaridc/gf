/*
 * Reference #1: https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=1530572
 * Reference #2: https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=1531236
 * Reference #3: https://gall.dcinside.com/mgallery/board/view/?id=micateam&no=1535521
 */

var selLang         = 'ko';
var langPack;
var langPacks;
var config;

//                      HG  SMG AR  RF  SG  MG  RF(S)
var selected_enc = [    0,  0,  0,  0,  0,  0,  0   ];
var moving_speed = [    15, 12, 10, 7,  6,  4,  4   ];
var type_minFire = [    142,142,140,128,126,124,124 ];

//                      살상1   살상2    선봉     격양
var selected_talent = [ 0,      0,      0,      0   ];
var fairy_talent    = [ 12,     15,     8,      10  ];
var buff_talent     = 0;

$(function (){
    langPacks = languagepack_vec;
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
        buff_talent = 0;
    }else{
        for(var i = 0; i < selected_talent.length; i++){
            selected_talent[i] = 0;
        }
        selected_talent[id] = 1;
        buff_talent = fairy_talent[id];
    }
    disp_selTalent();
    reCalc();
}

function disp_selType(){
    for(var i = 0; i < selected_enc.length; i++){
        var btn = document.getElementById('btn-type-' + i);

        if(selected_enc[i] == 1){
            btn.style.backgroundColor = '#5cff5c';
        }else{
            btn.style.backgroundColor = 'transparent';
        }
    }
}

function btn_selType(id){
    if(selected_enc[id] == 1){selected_enc[id] = 0;}else{selected_enc[id] = 1;}
    if(id == 3){
        if(selected_enc[id] == 1){
            $('#btn-type-extra').show();
        }else{
            $('#btn-type-extra').hide();
            selected_enc[6] = 0;
        }
    }
    disp_selType();
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
        fairyFire = parseFloat(document.getElementById('fairy_fire').value),
        buffFire = parseFloat(document.getElementById('buff_fire').value);

    if(dollFire < 0){
        dollFire = 0;
        $('#doll_fire').val(0);
    }
    if(dollFire > 100){
        dollFire = 100;
        $('#doll_fire').val(100);
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

    var finalFire = Math.ceil(Math.ceil(dollFire * (1 + (fairyFire / 100))) * (1 + (buffFire / 100)) * (1 + (buff_talent / 100)));

    chkFire(finalFire);
}

function chkFire(num){
    if(isNaN(num)){
        dispFire(3,langPack.result.fire.fail);
        return;
    }

    var minFire = 999;
    for(var i = 0; i < selected_enc.length; i++){
        if(selected_enc[i] == 1){
            if(type_minFire[i] < minFire){
                minFire = type_minFire[i];
            }
        }
    }

    if(minFire == 999){ // No Type Selection
        dispFire(3,langPack.result.fire.fail);
        return;
    }

    if(num >= minFire){
        dispFire(2, langPack.result.fire.enable + num + ' (+' + (num - minFire) + ')');
    }else{
        dispFire(0, langPack.result.fire.disable + num + ' (' + (num - minFire) + ')');
    }

    return;
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

    $('#text-fairy-title').text(langPack.fairy.title);
    $('#fairy_fire').attr('placeholder', langPack.fairy.fire);

    $('#text-place-title').text(langPack.place.title);
    $('#buff_fire').attr('placeholder', langPack.place.fire);

    $('#text-speed-title').text(langPack.speed.title);

    $('#text-talent-title').html(langPack.talent.title);
    for (let i = 1; i <= 4; i++) {
        $('#btn-talent-'+(i-1)).text(langPack.talent['t'+ i]);
    }

    $('#text-result-title').text(langPack.result.title);

    $('#help_pic_stat').attr("src", 'img/vec/help_stat_' + selLang + '.png');
    $('#help_pic_fairy').attr("src", 'img/vec/help_fairy_' + selLang + '.png');
    $('#help_pic_buff').attr("src", 'img/vec/help_buff_' + selLang + '.png');

    $('#btn-name-fire').text(langPack.fire);

    $('#btn-help').text(langPack.qna.title);

    for (let i = 1; i <= 4; i++) {
        $('#btn-help-'+i).text(langPack.qna['q'+ i]);
        $('#btn-help-'+i+'t').html(langPack.qna['a'+ i]);
    }

    reCalc();
}
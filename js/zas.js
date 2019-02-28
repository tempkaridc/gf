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
    for(var i = 1; i < 8; i++){
        $('#btn-help-' + i).removeClass("hide");
    }
}

function btn_toggleHelp(me){
    for(var i = 1; i < 8; i++){
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

    if(dollFire < 0)    dollFire = 0;
    if(dollFire > 100)  dollFire = 100;
    if(dollRate < 0)    dollRate = 0;
    if(dollRate > 121)  dollRate = 121;
    if(fairyFire < 0)   fairyFire = 0;
    if(fairyFire > 100) fairyFire = 100;
    if(buffFire < 0)    buffFire = 0;
    if(buffFire > 100)  buffFire = 100;
    if(buffRate < 0)    buffRate = 0;
    if(buffRate > 100)  buffRate = 100;

    var finalFire = Math.ceil(Math.ceil(dollFire * (1 + (fairyFire / 100))) * (1 + (buffFire / 100)) * (0.85) + 2);
    var finalRate = Math.floor(dollRate * (1 + (buffRate / 100)));

    console.log('fire ' + finalFire);
    console.log('rate ' + finalRate);


    chkFire(finalFire);
    chkRate(finalRate);
}

function chkFire(num){
    if(isNaN(num)){dispFire(3,'화력 계산 불가');return;}

    if(area == 81){
        if(num >= 82){
            dispFire(2, '화력 만족: ' + num + ' (+' + (num - 82) + ')');
        }else{
            dispFire(0, '화력 부족: ' + num + ' (' + (num - 82) + ')');
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
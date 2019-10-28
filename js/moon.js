var list = new Array();

$( document ).ready( function()
{
    for(var y = 0; y < 24; y++){
        list.push(new Array());
        var item = '<tr>';

        for(var x = 0; x < 72; x++){
            var td =    '<td id="' + x + '-' + y + '" style="width:14px; height:14px; border: 1px solid; border-color: #ddd; position:relative;" onClick="btn_toggleCCW(this);" oncontextmenu="javascript:btn_toggleCW(this); return false;" onmouseover="mouseover(this);" onmouseout="mouseout(this);" unselectable>' +
                            '<img id="I' + x + '-' + y + '" src="img/moon/0.png" style="z-index:1; width:28px; height:28px; position:absolute; top:0px; left:0px;">' +
                        '</td>';
            item += td;
            list[y].push(0);
        }
        item += '</tr>';
        $('#table-body').append(item);
    }
    disableSelection(document.body);
});

function btn_toggleCW(me){
    var id = $(me).attr('id');
    var coord = id.split('-');
    var x = parseInt(coord[0]);
    var y = parseInt(coord[1]);

    if((x < 71) && (y < 23)){   //Clickable
        makeBlank(x, y);

        if(list[y][x] == 6)
        {list[y][x] = 0;}
        else
        {list[y][x] += 1;}

        $('#I' + x + '-' + y).attr("src",'img/moon/'+ list[y][x] +'.png');
    }
    encodeDupl();
    countb();
}

function btn_toggleCCW(me){
    var id = $(me).attr('id');
    var coord = id.split('-');
    var x = parseInt(coord[0]);
    var y = parseInt(coord[1]);

    if((x < 71) && (y < 23)){   //Clickable
        makeBlank(x, y);

        if(list[y][x] == 0)
        {list[y][x] = 6;}
        else
        {list[y][x] -= 1;}

        $('#I' + x + '-' + y).attr("src",'img/moon/'+ list[y][x] +'.png');
    }
    encodeDupl();
    countb();
}


function makeBlank(x, y){

    for(var i = -1; i < 2; i++){
        for(var j = -1; j < 2; j++){
            if(list[y+i][x+j] !== undefined){
                if(i != j){
                    list[y+i][x+j] = 0;
                }
            }
        }
    }


    /*
    list[y-1][x-1] = 0;
    list[y-1][x-0] = 0;
    list[y-1][x+1] = 0;

    list[y][x-1] = 0;
    list[y][x-0] = 0;
    list[y][x+1] = 0;

    list[y+1][x-1] = 0;
    list[y+1][x-0] = 0;
    list[y+1][x+1] = 0;
    */

    $('#I' + (x-1) + '-' + (y-1)).attr("src",'img/moon/0.png');
    $('#I' + (x+0) + '-' + (y-1)).attr("src",'img/moon/0.png');
    $('#I' + (x+1) + '-' + (y-1)).attr("src",'img/moon/0.png');

    $('#I' + (x-1) + '-' + (y+0)).attr("src",'img/moon/0.png');
    $('#I' + (x+0) + '-' + (y+0)).attr("src",'img/moon/0.png');
    $('#I' + (x+1) + '-' + (y+0)).attr("src",'img/moon/0.png');

    $('#I' + (x-1) + '-' + (y+1)).attr("src",'img/moon/0.png');
    $('#I' + (x+0) + '-' + (y+1)).attr("src",'img/moon/0.png');
    $('#I' + (x+1) + '-' + (y+1)).attr("src",'img/moon/0.png');

}

function drawbox(){
    for(var y = 0; y < 24; y++){
        for(var x = 0; x < 72; x++){
            $('#I' + x + '-' + y).attr("src",'img/moon/'+ list[y][x] +'.png');
        }
    }
}

function countb(){
    var ary = [0,0,0,0,0,0,0];

    for(var y = 0; y < 24; y++){
        for(var x = 0; x < 72; x++){
            ary[list[y][x]] += 1;
        }
    }

    //$('#num0').text(ary[0]);
    $('#num1').text(ary[1]);
    $('#num2').text(ary[2]);
    $('#num3').text(ary[3]);
    $('#num4').text(ary[4]);
    $('#num5').text(ary[5]);
    $('#num6').text(ary[6]);
    $('#sumb').text((ary[1] + ary[2] + ary[3] + ary[4] + ary[5] + ary[6]) * 300);
}

function disableSelection(target){

    if (typeof target.onselectstart!="undefined") //IE route
        target.onselectstart=function(){return false}

    else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
        target.style.MozUserSelect="none"

    else //All other route (ie: Opera)
        target.onmousedown=function(){return false}

    target.style.cursor = "default"
}

function btn_copy(){
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = document.getElementById('code').value;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert('Copied ' + t.value);
}

function btn_input(){  //DecodeDupl
    var str = document.getElementById('code').value;
    var pars = str.split(',');
    var line = new Array();
    var key;
    var loop;

    for(var i = 0; i < pars.length; i = i + 2){
        key = parseInt(pars[i]);
        loop = parseInt(pars[i+1], 16);

        for(j = 0; j < loop; j++){
            line.push(key);
        }
    }

    var t = 0;
    for(var y = 0; y < 24; y++){
        for(var x = 0; x < 72; x++){
            list[y][x] = line[t++];
        }
    }

    drawbox();
    countb();
}

function mouseover(me){
    var id = $(me).attr('id');
    var coord = id.split('-');
    var x = parseInt(coord[0]);
    var y = parseInt(coord[1]);

    var iam = new Array();
    iam.push(document.getElementById(x + '-' + y));
    iam.push(document.getElementById((x+1) + '-' + y));
    iam.push(document.getElementById(x + '-' + (y+1)));
    iam.push(document.getElementById((x+1) + '-' + (y+1)));

    for(var i = 0; i < iam.length; i++){
        iam[i].style.backgroundColor = '#ffff0055';
    }
}

function mouseout(me){
    var id = $(me).attr('id');
    var coord = id.split('-');
    var x = parseInt(coord[0]);
    var y = parseInt(coord[1]);

    var iam = new Array();
    iam.push(document.getElementById(x + '-' + y));
    iam.push(document.getElementById((x+1) + '-' + y));
    iam.push(document.getElementById(x + '-' + (y+1)));
    iam.push(document.getElementById((x+1) + '-' + (y+1)));

    for(var i = 0; i < iam.length; i++){
        iam[i].style.backgroundColor = '';
    }
}


function encodeDupl(){
    var line = new Array();
    var dupl = new Array();

    for(var y = 0; y < 24; y++){
        for(var x = 0; x < 72; x++){
            line.push(list[y][x]);
        }
    }

    var key = line[0];
    var stack = 1;

    for(var i = 1; i < 1728; i++){
        if(line[i] == key){
            stack++;
        }else{
            dupl.push(key);
            dupl.push(stack.toString(16));

            key = line[i];
            stack = 1;
        }
    }
    dupl.push(key);
    dupl.push(stack.toString(16));

    $('#code').val(dupl.toString());
}

/*
function decodeDupl(dupl){
    var key;
    var loop;
    var line = new Array();

    for(var i = 0; i < dupl.length; i = i + 2){
        key = parseInt(dupl[i]);
        loop = parseInt(dupl[i+1], 16);

        for(j = 0; j < loop; j++){
            line.push(key);
        }
    }

    var t = 0;
    for(var y = 0; y < 24; y++){
        for(var x = 0; x < 72; x++){
            list[y][x] = line[t++];
        }
    }
}
*/

var file = document.querySelector('#getfile');

file.onchange = function () {
    var fileList = file.files ;

    // 읽기
    var reader = new FileReader();
    reader.readAsDataURL(fileList [0]);

    //로드 한 후
    reader.onload = function  () {
        //썸네일 이미지 생성
        var tempImage = new Image(); //drawImage 메서드에 넣기 위해 이미지 객체화
        tempImage.src = reader.result; //data-uri를 이미지 객체에 주입
        tempImage.onload = function() {
            //리사이즈를 위해 캔버스 객체 생성
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            var ww = 72 * 9;
            var hh = 24 * 9;
            //캔버스 크기 설정
            canvas.width = ww;
            canvas.height = hh;

            //이미지를 캔버스에 그리기
            context.drawImage(this, 0, 0, ww, hh);

            var dataURI = context.getImageData(0, 0, ww, hh);

            var data = dataURI.data;

            for(var i = 0, l = data.length; i < l; i += 4 ) {
                var rgb = Math.round( ( data[ i ] + data[ i + 1 ] + data[ i + 2 ] ) / 3 );
                data[ i ]     = rgb;
                data[ i + 1 ] = rgb;
                data[ i + 2 ] = rgb;
                data[ i + 3 ] = 255;
            }

            context.putImageData( dataURI, 0, 0 );

            contrastImage(dataURI, 50); //-100 ~ 100

            console.log(dataURI);



            for(var y = 0; y < hh; y=y+3){
                for(var x = 0; x < ww; x=x+3){

                    var index = (y * dataURI.width + x) * 4;
                    var pix = new Object();
                    pix.red = dataURI.data[index];
                    pix.green = dataURI.data[index + 1];
                    pix.blue = dataURI.data[index + 2];
                    //pix.alpha = dataURI.data[index + 3];

                }
            }


        };
    };
};

function contrastImage(imageData, contrast) {  // contrast as an integer percent
    var data = imageData.data;  // original array modified, but canvas not updated
    contrast *= 2.55; // or *= 255 / 100; scale integer percent to full range
    var factor = (255 + contrast) / (255.01 - contrast);  //add .1 to avoid /0 error

    for(var i=0;i<data.length;i+=4)  //pixel values in 4-byte blocks (r,g,b,a)
    {
        data[i] = factor * (data[i] - 128) + 128;     //r value
        data[i+1] = factor * (data[i+1] - 128) + 128; //g value
        data[i+2] = factor * (data[i+2] - 128) + 128; //b value

    }
    return imageData;  //optional (e.g. for filter function chaining)
}
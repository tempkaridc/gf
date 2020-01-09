var list = new Array();
var img;
var original = [];
var ox = 0, oy = 0;
var zoom = 100;
var cache_data;
var threshold = 100;

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

    var deltaX, deltaY;
    var startingPos = [];
    var isDragging = false;
    var startDrag = false;

    $('#canvas2')
        .mousedown(function (evt) {
            startingPos = [evt.pageX, evt.pageY];
            startDrag = true;
        })
        .mousemove(function (evt) {
            if(startDrag == true){
                isDragging = true;
                if (!(evt.pageX === startingPos[0] && evt.pageY === startingPos[1])) {
                    if(isDragging == true){
                        deltaX = startingPos[0] - evt.pageX;
                        deltaY = startingPos[1] - evt.pageY;
                        move_image(parseFloat(deltaX*100/zoom), parseFloat(deltaY*100/zoom));
                    }
                }
            }

        })
        .mouseleave(function (){
            if(isDragging == true){
                ox += parseFloat(deltaX*100/zoom);
                oy += parseFloat(deltaY*100/zoom);
            }
            startDrag = false;
            isDragging = false;
            startingPos = [];
        })
        .mouseup(function () {
            if(isDragging == true){
                ox += parseFloat(deltaX*100/zoom);
                oy += parseFloat(deltaY*100/zoom);
            }
            startDrag = false;
            isDragging = false;
            startingPos = [];
        });
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
            if(list[y+i] !== undefined){
                if(list[y+i][x+j] !== undefined){
                    if(i != j){
                        list[y+i][x+j] = 0;
                    }
                }
            }
        }
    }

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

    if((x==71)||(y==23))return;

    var iam = new Array();
    iam.push(document.getElementById(x + '-' + y));
    iam.push(document.getElementById((x+1) + '-' + y));
    iam.push(document.getElementById(x + '-' + (y+1)));
    iam.push(document.getElementById((x+1) + '-' + (y+1)));

    for(var i = 0; i < iam.length; i++){
        if((iam[i] !== undefined) && (iam[i] != null)){
            iam[i].style.backgroundColor = '#ffff0055';
        }
    }
}

function mouseout(me){
    var id = $(me).attr('id');
    var coord = id.split('-');
    var x = parseInt(coord[0]);
    var y = parseInt(coord[1]);

    if((x==71)||(y==23))return;

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

    //console.log(list);

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
    console.log(dupl.toString());

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
/*
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
*/

$('#uppic').click(function (e) {e.preventDefault();$('#pic').click();});

function uploadPic(myFile){
    var reader = new FileReader();
    reader.onload = function () {
        loadImage(reader.result);
    };
    reader.readAsDataURL(myFile.files[0], 'ISO-8859-1');
}

function loadImage(file){
    img = new Image();
    //img.src = './wa.jpg';
    img.src = file;
    img.onload = setTimeout(function(e){
        var cvs1 = document.getElementById('canvas1');
        var ctx1 = cvs1.getContext("2d");
        ctx1.clearRect(0, 0, cvs1.width, cvs1.height);
        resize_image();
        },1000);
}

function resize_image(event){
    if(event !== undefined){if(event.deltaY < 0){zoom *= 1.04;}else{zoom *= 0.96;}}else{zoom *= 1};
    var cvs1 = document.getElementById('canvas1');
    var ctx1 = cvs1.getContext("2d");
    ratio = parseFloat(zoom / 100);
    var cw = img.width * 10;
    var ch = img.height * 10;
    ctx1.clearRect(0, 0, cvs1.width, cvs1.height);
    ctx1.drawImage(img,ox,oy,cw,ch,0,0,cw*ratio,ch*ratio);
    grayscale_image();
}

function move_image(x, y){
    var cvs1 = document.getElementById('canvas1');
    var ctx1 = cvs1.getContext("2d");
    ratio = parseFloat(zoom / 100);
    var cw = img.width * 10;
    var ch = img.height * 10;
    ctx1.clearRect(0, 0, cvs1.width, cvs1.height);
    ctx1.drawImage(img,ox+x,oy+y,cw,ch,0,0,cw*ratio,ch*ratio);
    grayscale_image();
}

function setLevel(val){
    threshold = val;
    grayscale_image();
}
function grayscale_image(){

    cache_data = new Array();

    backup_image();
    function backup_image(){
        var cvs1 = document.getElementById('canvas1');
        var ctx1 = cvs1.getContext('2d');
        var imageData = ctx1.getImageData(0, 0, cvs1.width, cvs1.height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            original[i] = data[i];
            original[i + 1] = data[i + 1];
            original[i + 2] = data[i + 2];
        }
    }
    var cvs1 = document.getElementById('canvas1');
    var ctx1 = cvs1.getContext("2d");
    var cvs2 = document.getElementById('canvas2');
    var ctx2 = cvs2.getContext('2d');

    var imageData = ctx1.getImageData(0, 0, cvs1.width, cvs1.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var avg = (original[i] + original[i + 1] + original[i + 2]) / 3;
        if(avg > threshold){avg = 255;}else{avg = 0;}
        data[i] = avg;      // red
        data[i + 1] = avg;  // green
        data[i + 2] = avg;  // blue
    }
    ctx2.putImageData(imageData, 0, 0);

    small_image();
}

function small_image(){
    var cvs2 = document.getElementById('canvas2');
    var cvs3 = document.getElementById('canvas3');
    var ctx3 = cvs3.getContext('2d');
    var cvs4 = document.getElementById('canvas4');
    var ctx4 = cvs4.getContext('2d');

    cvs3.width = cvs2.width / 3;
    cvs3.height = cvs2.height / 3;
    ctx3.drawImage(cvs2, 0, 0, cvs2.width, cvs2.height, 0, 0, cvs3.width, cvs3.height);

    cvs4.width = cvs2.width / 9;
    cvs4.height = cvs2.height / 9;
    ctx4.drawImage(cvs2, 0, 0, cvs2.width, cvs2.height, 0, 0, cvs4.width, cvs4.height);

    preview_image();

    cache_data = new Array();
    var imageData = ctx3.getImageData(0, 0, cvs3.width, cvs3.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        cache_data.push(data[i]);
    }
}

function preview_image(){
    var cvs4 = document.getElementById('canvas4');
    var cvs5 = document.getElementById('canvas5');
    var ctx5 = cvs5.getContext('2d');
    cvs5.width = cvs4.width * 9;
    cvs5.height = cvs4.height * 9;
    ctx5.drawImage(cvs4, 0, 0, cvs4.width, cvs4.height, 0, 0, cvs5.width, cvs5.height);
}

var x1 = 108, y1 = 36;
var x3 = 36, y3 = 12;

function make3x3cell(){
    var normalArray = cache_data;
    //console.log(normalArray);

    var cell_1x1 = new Array();
    var cell_3x3 = new Array();
    for(var y = 0; y < 36; y++){cell_1x1.push(new Array(108));}
    for(var y = 0; y < 12; y++){cell_3x3.push(new Array(36));}

    //cell_1x1
    var i = 0;
    for(var y = 0; y < 36; y++){
        for(var x = 0; x < 108; x++){
            cell_1x1[y][x] = normalArray[i++];
        }
    }
    //console.log(cell_1x1);

    //cell_3x3
    var cx = 0; cy = 0;
    for(var y = 0; y < 36; y += 3){
        for(var x = 0; x < 108; x += 3){
            cell_3x3[cy][cx] = [
                cell_1x1[y][x], cell_1x1[y][x+1], cell_1x1[y][x+2],
                cell_1x1[y+1][x], cell_1x1[y+1][x+1], cell_1x1[y+1][x+2],
                cell_1x1[y+2][x], cell_1x1[y+2][x+1], cell_1x1[y+2][x+2]
            ];
            cx++;
        }
        cx = 0;
        cy++;
        if(cy > 11) break;
    }

    for(var y = 0; y < 12; y++){
        for(var x = 0; x < 36; x++){
            for(var i = 0; i < 9; i++){
                if(cell_3x3[y][x][i] == 255)
                    cell_3x3[y][x][i] = 1;
            }
        }
    }

    compareCell(cell_3x3);
}

function compareCell(input){
    const blocks = [
        // 0: Blank
        [1,1,1,
            1,1,1,
            1,1,1],
        // 1:
        [0,0,0,
            0,0,0,
            0,0,0],
        // 2:
        [0,0,0,
            0,1,0,
            0,0,0],
        // 3:
        [0,1,1,
            0,0,1,
            0,0,0],
        // 4:
        [0,0,0,
            0,0,1,
            0,1,1],
        // 5:
        [0,0,0,
            1,0,0,
            1,1,0],
        // 6:
        [1,1,0,
            1,0,0,
            0,0,0],
    ];

    var result = new Array(24);
    for(var i = 0; i < 24; i++){result[i] = new Array(72).fill(0);}

    //36x12
    for(var y = 0; y < 12; y++){
        for(var x = 0; x < 36; x++){
            var obj = new Object();
            obj.top = 0;
            obj.idx = 0;
            //Type Loop
            for(var t = 0; t < 7; t++){
                var sum_score = 0;
                for(var i = 0; i < 9; i++){
                    if(input[y][x][i] == blocks[t][i]){
                        sum_score += 1;
                    }
                }
                if(sum_score > obj.top){
                    obj.top = sum_score;
                    obj.idx = t;
                }
            }
            //console.log(top_score);
            result[y*2][x*2] = obj.idx;
        }
    }
    encodeDupl2(result);


}

function encodeDupl2(list){
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
    $('#inputbtn').click();
}
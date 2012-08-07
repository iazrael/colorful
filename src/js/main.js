(function(){
    var $ = window.$ || function(id){
        return document.getElementById(id);
    }

     /**
     * 把图像变成黑白色
     * Y = 0.299R + 0.587G + 0.114B
     * @param  {Array} pixes pix array
     * @return {Array}
     * @link {http://www.61ic.com/Article/DaVinci/DM64X/200804/19645.html}
     */
    function discolor(pixes) {
        var grayscale;
        for (var i = 0, len = pixes.length; i < len; i += 4) {
            grayscale = pixes[i] * 0.299 + pixes[i + 1] * 0.587 + pixes[i + 2] * 0.114;
            pixes[i] = pixes[i + 1] = pixes[i + 2] = grayscale;
        }
        return pixes;
    }

    var canvas = $('canvas'),
        dropper = $('dropper'),

        ctx = canvas.getContext('2d'),

        backupCanvas = document.createElement('canvas'),
        backupCtx = backupCanvas.getContext('2d');

        colorArea = [];

    function drawImage(img){
        var width = canvas.width, height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        backupCanvas.width = width, backupCanvas.height = height;
        backupCtx.drawImage(img, 0, 0, width, height);
    }

    function drawColor(){
        var imgData = backupCtx.getImageData(0, 0, canvas.width, canvas.height),
            pixes = imgData.data;
        var grayscale;
        for (var i = 0, len = pixes.length; i < len; i += 4) {
            if(colorArea[i / 4]){
                continue;
            }
            grayscale = pixes[i] * 0.299 + pixes[i + 1] * 0.587 + pixes[i + 2] * 0.114;
            pixes[i] = pixes[i + 1] = pixes[i + 2] = grayscale;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    function setColorPix(x, y, brush){
        var index, width = canvas.width, height = canvas.height;
        var x1 = x - brush, y1 = y - brush, x2 = x + brush, y2 = y + brush;
        if(x1 < 0){ x1 = 0; }
        if(x2 > width){ x2 = width; }
        if(y1 < 0){ y1 = 0; }
        if(y2 > height){ y2 = height; }
        for(var x = x1; x <= x2; x++){
            for(var y = y1; y<= y2; y++){
                index = y * width + x;
                colorArea[index] = 1;
            }
        }
    }

    dropper.addEventListener('drop', function(e){
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
            var img = new Image();
            img.onload = function(){
                drawImage(this);
            }
            img.src = e.target.result;
        }
        reader.onerror = function(e){
            var code = e.target.error.code;
            if(code === 2){
                alert('please don\'t open this page using protocol fill:///');
            }else{
                alert('error code: ' + code);
            }
        }
        reader.readAsDataURL(file);
    });
    dropper.addEventListener('dragover', function(e){
        e.preventDefault();
    });

    var catchingMouse = false;
    dropper.addEventListener('mousedown', function(e){
        if(e.which === 1){
            catchingMouse = true;
            console.log('start');
        }
    });
    dropper.addEventListener('mouseup', function(e){
        if(!catchingMouse){
            return;
        }
        catchingMouse = false;
        console.log('end');
        drawColor();
    });
    dropper.addEventListener('mouseout', function(e){
        if(!catchingMouse){
            return;
        }
        catchingMouse = false;
        console.log('out->end');
        drawColor();
    });
    dropper.addEventListener('mousemove', function(e){
        if(!catchingMouse){
            return;
        }
        var rect = canvas.getBoundingClientRect();
        var x = e.pageX - rect.left, y = e.pageY - rect.top;
        var brush = 10;
        setColorPix(x, y, brush);
    });
    
})();
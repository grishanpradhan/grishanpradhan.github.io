function openImage(){
    
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpg';


    input.addEventListener('change', function(event){
        var selectedFile=event.target.files[0];

        if (selectedFile){
            
            console.log('Selected file:', selectedFile, '\n' , 'File type:', selectedFile.type, '\n');

            var reader = new FileReader();

            reader.onload = function(e){
                const srcImg = e.target.result;

                // console.log('srcImg:',srcImg);

                let canvas = document.createElement('canvas');

                canvas.setAttribute('id','myCanvas');

                document.body.appendChild(canvas);
                
                let context = canvas.getContext('2d');

                var img= new Image();

                img.onload = function(){

                    console.log(img.width,img.height);

                    canvasWidth = img.width;
                    canvasHeight = img.height;

                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    console.log(img);

                    context.drawImage(img, 0, 0, canvasWidth, canvasHeight);

                    var imageData = context.getImageData(0,0,canvasWidth,canvasHeight);

                    var pixelData = imageData.data;


                    console.log(pixelData.length);
                    console.log('The pixel data:', pixelData);
                    const x = new Uint32Array(pixelData.buffer);
                    console.log(x);

                }
                // img.src = "pic.jpg"
                const objectURL = URL.createObjectURL(selectedFile);
                console.log(objectURL);
                img.src=objectURL;
                console.log(img.width);

            }
            reader.readAsDataURL(selectedFile);
        }
    });
    
    input.click();
}
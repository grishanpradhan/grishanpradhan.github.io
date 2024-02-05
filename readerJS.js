function openImage(){
    
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg';


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

                img.onload = async function(e){

                    const theURL = e.target.src;

                    console.log(img.width,img.height);

                    canvasWidth = img.width;
                    canvasHeight = img.height;

                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    const resp = await fetch(theURL);
                    const _image_ = await resp.blob();
                    const image_ = await createImageBitmap(_image_, {
                        colorSpaceConversion: "none"
                    });
                    
                    context.drawImage(image_, 0, 0, canvasWidth, canvasHeight);

                    var imageData = context.getImageData(0,0,canvasWidth,canvasHeight);

                    var pixelData = imageData.data;

                    console.log(pixelData.length);
                    console.log('The pixel data:', pixelData);
                    const colorRGBA = new Uint32Array(pixelData.buffer);
                    console.log(colorRGBA);

                    var count=0;
                    var uniqueColorCollection = [];
                    for(i=0;i<colorRGBA.length;i++){
                        if (!uniqueColorCollection.includes(colorRGBA[i])){
                            count++;
                            uniqueColorCollection.push(colorRGBA[i]);
                        }
                    }

                    console.log('colorRGBA count:', colorRGBA.length,'\n Number of unique colors in the given image:',count,'\n uniqueColorCollection:', uniqueColorCollection);   

                    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
                    const request = indexedDB.open("ImgDB",1);

                    request.onerror=function(event){
                        console.error("An error occurred with opening IndexedDB");
                        console.error(event);
                    };

                    request.onupgradeneeded = (event)=>{ //executes when version number is upgraded
                        //only place where you can alter the structure of the database.
                        const db=request.result;
                        console.log(db);
                        console.log('onUpgradeneeded just ran');
                        db.createObjectStore("Image", {keyPath: "id"});
                    };

                    request.onsuccess =  (event) => {
                        const db=event.target.result;

                        const transaction=db.transaction("Image","readwrite");

                        const store = transaction.objectStore("Image");

                        const request = store.put({id:'colorRGBA', colorRGBA});

                        request.onsuccess = function(event) {
                            console.log('Image added to IndexedDB');
                        };
                        transaction.oncomplete = function(){
                            db.close();
                        };
                    };

                    // function addtoIDB(){
                        
                    // }

                }
                // img.src = "pic.jpg"
                const objectURL = URL.createObjectURL(selectedFile);
                console.log('objectURL', objectURL);
                img.src=objectURL;
                console.log(img.width);

            }
            reader.readAsDataURL(selectedFile);
        }
    });
    
    input.click();
}
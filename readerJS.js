function openImage(){
    
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';


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

                    console.log('image width:',img.width,'\n image height:',img.height);

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

                    console.log(imageData);

                    var pixelData = imageData.data; //stores in array the R, G, B and A values of an image separately

                    console.log('pixelData length:',pixelData.length);
                    console.log('The pixel data:', pixelData);
                    const colorRGBA = new Uint32Array(pixelData.buffer); //pixelData converted to 32-bit arrays
                    console.log('The list of colors in RGBA:',colorRGBA);


                    console.time();
                    // var count=0;
                    var uniqueColorCollection = []; //stores the unique colors found in the image
                    var uniqueColorCounts = []; //counts the number of colors for respective colors in the uniqueColorCollection
                    var imageColorInfo=[]; //stores the index of color instead of pixels information
                    var currentColor, lastColor;
                    var lastIndex = 0; //index for uniqueColorCollection, and cannot exceed 255
                    currentColor = colorRGBA[0];
                    uniqueColorCollection.push(currentColor);
                    uniqueColorCounts[0]=1;
                    lastColor = currentColor;
                    imageColorInfo[0] = lastIndex;
                    for(i=1;i<colorRGBA.length;i++){
                        currentColor = colorRGBA[i];
                        if (lastColor != currentColor)
                        {
                            var index = uniqueColorCollection.indexOf(currentColor);
                            if (index==-1)
                            {
                                // console.log('Here');
                                uniqueColorCollection.push(currentColor);
                                uniqueColorCounts.push(1);
                                lastIndex = uniqueColorCollection.length-1;
                                if (lastIndex>=255)
                                    break;
                            }
                            else
                            {
                                lastIndex = index;
                                uniqueColorCounts[lastIndex]++;
                            }
                            lastColor=currentColor;
                        }
                        else
                        {
                            uniqueColorCounts[lastIndex]++;
                        }
                        imageColorInfo[i] = lastIndex;
                    }

                    console.log('Time for imageColorInfo and uniqueColorCount:') 
                    console.timeEnd();

                    console.log('image pixel information:', imageColorInfo);

                    console.log('Number of unique colors in the given image:',uniqueColorCounts.length,'\n uniqueColorCollection:', uniqueColorCollection, '\n uniqueColorCounts',uniqueColorCounts);   

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

                        console.time();
                        const request1 = store.put({id: 'The colors', uniqueColorCollection});
                        const request2 = store.put({id: 'The imageColorInfo', imageColorInfo});
                        console.timeEnd();
                        request1.onsuccess = function(event) {
                            console.log('Unique Colors from the image has been added to IndexedDB');
                        };
                        request2.onsuccess = function(event) {
                            console.log('imageColorInfo added to IndexedDB');
                        };
                        transaction.oncomplete = function(){
                            db.close();
                        };
                    };
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
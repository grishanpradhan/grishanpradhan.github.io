
/*Open mage button */
function openImage() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png'; // Allow only PNG images

    input.addEventListener('change', function(event){
        var selectedFile=event.target.files[0];

        if (selectedFile){
            
            console.log('Selected file:', selectedFile);

            var reader = new FileReader();

            reader.onload = function(e){
                const binaryString = e.target.result;
                console.log('Array Buffer Content: ',binaryString);

                const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

                const request = indexedDB.open("ImgDB",1);

                request.onerror=function(event){
                    console.error("An error occurred with IndexedDB");
                    console.error(event);
                };

                request.onupgradeneeded = (event)=>{ //executes when version number is upgraded
                    // const db = event.target.result;
                    const db=request.result;
                    console.log(db);
                    db.createObjectStore("Image", {keyPath:"id"});
                };

                request.onsuccess =  (event) => {
                    const db=event.target.result;
                    const transaction=db.transaction("Image","readwrite");

                    const store = transaction.objectStore("Image");

                    const request = store.put({id:1, binaryString});

                    request.onsuccess = function(event) {
                        console.log('Image added to IndexedDB');
                    };
                    transaction.oncomplete = function(){
                        db.close();
                    };
                };
            };
            
            reader.readAsArrayBuffer(selectedFile);
            // reader.readAsDataURL(selectedFile);
        }
    });
    input.click();
}


/*Display image button */
function displayImage() {
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    const req = indexedDB.open("ImgDB", 1);


    req.onsuccess= function(event){
        const db=event.target.result;

        try{
            const transaction=db.transaction("Image","readonly");
            const store = transaction.objectStore("Image");

            const getRequest = store.get(1);

            getRequest.onsuccess = function (event) {
                
                const imageData = event.target.result.binaryString;

                const blob = new Blob([imageData], { type: "image/png" });

                const objectURL = URL.createObjectURL(blob);

                const imgElement = new Image();
                imgElement.src = objectURL;
                console.log(imgElement.src);

                document.getElementById("display").appendChild(imgElement);

                db.close();
            };

            transaction.oncomplete = function() {
                console.log('Image successfully retrieved');
            };
        } catch(error) {
            console.log("HERE");
            const delReq = indexedDB.deleteDatabase("ImgDB");
            console.log(delReq);
        }
    }
}

/* save the image */
async function saveImage(){
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    const request = indexedDB.open("ImgDB");

    request.onerror = function (event) {
        console.error("An error occurred with IndexedDB");
        console.error(event);
    };

    request.onsuccess = function (event) {
        const db = event.target.result;

    try{
            const transaction = db.transaction("Image", "readonly");
            const store = transaction.objectStore("Image");

            const getRequest = store.get(1);

            getRequest.onsuccess = function (event) {
                
                const imageData = event.target.result.binaryString;

                const blob = new Blob([imageData], { type: "image/png" });

                saveAs(blob, "image.png");

                db.close();
            };

            transaction.oncomplete = function() {
                console.log('Image successfully saved');
            };
        } catch(error) {
            const delReq = indexedDB.deleteDatabase("ImgDB");
            console.log(delReq);
        }
    };
}


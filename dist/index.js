function openImage() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png";
    input.addEventListener("change", function (event) {
        var selectedFile = event.target.files[0];
        if (selectedFile) {
            // console.log(
            //   "Selected file:",
            //   selectedFile,
            //   "\n",
            //   "File type:",
            //   selectedFile.type,
            //   "\n"
            // );
            var reader = new FileReader();
            reader.onload = function (e) {
                const srcImg = e.target.result;
                // console.log('srcImg:',srcImg);
                let canvas = document.createElement("canvas");
                canvas.setAttribute("id", "myCanvas");
                document.body.appendChild(canvas);
                let context = canvas.getContext("2d");
                var img = new Image();
                img.onload = async function (e) {
                    const theURL = e.target.src;
                    console.log("image width:", img.width, "\n image height:", img.height);
                    let canvasWidth = img.width;
                    let canvasHeight = img.height;
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    const resp = await fetch(theURL);
                    const _image_ = await resp.blob();
                    const image_ = await createImageBitmap(_image_, {
                        colorSpaceConversion: "none",
                    });
                    context.drawImage(image_, 0, 0, canvasWidth, canvasHeight);
                    var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
                    // console.log(imageData);
                    var pixelData = imageData.data; //stores in array the R, G, B and A values of an image separately
                    // console.log('pixelData length:',pixelData.length);
                    console.log("The pixel data:", pixelData);
                    const colorRGBA = new Uint32Array(pixelData.buffer); //pixelData converted to 32-bit arrays
                    console.log("The list of colors in RGBA:", colorRGBA);
                    class usedColor {
                        constructor() {
                            this.color = 0;
                            this.colorName = "";
                            this.knots = 0;
                            this.cuts = 0;
                            this.material = 1;
                            this.pileHeight = 50;
                            this.area = 0;
                        }
                    }
                    // console.time();
                    var indexArray = []; //index image
                    const uniqueColorCounts = []; //counts the number of colors for respective colors in the uniqueColorCollection
                    var imageColorInfo = []; //stores the index of color instead of pixels information
                    var currentColor, lastColor;
                    var lastIndex = 0; //index for uniqueColorCollection, and cannot exceed 255
                    currentColor = colorRGBA[0];
                    indexArray.push(currentColor);
                    uniqueColorCounts[0] = { color: currentColor, knots: 1, cuts: 0 };
                    lastColor = currentColor;
                    imageColorInfo[0] = lastIndex; //index image
                    var i = 0;
                    var totalKnots = 0;
                    var totalCuts = 0;
                    var cutsUpdated;
                    for (var y = 0; y < canvasHeight; y++) {
                        for (var x = 0; x < canvasWidth; x++) {
                            cutsUpdated = false;
                            currentColor = colorRGBA[i];
                            if (lastColor != currentColor) {
                                uniqueColorCounts[lastIndex].cuts++;
                                // totalCuts++;
                                /*(console.log(
                                  "if lastColor!=currentColor",
                                  uniqueColorCounts[lastIndex].color,
                                  uniqueColorCounts[lastIndex].cuts
                                );*/
                                cutsUpdated = true;
                                var index = indexArray.indexOf(currentColor);
                                if (index == -1) {
                                    indexArray.push(currentColor);
                                    uniqueColorCounts.push({
                                        color: currentColor,
                                        knots: 1,
                                        cuts: 0,
                                    });
                                    lastIndex = indexArray.length - 1;
                                    if (lastIndex >= 255)
                                        break;
                                }
                                else {
                                    lastIndex = index;
                                    // uniqueColorCounts[lastIndex].cuts++;
                                    // console.log(
                                    //   "if the color exists but not last color",
                                    //   uniqueColorCounts[lastIndex].color,
                                    //   uniqueColorCounts[lastIndex].cuts
                                    // );
                                    uniqueColorCounts[lastIndex].knots++;
                                    // totalKnots++;
                                }
                                lastColor = currentColor;
                            }
                            else {
                                uniqueColorCounts[lastIndex].knots++;
                                // totalKnots++;
                            }
                            imageColorInfo[i] = lastIndex;
                            i++;
                        }
                        if (!cutsUpdated) {
                            uniqueColorCounts[lastIndex].cuts++;
                            // totalCuts++;
                            /*console.log(
                              "if edge:",
                              uniqueColorCounts[lastIndex].color,
                              uniqueColorCounts[lastIndex].cuts,
                              cutsUpdated
                            );*/
                        }
                    }
                    uniqueColorCounts[0].knots--;
                    // totalKnots--;
                    // if (!cutsUpdated) {
                    //   uniqueColorCounts[lastIndex].cuts++;
                    //   console.log(
                    //     "if cuts not updated (outside loop)",
                    //     uniqueColorCounts[lastIndex].color,
                    //     uniqueColorCounts[lastIndex].cuts
                    //   );
                    // }
                    // uniqueColorCounts[lastIndex].cuts++;
                    // console.log(
                    //   "last index cut:",
                    //   uniqueColorCounts[lastIndex].color,
                    //   uniqueColorCounts[lastIndex].cuts
                    // );
                    /*if (uniqueColorCounts[lastIndex].knots == 1) {
                      uniqueColorCounts[lastIndex].cuts++;
                      console.log(
                        "if last knot",
                        uniqueColorCounts[lastIndex].color,
                        uniqueColorCounts[lastIndex].cuts
                      );
                    }*/
                    // console.log("indexArray", indexArray);
                    // console.log("image pixel information:", imageColorInfo);
                    // console.log(
                    //   "Number of unique colors in the given image:",
                    //   uniqueColorCounts.length,
                    //   "\n index Array:",
                    //   indexArray,
                    //   "\n uniqueColorCounts",
                    //   uniqueColorCounts
                    // );
                    //calculating the knots and cuts for the carpets
                    for (var m = 0; m < indexArray.length; m++) {
                        // console.log("1", uniqueColorCounts[m].color);
                        // console.log("2", (uniqueColorCounts[m].color >>> 24) & 0xff);
                        // console.log("3", ((uniqueColorCounts[m].color >>> 24) & 0xff) == 0);
                        if (((uniqueColorCounts[m].color >>> 24) & 0xff) != 0) {
                            totalKnots += uniqueColorCounts[m].knots;
                            totalCuts += uniqueColorCounts[m].cuts;
                        }
                    }
                    const knotsPerInch = 10;
                    const linesPerInch = 10;
                    //height and width in feet
                    var width = canvasWidth / (knotsPerInch * 12);
                    var height = canvasHeight / (linesPerInch * 12);
                    const area = height * width;
                    /*
                    //Print on console
                    console.log("Width:", width, "ft.");
                    console.log("Height:", height, "ft.");
                    console.log("Area:", area, "sq. ft.");
                    console.log("KPU:", knotsPerInch, "/ inch");
                    console.log("LPU:", linesPerInch, "/ inch");
                    console.log("Knots: ", totalKnots);
                    console.log("Cuts: ", totalCuts);
                    console.log("Ratio: ", (totalCuts / totalKnots) * 100, "%");*/
                    for (var i = 0; i < indexArray.length; i++) {
                        uniqueColorCounts[i].area =
                            (uniqueColorCounts[i].knots / totalKnots) * 100;
                        console.log("area of color:", uniqueColorCounts[i].color, "=", uniqueColorCounts[i].area, "\n", "knots on Rug for color", uniqueColorCounts[i].color, "=", uniqueColorCounts[i].knots, "\n", "cuts on Rug for Color:", "=", uniqueColorCounts[i].cuts);
                    }
                    console.log(uniqueColorCounts);
                    //MATERIAL ESTIMATION
                    var nameEl = document.getElementById("Name");
                    var widthEl = document.getElementById("Width");
                    var lengthEl = document.getElementById("Length");
                    var areaEl = document.getElementById("Area");
                    var kpuEl = document.getElementById("KPU");
                    var lpuEl = document.getElementById("LPU");
                    var knotsEl = document.getElementById("Knots");
                    var cutsEl = document.getElementById("Cuts");
                    var ratioEl = document.getElementById("Ratio");
                    nameEl.textContent = "Name: " + selectedFile.name;
                    widthEl.textContent = "Width: " + canvasWidth + " ft.";
                    lengthEl.innerHTML = "Height: " + canvasHeight + " ft.";
                    areaEl.innerHTML = "Area: " + area + " sq. ft.";
                    kpuEl.innerHTML = "KPU: " + knotsPerInch + " / inch";
                    lpuEl.innerHTML = "LPU: " + linesPerInch + " / inch";
                    knotsEl.innerHTML = "Knots: " + totalKnots;
                    cutsEl.innerHTML = "Cuts: " + totalCuts;
                    ratioEl.innerHTML =
                        "Ratio: " + ((totalCuts / totalKnots) * 100).toFixed(2) + " %";
                    var table1 = document.getElementById("table1");
                    var table2 = document.getElementById("table2");
                    // var newRow = document.createElement("tr");
                    for (var i = 0; i < indexArray.length; i++) {
                        if (((uniqueColorCounts[i].color >>> 24) & 0xff) != 0) {
                            // var cell = document.createEleme1nt("td");
                            // cell.textContent = uniqueColorCounts[i].color;
                            var table1Row = table1.insertRow();
                            var Color = table1Row.insertCell(0);
                            var Code = table1Row.insertCell(1);
                            var Material = table1Row.insertCell(2);
                            var Area = table1Row.insertCell(3);
                            var Consumption_on_Rug = table1Row.insertCell(4);
                            Color.innerHTML = uniqueColorCounts[i].color.toString();
                            Code.innerHTML = "CODE";
                            Material.innerHTML = "WOOL";
                            Area.innerHTML = uniqueColorCounts[i].area.toFixed(2);
                            Consumption_on_Rug.innerHTML = "N/A";
                            var table2Row = table2.insertRow();
                            var knotsonRug = table2Row.insertCell(0);
                            var cutsOnRugs = table2Row.insertCell(1);
                            var cutsWastage = table2Row.insertCell(2);
                            var consumptionIncCuts = table2Row.insertCell(3);
                            var distribution = table2Row.insertCell(4);
                            var DistExcessPerc = table2Row.insertCell(5);
                            knotsonRug.innerHTML = uniqueColorCounts[i].knots.toString();
                            cutsOnRugs.innerHTML = uniqueColorCounts[i].cuts.toString();
                            cutsWastage.innerHTML = "N/A";
                            consumptionIncCuts.innerHTML = "N/A";
                            distribution.innerHTML = "N/A";
                            DistExcessPerc.innerHTML = "N/A";
                        }
                    }
                    // IndexedDB
                    const indexedDB = window.indexedDB ||
                        window.mozIndexedDB ||
                        window.webkitIndexedDB ||
                        window.msIndexedDB ||
                        window.shimIndexedDB;
                    const request = indexedDB.open("ImgDB", 1);
                    request.onerror = function (event) {
                        console.error("An error occurred with opening IndexedDB");
                        console.error(event);
                    };
                    request.onupgradeneeded = (event) => {
                        //executes when version number is upgraded
                        //only place where you can alter the structure of the database.
                        const db = request.result;
                        console.log(db);
                        console.log("onUpgradeneeded just ran");
                        db.createObjectStore("Image", { keyPath: "id" });
                    };
                    request.onsuccess = (event) => {
                        const db = event.target.result;
                        const transaction = db.transaction("Image", "readwrite");
                        const store = transaction.objectStore("Image");
                        console.time();
                        const request1 = store.put({
                            id: "The colors",
                            uniqueColorCollection: indexArray,
                        });
                        const request2 = store.put({
                            id: "The imageColorInfo",
                            imageColorInfo,
                        });
                        console.timeEnd();
                        request1.onsuccess = function (event) {
                            console.log("Unique Colors from the image has been added to IndexedDB");
                        };
                        request2.onsuccess = function (event) {
                            console.log("imageColorInfo added to IndexedDB");
                        };
                        transaction.oncomplete = function () {
                            db.close();
                        };
                    };
                };
                // img.src = "pic.jpg"
                const objectURL = URL.createObjectURL(selectedFile);
                console.log("objectURL", objectURL);
                img.src = objectURL;
                console.log(img.width);
            };
            reader.readAsDataURL(selectedFile);
        }
    });
    input.click();
}
function saveImage() {
    var button = document.createElement("button");
    button.addEventListener("click", function () {
        console.log("Button clicked");
    });
    button.click();
}

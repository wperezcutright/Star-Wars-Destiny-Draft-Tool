function printList(){
var myFileList = document.getElementById("fileInput").files; //define "array" of files

if (myFileList.length == 0){ //if no file was uploaded use default on server obtained through AJAX call
$.ajax({
url: 'swdestiny2ofeverything.csv',
dataType: "text",
success: function (data){
var twoDimArray = CSVtoJSON(data); //create array of objects with file data
var filteredArray = filterSets(twoDimArray);
var finalArray = sortAndSelect(filteredArray);
addToPage(finalArray);
}
});
}
else if (myFileList.length == 1){ //check for uploaded file
var readString;
var file = myFileList[0],
    read = new FileReader();

read.readAsText(file);

read.onloadend = function(){
    readString = read.result;
var twoDimArray = CSVtoJSON(readString); //create array of objects with file data
var filteredArray = filterSets(twoDimArray);
var finalArray = sortAndSelect(filteredArray);
addToPage(finalArray);
}
}
else {
alert("Please select only one CSV file.");
}
}

function CSVtoJSON(csv){ //function to convert data to JSON
var lines = csv.split("\n"); //defines array that contains each line as an element
var result = new Array(); //defines array of objects
var headers = lines[0].split(","); //array for CSV header info

for (var i=1; i < lines.length; i++){ //loops through CSV data past header
var obj = {}; // new object
var currentLine = lines[i].split(","); //defines array for current line of data
for (var j=0; j < headers.length; j++){
obj[headers[j]] = currentLine[j]; //associates a value with corresponding header for use in object
}
result.push(obj);
}
return result;
}

function filterSets(objectArray){ //filter array of objects by selected set
var filtered = new Array();
var setCode = $('input[name=set]:checked').val(); //code of set chosen
var maxQuantity = $('input[id=dupesAllowed]').val(); //maximum number of copies of cards that can be drafted
var numberOwned;
var setName;
switch (setCode){
case "awk":
setName = "Awakenings";
break;
case "sor":
setName = "Spirit of Rebellion";
break;
case "eaw":
setName = "Empire at War";
break;
case "leg":
setName = "Legacies";
break;
case "wof":
setName = "Way of the Force";
break;
case "atg":
setName = "Across the Galaxy";
break;
case "con":
setName = "Convergence";
break;
case "soh":
setName = "Spark of Hope";
break;
case "cvm":
setName = "Covert Missions";
break;
default:
alert("Set code mismatch. Please check the spelling and cases of the set names in your CSV file.");
}
for (i=0; i < objectArray.length; i++){
if (setName == objectArray[i].Set){
if (objectArray[i]["Has die"] == "TRUE") {
for (j=0; j < Math.min(Math.min(parseInt(objectArray[i].Cards, 10), parseInt(objectArray[i].Dice, 10)), maxQuantity); j++){ //add a card to the array as many times as there are copies (or max allowed)
filtered.push(objectArray[i]); //adds cards to filtered array
}
}
else {
for (j=0; j < Math.min(parseInt(objectArray[i].Cards, 10), maxQuantity); j++){ //add a card to the array as many times as there are copies (or max allowed)
filtered.push(objectArray[i]); //adds cards to filtered array
}
}
}
}
return filtered;
}

function sortAndSelect(unsorted){
var packsNeeded = parseInt($('input[name=packs]:checked').val(), 10);
var diceArray = new Array(); //declare arrays
var uncommonArray = new Array();
var commonArray = new Array();
var selectedArray = new Array();
var enoughCards = true;
var legendaryCounter = 0;
var currentIndex;

for (i = 0; i < unsorted.length; i++){ //sort cards into arrays by rarity
if (unsorted[i].Rarity == "Legendary" || unsorted[i].Rarity == "Rare"){
diceArray.push(unsorted[i]);
}
else if (unsorted[i].Rarity == "Uncommon"){
uncommonArray.push(unsorted[i]);
}
else if (unsorted[i].Rarity == "Common"){
commonArray.push(unsorted[i]);
}
else if (unsorted[i].Rarity == "Starter"){ //do nothing with Starter cards
}
else {
console.log("Rarity mismatch. Please check the spelling and cases of the rarity names in your CSV file.");
}
}

if (diceArray.length < packsNeeded){
enoughCards = false;
alert("Not enough dice cards for this format. You need " + (packsNeeded - diceArray.length) + " more cards.")
}
if ((6 + countRares(diceArray)) < packsNeeded){
enoughCards = false;
alert("Not enough non-Legendary dice cards for this format. You need " + (packsNeeded - diceArray.length) + " more cards.")
}
if (uncommonArray.length < packsNeeded){
enoughCards = false;
alert("Not enough Uncommon cards for this format. You need " + (packsNeeded - commonArray.length) + " more cards.")
}
if (commonArray.length < (3 * packsNeeded)){
enoughCards = false;
alert("Not enough Common cards for this format. You need " + ((3 * packsNeeded) - commonArray.length) + " more cards.")
}

if (enoughCards){
for (i = 0; i < packsNeeded; i++){
if (legendaryCounter < 6){ //only 6 Legendary cards allowed
currentIndex = Math.floor(Math.random()*diceArray.length);
if (diceArray[currentIndex].Rarity == "Legendary"){ //keep count of Legendary cards
legendaryCounter++;
}
selectedArray.push(diceArray[currentIndex]);
diceArray.splice(currentIndex, 1);
}
else { //no more Legendaries allowed
currentIndex = Math.floor(Math.random()*diceArray.length);
if (diceArray[currentIndex].Rarity == "Rare"){ //only add Rare cards
selectedArray.push(diceArray[currentIndex]);
}
diceArray.splice(currentIndex, 1);
}

currentIndex = Math.floor(Math.random()*uncommonArray.length);
selectedArray.push(uncommonArray[currentIndex]);
uncommonArray.splice(currentIndex, 1);

for (j = 0; j < 3; j++){ //add 3 Common cards
currentIndex = Math.floor(Math.random()*commonArray.length);
selectedArray.push(commonArray[currentIndex]);
commonArray.splice(currentIndex, 1);
}
}
}

return selectedArray;
}

function countRares(diceCards){
var counter = 0;
for (i = 0; i < diceCards.length; i++){
if (diceCards[i].Rarity == "Rare"){
counter ++;
}
}
return counter;
}

function addToPage(publishArray){
var displayString = "";
var packsNeeded = parseInt($('input[name=packs]:checked').val(), 10);
var addedElement = document.getElementById("textResult");
if(typeof(addedElement) != 'undefined' && addedElement != null)
    {
        addedElement.remove();
    }
var stringified = JSON.stringify(publishArray);
publishArray = JSON.parse(stringified.split('"#":').join('"Number":')); //effectively replaces "#" with "Number" in the JSON
for (i = 0; i < (packsNeeded * 5); i++){ //add info to string for publication
if (publishArray[i] != "undefined" && publishArray[i] != null) {
displayString = displayString + publishArray[i].Set + '\t' + publishArray[i].Number + '\t' + publishArray[i].Name + '\n';
}
}

var newElement = document.createElement("textarea");
newElement.style.width = "80%";
newElement.style.height = "40%";
newElement.innerHTML = displayString; 
newElement.id = "textResult";
if (displayString != "") {
document.getElementById("configureBox").append(newElement);
}
}

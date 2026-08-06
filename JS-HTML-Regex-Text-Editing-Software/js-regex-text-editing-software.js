// JS RegEx Text Editing Software

alert("JS RegEx Text Editing Software")

var text;

while (text == null) {

    text = prompt("Insert Text: ")

}

alert(`Text has ${text.length} characters.`)


while (true) { // While true loop

var command = prompt(`
    \nCommands/Keywords
    \nWrite - Write Text
    \nSearch - Search Text
    \nDelete - Delete Text
    \nErase - Erase All
    \nFlip - Flip Text
    \nReplace - Replace
    \nQuit - Quit 
    \nRNG - Random Text
    \nEnter Command`)

if (command.match(/write/i)) { // Adding Text
   
    var writeText = prompt("Write Text: ")

    text += writeText

    alert(`Edited Text:
    \n${text}`)

} else if (command.match(/search/i)) { // Searching Text
     

    var searchChoice = prompt("Do you want to use Regex Search? (y/n)")
    
    if (searchChoice.match(/y/i)) {
        
        var searchText = prompt("Search Text, Global and CaseIgnore flags are already supported.")

        searchText =  RegExp(searchText, "gi")

    } else {

        var searchText = prompt("Search Text")

    }

    var searchResult = text.match(searchText) // Finding and returning text results

    if (searchResult) {

        alert(`Text Found: ${searchResult.length}`)
        
        alert(text)

    } else {

        alert(`0 Results for:${searchText}`)

    }

} else if (command.match(/delete/i)) { // Deleting Text
    
    var deleteText = prompt("Delete Text: ") 

    if (text.includes(deleteText)) { // Conditional to prevent errors
        
        text = text.replace(deleteText, "")
        
        alert(`Edited Text:
        \n${text}`)

    } else { 

       alert(`Text Not Found: ${deleteText}`)
    
    }

} else if (command.match(/erase/i)) { // Erasing Text
    
    text = ""

} else if (command.match(/flip/i)) { // Flipping Text
    
    text = text.split("").reverse().join("") // Converts string into array, reverses array, converts it back to string
     
    alert(`Edited Text:
    \n${text}`)

} else if (command.match(/replace/i)) { // Replacing Text
   
    replaceText = prompt("Text to Replace: ")
     
    substitutionText = prompt("Replace with:")

    text = text.replace(replaceText, substitutionText)
  
    alert(`New Text 
    \n${text}`)

} else if (command.match(/quit/i)) { // Quitting Text
    
    alert(`Here is your last sight at your Text 
    \n${text}`)

    alert("Application Closed")
 
    break

} else if (command.match(/rng/i)) { // TEXT RANDOM Generation
     
    text = ""

    var salting = Math.round(Math.random(0,1000) * 100)

    for (let i = 0; i < Math.round(Math.random() * 1000); i++) {
       
        salting = Math.round(salting) + i

        text += String.fromCharCode(salting)

    }
    
    alert(`Here is your random string:
        \n${text}`)

} else {

    alert("Not a command")

}
}
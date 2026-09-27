

// Widget set up

let textArea = document.querySelector("#iotext")

const titleInput = document.querySelector("#text-title")
const pageTitle = document.querySelector("#title")

let title = pageTitle.textContent.trim() || "New Text"

function updatePageTitle() {

   title = titleInput.value.trim() || "New Text"
   pageTitle.textContent = title
   document.title = title

}

// RANDOM WIDGET VARIABLE set up

const randomTextLength = document.querySelector("#random-length")

const randomness = document.querySelector("#randomness")

let isUsingEntropy = false

const userEntropy = document.querySelector("#entropy")

const runRandom = document.querySelector("#run-random")

// Widget Event listeners

titleInput.addEventListener("input", updatePageTitle)

updatePageTitle()

document.querySelector("#erase").addEventListener("click", function() {

   const cleanedText = textArea.value.replace(/\s/g, "")  
   // clean text by removing all whitespaces so if someone spams around 1000 spaces, it won't warn you.
  
   if (cleanedText.length >= 1000) {
     
      const userConfirmation = confirm("Are you sure you want to erase this?")

      if (userConfirmation) {

         textArea.value = ""

      }

   } else {

      textArea.value = ""

   }

})

document.querySelector("#flip").addEventListener("click", function() {

   textArea.value = textArea.value.split("").reverse().join("")

})

randomness.addEventListener("input", function() {

   userEntropy.textContent = ""

   isUsingEntropy = false

})

userEntropy.addEventListener("input", function() {

   randomness.textContent = ""

   isUsingEntropy = true

})

runRandom.addEventListener("click", function() {

   runRandom.textContent = "Done!"

   let randomGeneratedText = ""

   let currentEntropy = 0

   let charPool =  65535 
   
   /** JavaScript's fromCharCode and charCodeAt functions are from UTF-16 
    * Unicode, which has a total of 65,535 characters.
   */ 

   // Entropy calculations

   if (isUsingEntropy) {

      /** Had to do math.floor and random times pool because there is no randint() function 
       * 
       * explained
       * 
       * Math.random() gives a random value between 0-1. multipleid by the charPool of 65,535,
       * so it will be a number there then made into a whole number via floor
       * 
      */

      while (currentEntropy < Number(userEntropy.value)) {

         randomGeneratedText += String.fromCharCode(Math.floor(Math.random() * charPool))

         currentEntropy = randomGeneratedText.length * Math.log2(charPool)

         const requiredPoolSize = Math.ceil(2 ** (Number(userEntropy.value) / Number(randomTextLength.value)))
          
      }

      textArea.value += randomGeneratedText

      setTimeout(() => {

         runRandom.textContent = "Run"

      }, 200)

   } else {

      charPool = charPool * (1/Number(randomTextLength.value))

      for (let i = 0; i < randomTextLength.value; i++) {

         randomGeneratedText += String.fromCharCode(Math.floor(Math.random() * charPool))

      }

      textArea.value += randomGeneratedText
      
      setTimeout(() => {

         runRandom.textContent = "Run"

      }, 200)

   }

})

//  Word Counter

let wordCount = document.querySelector("#word-count")

let text = textArea.value.trim()

textArea.addEventListener("input", function() {

   text = textArea.value.trim()

   if (!/\b\w+\b/u.test(text)) {
      
      wordCount.textContent = "0 Words"

   } else {

      wordCount.textContent = `${text.match(/\b\w+\b/gu).length} Words`

   }

})

// Key Event Listeners

textArea.addEventListener("keydown", (e) => {

  const ctrlBracketIndent = (e.key === "]" || e.key === "}") && (e.metaKey || e.ctrlKey)

  if (e.key === "Tab" || ctrlBracketIndent) {
   
    e.preventDefault()

    const indentation = "    "
    textArea.value =
      textArea.value.substring(0, textArea.selectionStart) +
      indentation +
      textArea.value.substring(textArea.selectionEnd)

    textArea.selectionStart =
      textArea.selectionEnd =
      textArea.selectionStart + indentation.length

  }

  if ((e.key === "[" || e.key === "{") && (e.metaKey || e.ctrlKey)) {

    e.preventDefault()

    const start = textArea.selectionStart
    const end = textArea.selectionEnd
    const lineStart = textArea.value.lastIndexOf("\n", start - 1) + 1
    const currentLine = textArea.value.slice(lineStart, start)

    if (currentLine.startsWith("    ")) {
      const indentation = "    "

      textArea.value =
        textArea.value.slice(0, lineStart) +
        currentLine.slice(indentation.length) +
        textArea.value.slice(start)

      textArea.selectionStart = Math.max(start - indentation.length, lineStart)
      textArea.selectionEnd = Math.max(end - indentation.length, lineStart)
    }

  }
})

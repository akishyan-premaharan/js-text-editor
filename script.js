

// Widget set up

let textArea = document.querySelector("#iotext")

const findBar = document.querySelector("#sb")
const findInput = document.querySelector("#si")
const findCount = document.querySelector("#s-count")
const previousMatch = document.querySelector("#prev-sb")
const nextMatch = document.querySelector("#next-sb")
const closeFind = document.querySelector("#close-sb")

let searchMatches = []
let activeMatch = -1

function updateSearchMatches() {

   const query = findInput.value
   const text = textArea.value
   searchMatches = []

   if (query) {

      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const matcher = new RegExp(escapedQuery, "gi")
      let match

      while ((match = matcher.exec(text)) !== null) {

         searchMatches.push({ start: match.index, end: matcher.lastIndex })

      }

   }

   if (searchMatches.length === 0) {

      activeMatch = -1
      findCount.textContent = "0/0"
      return

   }

   activeMatch = Math.min(activeMatch, searchMatches.length - 1)
   findCount.textContent = `${Math.max(activeMatch + 1, 0)}/${searchMatches.length}`

}

function selectSearchMatch(direction = 1) {

   if (searchMatches.length === 0) return

   activeMatch = (activeMatch + direction + searchMatches.length) % searchMatches.length
   const match = searchMatches[activeMatch]
   textArea.setSelectionRange(match.start, match.end)
   findCount.textContent = `${activeMatch + 1}/${searchMatches.length}`

}

findInput.addEventListener("input", function() {

   activeMatch = -1
   updateSearchMatches()
   selectSearchMatch(1)

})

textArea.addEventListener("input", updateSearchMatches)
previousMatch.addEventListener("click", () => selectSearchMatch(-1))
nextMatch.addEventListener("click", () => selectSearchMatch(1))

closeFind.addEventListener("click", function() {

   findBar.hidden = true
   textArea.focus()

})

findInput.addEventListener("keydown", function(event) {

   if (event.key === "Enter") {

      event.preventDefault()
      selectSearchMatch(event.shiftKey ? -1 : 1)

   }

   if (event.key === "Escape") {

      findBar.hidden = true
      textArea.focus()

   }

})

document.addEventListener("keydown", function(event) {

   if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {

      event.preventDefault()
      findBar.hidden = false
      findInput.focus()
      findInput.select()

   }

})

const titleInput = document.querySelector("#text-title")
const pageTitle = document.querySelector("#title")
const saveButton = document.querySelector("#save")
const saveFormat = document.querySelector("#save-format")
const historyButton = document.querySelector("#versions")
const historyDialog = document.querySelector("#history-dialog")
const historyList = document.querySelector("#history-list")
const historyEmpty = document.querySelector("#history-empty")
const closeHistory = document.querySelector("#close-history")

const historyStorageKey = "text-editor-history"
const historyLimit = 50
let historyTimer

function loadHistory() {

   try {

      const savedHistory = JSON.parse(localStorage.getItem(historyStorageKey) || "[]")
      return Array.isArray(savedHistory)
         ? savedHistory.filter((entry) => typeof entry.text === "string" && typeof entry.timestamp === "string")
         : []

   } catch {

      return []

   }

}

const historyEntries = loadHistory()

let title = pageTitle.textContent.trim() || "New Text"

function updatePageTitle() {

   title = titleInput.value.trim() || "New Text"
   pageTitle.textContent = title
   document.title = title

}

function saveSnapshot() {

   const snapshot = {
      text: textArea.value,
      title: titleInput.value.trim() || "Untitled",
      timestamp: new Date().toISOString()
   }
   const latest = historyEntries[0]

   if (latest && latest.text === snapshot.text && latest.title === snapshot.title) return

   historyEntries.unshift(snapshot)
   historyEntries.length = Math.min(historyEntries.length, historyLimit)

   try {

      localStorage.setItem(historyStorageKey, JSON.stringify(historyEntries))

   } catch {

      // Keep the current session's history available if storage is unavailable.

   }

}

function scheduleSnapshot() {

   clearTimeout(historyTimer)
   historyTimer = setTimeout(saveSnapshot, 700)

}

function notifyEditorChanged() {

   textArea.dispatchEvent(new Event("input", { bubbles: true }))

}

function renderHistory() {

   historyList.replaceChildren()
   historyEmpty.hidden = historyEntries.length > 0

   historyEntries.forEach((snapshot) => {

      const entry = document.createElement("div")
      const details = document.createElement("div")
      const timestamp = document.createElement("time")
      const preview = document.createElement("p")
      const restore = document.createElement("button")
      const date = new Date(snapshot.timestamp)

      entry.className = "history-entry"
      timestamp.dateTime = snapshot.timestamp
      timestamp.textContent = Number.isNaN(date.getTime()) ? "Previous version" : date.toLocaleString()
      preview.textContent = snapshot.text.trim().slice(0, 140) || "(Empty document)"
      restore.type = "button"
      restore.textContent = "Restore"
      restore.addEventListener("click", function() {

         clearTimeout(historyTimer)
         saveSnapshot()
         textArea.value = snapshot.text
         titleInput.value = snapshot.title
         updatePageTitle()
         textArea.dispatchEvent(new Event("input", { bubbles: true }))
         historyDialog.close()

      })

      details.append(timestamp, preview)
      entry.append(details, restore)
      historyList.append(entry)

   })

}

function escapeRtf(text) {

   return text.replace(/\\|[{}]|\r\n?|\n|\t|[^\x20-\x7e]/g, function(character) {

      if (character === "\\" || character === "{" || character === "}") return `\\${character}`
      if (character === "\r" || character === "\n") return "\\par\n"
      if (character === "\t") return "\\tab "

      const codeUnit = character.charCodeAt(0)
      return `\\u${codeUnit > 32767 ? codeUnit - 65536 : codeUnit}?`

   })

}

function downloadDocument(format) {

   const safeTitle = (titleInput.value.trim() || "Untitled").replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
   const isRtf = format === "rtf"
   const contents = isRtf ? `{\\rtf1\\ansi\\deff0\n${escapeRtf(textArea.value)}\n}` : textArea.value
   const blob = new Blob([contents], { type: isRtf ? "application/rtf" : "text/plain;charset=utf-8" })
   const downloadUrl = URL.createObjectURL(blob)
   const link = document.createElement("a")

   link.href = downloadUrl
   link.download = `${safeTitle}.${format}`
   link.click()
   setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)

}

saveButton.addEventListener("click", () => downloadDocument(saveFormat.value))

historyButton.addEventListener("click", function() {

   clearTimeout(historyTimer)
   saveSnapshot()
   renderHistory()
   historyDialog.showModal()

})

closeHistory.addEventListener("click", () => historyDialog.close())
textArea.addEventListener("input", scheduleSnapshot)

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
         notifyEditorChanged()

      }

   } else {

      textArea.value = ""
      notifyEditorChanged()

   }

})

document.querySelector("#flip").addEventListener("click", function() {

   textArea.value = textArea.value.split("").reverse().join("")
   notifyEditorChanged()

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
      notifyEditorChanged()

      setTimeout(() => {

         runRandom.textContent = "Run"

      }, 200)

   } else {

      charPool = charPool * (1/Number(randomTextLength.value))

      for (let i = 0; i < randomTextLength.value; i++) {

         randomGeneratedText += String.fromCharCode(Math.floor(Math.random() * charPool))

      }

      textArea.value += randomGeneratedText
      notifyEditorChanged()
      
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
      notifyEditorChanged()

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
      notifyEditorChanged()
    }

  }
})
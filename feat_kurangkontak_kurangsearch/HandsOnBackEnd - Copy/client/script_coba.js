let contacts = [];
let currentContact = ""; // Keep track of the currently open chat
const myContact = "6285174388804@c.us";
let debounceTimeout;


window.onload = () => {
  fetch("http://localhost:3003/messages")
    .then((response) => response.json())
    .then((messages) => {
      // Extract contacts from messages
      messages.forEach((message) => {
        let fromUser = message.from;
        let toUser = message.to;

        if (fromUser !== myContact && !contacts.includes(fromUser)) {
          contacts.push(fromUser);
        }

        if (toUser !== myContact && !contacts.includes(toUser)) {
          contacts.push(toUser);
        }
      });

      // Render UI for each contact
      const userData = document.querySelector(".col-md-4");
      if (!userData) {
        console.error("Element with class 'col-md-4' not found.");
        return;
      }

      function formatContactName(contact) {
        return contact.replace(/@(c|g)\.us$/, ""); // Remove "@c.us" suffix
      }
      
      contacts.forEach((contact) => {
        const user_friendRow = document.createElement("div");
        user_friendRow.className = "friend-row friend-row--onhover";
        user_friendRow.setAttribute("data-contact", contact);

        const user_pfp = document.createElement("img");
        user_pfp.className = "profile-image";

        const user_containerList = document.createElement("div");
        user_containerList.className = "text";

        const user_displayName = document.createElement("h6");
        user_displayName.className = "text";
        user_displayName.innerHTML = formatContactName(contact);
        // user_displayName.innerHTML = (contact);
        user_containerList.appendChild(user_pfp);
        user_containerList.appendChild(user_displayName);
        user_friendRow.appendChild(user_containerList);

        userData.appendChild(user_friendRow);

        // Click event for each friend row
        user_friendRow.addEventListener("click", () => {
          currentContact = contact; // Set the current contact
          displayUserMessages(contact, messages);
        });
        // ini bingung kok gabisa
        const contactSearchBox = document.querySelector(".search-box input");
        if (contactSearchBox) {
          contactSearchBox.addEventListener("keyup", (e) => {
            const searchTerm = e.target.value.toLowerCase(); // Get the search term
            document.querySelectorAll(".friend-row").forEach((friendRow) => {
              const contact = friendRow.getAttribute("data-contact").toLowerCase(); // Get the contact from data attribute
              if (contact.includes(searchTerm)) {
                friendRow.style.display = ""; // Show matching rows
              } else {
                friendRow.style.display = "none"; // Hide non-matching rows
              }
            });
          });
        } else {
          console.error("Search box for contacts not found.");
        }

      });

      // Function to display messages for a specific contact
      function displayUserMessages(contact, messages, searchTerm = "") {
        const userMessages = messages.filter((message) => {
          if (contact.includes('@g.us')) {
            // For group messages
            console.log("Message.id:", message.id)
            console.log("Group Contact:", contact);
            console.log("Message From:", message.from);
            console.log("Message To:", message.to);
            console.log("Should Include Group:", message.from === contact || message.to === contact);
          
            return (message.from === contact || message.to === contact);
          } else {
            // For individual contacts
            console.log("Message.id:", message.id)
            console.log("Individual Contact:", contact);
            console.log("Message From:", message.from);
            console.log("Message To:", message.to);
            console.log("Should Include Individual:", (message.from === contact || message.to === contact) &&
                                                      !message.from.includes('@g.us') &&
                                                      !message.to.includes('@g.us'));
          
            return (message.from === contact || message.to === contact) &&
                   !message.from.includes('@g.us') &&
                   !message.to.includes('@g.us');
          }
          
        });
      
        // Sort the filtered messages by timestamp
        userMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        const chatPanelContainer = document.querySelector(".chat-panel-container");
        if (!chatPanelContainer) {
            console.error("Element with class 'chat-panel-container' not found.");
            return;
        }

        chatPanelContainer.innerHTML = "";
      
        // Create the user banner with contact info
        const user_banner = document.createElement("div");
        user_banner.className = "user-banner";
      
        const user_fullInfo = document.createElement("div");
        user_fullInfo.className = "text";
      
        const user_numberInfo = document.createElement("h6");
        const user_tapForMoreInfo = document.createElement("p");
      
        user_numberInfo.innerHTML = formatContactName(contact); 
        user_tapForMoreInfo.innerHTML = "Tap for more info";
      
        //bookmark dulu  tadi sampek disini untuk menambah innerHTML 
        const searchBox = document.createElement("div");
        searchBox.className = "search-box-user";
        searchBox.innerHTML = `
            <div class="input-wrapper">
                <i class="material-icons">search</i>
                <input type="text" placeholder="Cari messagenya <3">
            </div>
        `;

        chatPanelContainer.appendChild(searchBox);

        user_fullInfo.appendChild(user_numberInfo);
        user_fullInfo.appendChild(user_tapForMoreInfo);
        user_banner.appendChild(user_fullInfo);

        chatPanelContainer.appendChild(user_banner);

        // Create the chat panel to display messages
        const chatPanel = document.createElement("div");
        chatPanel.className = "chat-panel";
      
        // Loop through the user messages and display them
        userMessages.forEach((message) => {
          const messageRow = document.createElement("div");
          messageRow.className = "row g-0";
      
          const messageCol = document.createElement("div");
          const chatBubble = document.createElement("div");
      
          // Determine if the message is from the user or the contact
          if (message.id && message.id.fromMe) {
            messageCol.className = "col-md-3 offset-md-9";
            chatBubble.className = "chat-bubble chat-bubble--pink";
          } else if (message.id) {
            messageCol.className = "col-md-3";
            chatBubble.className = "chat-bubble";
          } else {
            console.warn("Skipping message without id:", message);
          }
      
          // Format the message body and timestamp
          const messageBody = highlightTextUser(message.body, searchTerm);
          const messageTime = formatTime(message.timestamp);
      
          // Insert the formatted message and timestamp into the chat bubble
          chatBubble.innerHTML = `${messageBody} <br><span class="chat-time">${messageTime}</span>`;
          messageCol.appendChild(chatBubble);
          messageRow.appendChild(messageCol);
          chatPanel.appendChild(messageRow);
          
        });
      
        // Append the chat panel to the user data banner
        chatPanelContainer.appendChild(chatPanel);

        const existingReplyBox = document.getElementById("reply-box");

        // Remove it from the DOM if already present in the HTML
        if (existingReplyBox) {
            existingReplyBox.parentNode.removeChild(existingReplyBox);
        }

        // Dynamically create the reply box for this contact
        const replyBox = document.createElement("div");
        replyBox.id = "reply-box";

        replyBox.innerHTML = 
          `<form action="http://localhost:3003/post" method="post">
            <div class="input-group">
              <input type="text" name="body" class="form-control" placeholder="Type a message..." required>
              <input type="hidden" name="currentContact" value="${currentContact}">
              <input type="hidden" name="myContact" value="${myContact}">
              <button class="send-button btn btn-primary" type="submit">Send</button>
            </div>
          </form>
        `;

        // Append the reply box to the chat panel container
        document.querySelector(".chat-panel-container").appendChild(replyBox)
        // simpenan
        // document.querySelector(".search-box-user").addEventListener("keyup", (e) => {
        //   const searchTerm = e.target.value.toLowerCase();
        //   displayUserMessages(currentContact, messages, searchTerm);
        // });

        document.querySelector(".search-box-user").addEventListener("keyup", (e) => {
          clearTimeout(debounceTimeout); // Clear any existing timeout
          const searchTerm = e.target.value.toLowerCase();
      
          if (e.key === "Enter") {
              // Trigger search immediately on Enter key
              displayUserMessages(currentContact, messages, searchTerm);
          } else {
              // Set a timeout for debounce
              debounceTimeout = setTimeout(() => {
                  displayUserMessages(currentContact, messages, searchTerm);
              }, 300); // Delay of 300ms
          }
          });
      }

      
      document.querySelector(".search-box").addEventListener("keyup", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        displayUserMessages(currentContact, messages, searchTerm);
      });

      function updateReplyBoxContact(contact) {
        const form = document.querySelector("#reply-box form");
        form.querySelector('input[name="currentContact"]').value = contact;
      }

      // Function to highlight search term in text
      function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, "gi");
        return text.replace(regex, "<mark>$1</mark>");
      }

      function highlightTextUser(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, "gi");
        return text.replace(regex, "<mark>$1</mark>");
      }

      // Function to format the timestamp to "HH:MM" format
      function formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }

      alert("Data loaded successfully");
    })
    .catch((error) => console.error("Error:", error));
};

// Fix the missing closing bracket and event listener for the form
document.querySelector('form').addEventListener('submit', function(event) {
  console.log("Form submitted");
  event.preventDefault();  // Prevent default form submission for testing purposes
});

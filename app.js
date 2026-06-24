// ===================================
// TICKETBRIDGE PRO APP.JS
// ===================================

let tickets =
JSON.parse(
localStorage.getItem("tickets")
) || [];

let requests =
JSON.parse(
localStorage.getItem("requests")
) || [];

let chats =
JSON.parse(
localStorage.getItem("chats")
) || [];

// ===================================
// DARK MODE
// ===================================

if(
localStorage.getItem("theme")
=== "dark"
){
document.body.classList.add("dark");
}

document
.getElementById("darkModeBtn")
.addEventListener("click",()=>{

document.body.classList.toggle("dark");

localStorage.setItem(
"theme",
document.body.classList.contains("dark")
? "dark"
: "light"
);

});

// ===================================
// MODALS
// ===================================

const uploadModal =
document.getElementById("uploadModal");

const chatModal =
document.getElementById("chatModal");

document
.getElementById("openUploadModal")
.onclick = () => {

uploadModal.style.display = "flex";

};

document
.getElementById("closeUploadModal")
.onclick = () => {

uploadModal.style.display = "none";

};

document
.getElementById("closeChat")
.onclick = () => {

chatModal.style.display = "none";

};

// ===================================
// AI PRICE RECOMMENDATION
// ===================================

function getAIPrice(
price,
eventDate
){

let now =
new Date();

let event =
new Date(eventDate);

let hours =

(event - now)
/
1000
/
60
/
60;

if(hours < 6){

return Math.round(
price * 0.70
);

}

if(hours < 24){

return Math.round(
price * 0.85
);

}

return price;

}

// ===================================
// SAVE DATA
// ===================================

function saveData(){

localStorage.setItem(
"tickets",
JSON.stringify(tickets)
);

localStorage.setItem(
"requests",
JSON.stringify(requests)
);

localStorage.setItem(
"chats",
JSON.stringify(chats)
);

}

// ===================================
// UPLOAD TICKET
// ===================================

document
.getElementById("uploadTicketBtn")
.addEventListener(
"click",
uploadTicket
);

function uploadTicket(){

let eventName =
document.getElementById(
"eventName"
).value;

let eventType =
document.getElementById(
"eventType"
).value;

let eventDate =
document.getElementById(
"eventDate"
).value;

let ticketPrice =
Number(
document.getElementById(
"ticketPrice"
).value
);

let imageFile =
document.getElementById(
"ticketImage"
).files[0];

if(
!eventName ||
!eventDate ||
!ticketPrice
){

alert(
"Please fill all fields"
);

return;

}

let reader =
new FileReader();

reader.onload =
function(e){

let imageData =
e.target.result;

let aiPrice =
getAIPrice(
ticketPrice,
eventDate
);

document.getElementById(
"aiPrice"
).innerText =
"₹" + aiPrice;

// ===================
// QR CODE
// ===================

const ticketCode =

typeof scannedTicketId
!== "undefined"

&&

scannedTicketId

?

scannedTicketId

:

generateTicketCode();

// ===================
// STORE TICKET
// ===================

tickets.push({

id: Date.now(),

ticketCode:
ticketCode,

name:
eventName,

type:
eventType,

date:
eventDate,

price:
ticketPrice,

suggestedPrice:
aiPrice,

image:
imageData,

seller:
"Sai Sandesh",

verified:
true,

heatScore:
Math.floor(
Math.random()*100
),

createdAt:
new Date()

});

// ===================
// VERIFIED DATABASE
// ===================

saveVerifiedTicket({

ticketCode:
ticketCode,

name:
eventName,

date:
eventDate

});

saveData();

renderTickets();

uploadModal.style.display =
"none";

alert(
"Ticket Uploaded Successfully"
);

};

if(imageFile){

reader.readAsDataURL(
imageFile
);

}
else{

alert(
"Please Upload Ticket Image"
);

}

}

// ===================================
// RENDER TICKETS
// ===================================

function renderTickets(){

let container =
document.getElementById(
"ticketContainer"
);

container.innerHTML = "";

let searchValue =

document
.getElementById(
"searchInput"
)
.value
.toLowerCase();

let filterValue =

document
.getElementById(
"categoryFilter"
)
.value;

let filteredTickets =

tickets.filter(ticket=>{

let searchMatch =

ticket.name
.toLowerCase()
.includes(searchValue);

let filterMatch =

filterValue === ""

||

ticket.type === filterValue;

return (
searchMatch
&&
filterMatch
);

});

filteredTickets.forEach(ticket=>{

let diffHours =

(
new Date(ticket.date)
-
new Date()
)
/
1000
/
60
/
60;

let urgent =
diffHours < 24;

container.innerHTML +=

`
<div class="ticket-card">

<img
src="${ticket.image}"
class="ticket-image"
>

<div class="badge verified">
✓ Verified
</div>

${urgent ?

`
<div class="badge urgent">
🚨 Urgent Sale
</div>

`

: ""}

<h3>${ticket.name}</h3>

<p>
Category:
${ticket.type}
</p>

<p>
Date:
${ticket.date}
</p>

<p>
Seller:
${ticket.seller}
</p>

<p>
Demand:
${getDemandStatus(
ticket.heatScore
)}
</p>

<div class="ticket-price">
₹${ticket.price}
</div>

<button
onclick="requestTicket(
${ticket.id}
)">
Request To Buy
</button>

<button
onclick="openChat()">
Chat Seller
</button>

</div>
`;

});

document.getElementById(
"ticketCount"
).innerText =
tickets.length;

document.getElementById(
"sellerCount"
).innerText =
1;

}

// ===================================
// REQUEST SYSTEM
// ===================================

function requestTicket(id){

let ticket =
tickets.find(
t=>t.id===id
);

requests.push({

ticketId:id,

event:
ticket.name,

status:
"Pending"

});

saveData();

renderRequests();

alert(
"Request Sent"
);

}

function renderRequests(){

let container =
document.getElementById(
"requestContainer"
);

container.innerHTML = "";

requests.forEach(req=>{

container.innerHTML +=

`
<div class="request-card">

<h4>
${req.event}
</h4>

<p>
${req.status}
</p>

</div>
`;

});

}

// ===================================
// CHAT
// ===================================

function openChat(){

chatModal.style.display =
"flex";

}

document
.getElementById(
"sendMessage"
)
.addEventListener(
"click",
()=>{

let input =
document.getElementById(
"chatInput"
);

if(
input.value.trim()
=== ""
) return;

chats.push({

message:
input.value,

time:
new Date()
.toLocaleTimeString()

});

saveData();

renderChats();

input.value = "";

}
);

function renderChats(){

let box =
document.getElementById(
"chatMessages"
);

box.innerHTML = "";

chats.forEach(chat=>{

box.innerHTML +=

`
<div class="message">
${chat.message}
</div>
`;

});

}

// ===================================
// SEARCH & FILTER
// ===================================

document
.getElementById(
"searchInput"
)
.addEventListener(
"keyup",
renderTickets
);

document
.getElementById(
"categoryFilter"
)
.addEventListener(
"change",
renderTickets
);

// ===================================
// INITIAL LOAD
// ===================================

renderTickets();
renderRequests();
renderChats();
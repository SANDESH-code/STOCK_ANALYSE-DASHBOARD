// ===================================
// TICKETBRIDGE PRO QRSCANNER.JS
// ===================================

let scannedTicketId = null;

// ===================================
// GENERATE UNIQUE TICKET CODE
// ===================================

function generateTicketCode(){

return (

"TKT-" +

Math.random()
.toString(36)
.substring(2,10)
.toUpperCase()

);

}

// ===================================
// IMAGE INPUT LISTENER
// ===================================

const ticketImageInput =
document.getElementById(
"ticketImage"
);

if(ticketImageInput){

ticketImageInput.addEventListener(
"change",
scanTicketImage
);

}

// ===================================
// SCAN QR FROM IMAGE
// ===================================

async function scanTicketImage(){

const file =
document.getElementById(
"ticketImage"
).files[0];

if(!file) return;

try{

const qrReader =
new Html5Qrcode(
"hidden-qr-reader"
);

const result =
await qrReader.scanFile(
file,
true
);

scannedTicketId =
result;

const verified =
verifyTicket(
result
);

if(verified){

document.getElementById(
"qrResult"
).innerHTML =

`
✅ Ticket Verified

<br><br>

Ticket ID:

<b>${result}</b>
`;

}

}
catch(error){

console.log(
"QR Not Found",
error
);

scannedTicketId = null;

document.getElementById(
"qrResult"
).innerHTML =

`
⚠ No QR Found

<br><br>

System will generate
a unique Ticket ID.
`;

}

}

// ===================================
// VERIFY DUPLICATE TICKET
// ===================================

function verifyTicket(ticketId){

let tickets =

JSON.parse(
localStorage.getItem(
"tickets"
)
)

||

[];

let duplicate =

tickets.find(

ticket =>

ticket.ticketCode === ticketId

);

if(duplicate){

document.getElementById(
"qrResult"
).innerHTML =

`
❌ Duplicate Ticket

<br><br>

Ticket already exists.
`;

return false;

}

return true;

}

// ===================================
// VERIFIED TICKET DATABASE
// ===================================

function saveVerifiedTicket(ticket){

let verifiedTickets =

JSON.parse(

localStorage.getItem(
"verifiedTickets"
)

)

||

[];

verifiedTickets.push({

ticketCode:
ticket.ticketCode,

name:
ticket.name,

date:
ticket.date,

verified:
true,

createdAt:
new Date()

});

localStorage.setItem(

"verifiedTickets",

JSON.stringify(
verifiedTickets
)

);

}

// ===================================
// FRAUD CHECK
// ===================================

function fraudCheck(ticketCode){

let verifiedTickets =

JSON.parse(

localStorage.getItem(
"verifiedTickets"
)

)

||

[];

return verifiedTickets.some(

ticket =>

ticket.ticketCode
===
ticketCode

);

}

// ===================================
// REMOVE EXPIRED TICKETS
// ===================================

function removeExpiredTickets(){

let tickets =

JSON.parse(

localStorage.getItem(
"tickets"
)

)

||

[];

const now =
new Date();

tickets =

tickets.filter(ticket=>{

return (

new Date(ticket.date)

>

now

);

});

localStorage.setItem(

"tickets",

JSON.stringify(
tickets
)

);

}

// ===================================
// UPDATE HEAT SCORES
// ===================================

function updateHeatScores(){

let tickets =

JSON.parse(

localStorage.getItem(
"tickets"
)

)

||

[];

tickets.forEach(ticket=>{

if(!ticket.heatScore){

ticket.heatScore =

Math.floor(
Math.random()*100
);

}

});

localStorage.setItem(

"tickets",

JSON.stringify(
tickets
)

);

}

// ===================================
// DEMAND STATUS
// ===================================

function getDemandStatus(score){

if(score >= 80){

return "🔥 Hot Ticket";

}

if(score >= 50){

return "🟡 Medium Demand";

}

return "🟢 Available";

}

// ===================================
// FIND TICKET BY CODE
// ===================================

function findTicketByCode(code){

let tickets =

JSON.parse(

localStorage.getItem(
"tickets"
)

)

||

[];

return tickets.find(

ticket =>

ticket.ticketCode
=== code

);

}

// ===================================
// GET VERIFIED COUNT
// ===================================

function getVerifiedTicketCount(){

let verifiedTickets =

JSON.parse(

localStorage.getItem(
"verifiedTickets"
)

)

||

[];

return verifiedTickets.length;

}

// ===================================
// AUTO CLEANUP
// ===================================

removeExpiredTickets();

updateHeatScores();

// ===================================
// CREATE HIDDEN QR CONTAINER
// ===================================

window.addEventListener(
"load",
()=>{

if(

!document.getElementById(
"hidden-qr-reader"
)

){

const div =
document.createElement(
"div"
);

div.id =
"hidden-qr-reader";

div.style.display =
"none";

document.body.appendChild(
div
);

}

});
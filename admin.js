function getDashboardStats(){

let tickets =
JSON.parse(
localStorage.getItem("tickets")
)||[];

let requests =
JSON.parse(
localStorage.getItem("requests")
)||[];

let users =
JSON.parse(
localStorage.getItem("users")
)||[];

return{

tickets:
tickets.length,

requests:
requests.length,

users:
users.length

};

}

function removeTicket(id){

let tickets =
JSON.parse(
localStorage.getItem("tickets")
)||[];

tickets =
tickets.filter(
t=>t.id!==id
);

localStorage.setItem(
"tickets",
JSON.stringify(tickets)
);

}
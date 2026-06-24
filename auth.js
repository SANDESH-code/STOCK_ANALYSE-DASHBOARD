function registerUser(
name,
email
){

let users =
JSON.parse(
localStorage.getItem("users")
)||[];

users.push({
name,
email,
rating:5
});

localStorage.setItem(
"users",
JSON.stringify(users)
);

}

function loginUser(
email
){

let users =
JSON.parse(
localStorage.getItem("users")
)||[];

return users.find(
u=>u.email===email
);

}
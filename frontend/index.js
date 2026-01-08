const root = document.getElementById("root");

// fetch("http://localhost:3000/v1/users", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     name: "John Doe",
//     email: "john.doe@example.com",
//   }),
// })
//   .then((res) => res.json())
//   .then((data) => {
//     console.log("data", data);

//     root.innerText = data;

//     console.log(location.origin);
//   });

fetch("http://localhost:3000/v1/users")
  .then((res) => res.json())
  .then((data) => {
    console.log("data", data);
  });

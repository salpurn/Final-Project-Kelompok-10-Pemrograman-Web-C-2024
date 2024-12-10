fetch("http://localhost:3001/users")
  .then((response) => response.json())
  .then((data) => {
    data.data.forEach((user) => {
      const userData = document.getElementById("userData");

      const user_detail = document.createElement("div");
      const user_name = document.createElement("h1");
      const user_studentId = document.createElement("h2");
      const user_username = document.createElement("h2");

      user_name.innerText = user.name; 
      user_studentId.innerText = user.studentId;
      user_username.innerText = user.username;

      user_detail.appendChild(user_name);
      user_detail.appendChild(user_studentId);
      user_detail.appendChild(user_username);

      userData.appendChild(user_detail);
    });
  })
  .catch((error) => console.error("Error:", error))
  .finally(() => {
    alert("Data loaded successfully");
  });
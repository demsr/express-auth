function callApi() {
  console.log("Hello");
  fetch("/api")
    .then((data) => data.json())
    .then((data) => console.log(data))
    .catch((err) => console.log("Err: ", err));
}

callApi();

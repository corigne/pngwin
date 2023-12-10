<script>
  import { onMount } from "svelte";

  let username = "";
  let email = "";
  let user_id = "";

  onMount(async () => {
    //check if cookie exists and await fetch profile using jwt token in auth header
    if (
      document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("jwt="))
    ) {
      const res = await fetch("http://localhost:3000/api/userProfile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            document.cookie
              .split(";")
              .find((item) => item.trim().startsWith("jwt="))
              .split("=")[1],
        },
      });
      const data = await res.json();
      if (data.success) {
        username = data.username;
        email = data.email;
        user_id = data.user_id;
        return;
      }
    }
  });
</script>

<main>
  <h1>Welcome to your Profile Page</h1>
  <p>Username: {username}</p>
  <p>Email: {email}</p>
</main>

<style>
  main {
    padding: 20px;
    text-align: center;
  }
</style>

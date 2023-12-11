<script>
  import { onMount } from "svelte";
  import { Card, CardBody, CardFooter, CardImg, Col, Row } from "sveltestrap";

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
  <Row>
    <Col class = "mb-3">
      <Card>
        <CardImg
          top
          width="20%"
          max-width="200px"
          max-height="200px"
          src="https://i.imgur.com/81Eqq4c.jpg"
          alt="Card image cap"
        />
        <CardBody>
          <h5 class="card-title">{username}</h5>
          <p class="card-text">{email}</p>
        </CardBody>
        <CardFooter>
          <small class="text-muted">User ID: {user_id}</small>
        </CardFooter>
      </Card>
    </Col>
  </Row>
</main>

<style>
  main {
    padding: 20px;
    text-align: center;
  }
</style>

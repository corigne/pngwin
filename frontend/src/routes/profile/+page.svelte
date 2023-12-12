<script>
  import { onMount } from "svelte";
  import { Card, CardBody, CardFooter, CardImg, Col, Row } from "sveltestrap";

  let username = "";
  let email = "";
  let user_id = "";
  let posts = [];
  let postids = [];

  onMount(async () => {
    //check if cookie exists and await fetch profile using jwt token in auth header
    if (
      document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("jwt="))
    ) {
      const res = await fetch("/api/userProfile", {
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
        postids = data.posts;
        }
      }
      //for each post id, fetch the post data and post image and add to posts array
      await Promise.all(postids.map(fetchPost));
      console.log(posts);
  });

  const fetchPost = async (postid) => {
    try {
      const res = await fetch(`/api/getPost?imageID=${postid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const image = await fetch(`/api/getImage?imageID=${postid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      const image_data = await image.json();
      if (image_data.buffer) {
        console.log("we have a buffer");
        const buff = Uint8Array.from(image_data.buffer.data);
        const uri = await convertBuffer2BlobURL(buff);
        const newPost = {data, uri: uri};
        posts = [...posts, newPost];
      }
    } catch (err) {
      console.log(err);
    }
  };

  const convertBuffer2BlobURL = async (buff) => {
    try {
      const blob = new Blob([buff], { type: "image/png" });
      const uri = URL.createObjectURL(blob);
      return uri;
    } catch (err) {
      console.log(err);
    }
  };
</script>

<main>
  <div class = "profile-container">
    <Row>
      <Col class="mx-auto">
        <Card>
          <CardImg
            top
            width="100%"
            src="https://i.imgur.com/81Eqq4c.jpg"
            alt="Card image cap"
          />
          <CardBody>
            <h5 class="card-title">{username}</h5>
            <p class="card-text">{email}</p>
          </CardBody>
        </Card>
      </Col>
    </Row>
  </div>
  <div class = "text-row">
    <h1>Posts</h1>
  </div>
  {#if posts.length > 0}
    <Row class = "card-row">
      {#each posts as post}
      <Col sm="12" md="6" lg="4" xl="3" xxl="2" class ="mb-3">
        <div class = "card-container">
        <Card>
          <CardImg class = "card-img" src = {post.uri} alt = {`Image tags: ${post.data.post.tags}`}/>
          <CardBody>
            <CardFooter class = "card-footer">ID:{post.data.post.id} , Score: {post.data.post.score}, Tags: {post.data.post.tags}</CardFooter>
          </CardBody>
        </Card>
        </div>
      </Col>
      {/each}
    </Row>
  {:else}
    <p>No posts found</p>
  {/if}
</main>

<style>

  .profile-container {
    width: 40%;
    max-width: 400px;
    max-height: 400px;
    margin: 0 auto;
  }
  .text-row {
    padding: 100px;
  }
  main {
    padding: 20px;
    text-align: center;
  }
</style>

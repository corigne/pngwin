<script>
  import { onMount } from "svelte";
  import { Card, CardBody, CardFooter, CardImg, Col, Row } from "sveltestrap";

  import { convertBuffer2BlobURL } from '$lib/convert'

  let username = "";
  let user_id = "";
  let posts = [];
  let postids = [];

  export let data

  username = data.username;
  user_id = 1;
  postids = data.posts

  onMount(async () => {
    await Promise.all(postids.map(fetchPost));
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
        const buff = Uint8Array.from([...image_data.buffer.data])
        const blob = await convertBuffer2BlobURL(buff, image_data.mime)
        posts = [...posts, { ...data, blob: blob }];
      }
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
            <p class="card-text">{user_id}</p>
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
        <div class = "card-container" on:click={goto(`/img/${post.data.post.id}`)}>
        <Card>
          <CardImg class = "card-img" src = {post.blob}/>
          <CardBody>
            <CardFooter class = "card-footer">ID:{post.post.id} , Score: {post.post.score}, Tags: {post.post.tags}</CardFooter>
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
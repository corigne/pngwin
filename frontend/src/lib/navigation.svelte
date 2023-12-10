<script>
  import {
    Container,
    Navbar,
    NavbarBrand,
    Button
  } from 'sveltestrap'
  import LogInButton from '../lib/loginButton.svelte'
  import { page } from '$app/stores'
  import { onMount } from 'svelte';

  // Check if the current page is the root page
  let isRoot = $page.url.pathname === "/"
  console.log(isRoot)
  let loggedIn = false;

  onMount((async () => {
    isRoot = $page.url.pathname === "/"
    //check cookie for login
    if(document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({jwt: document.cookie.split(';').find((item) => item.trim().startsWith('jwt=')).split('=')[1]
                                , username: document.cookie.split(';').find((item) => item.trim().startsWith('username=')).split('=')[1]})
      });
      const data = await res.json();
      if(data.login) {
        loggedIn = true;
        return;
      }
    }
  }))
</script>

{#if ($page.url.pathname !== "/")}
<div class="nav">
  <Container fluid>
    <Navbar>
      <div left>
      <NavbarBrand><img class="icon" href="/" src="pngwin-modified.png" alt="png.win mascot"/></NavbarBrand>
      <div class="d-inline px-2">
          <Button href="/search" size="lg" color="warning">Images</Button>
      </div>
      <div class="d-inline px-2">
          <Button size="lg" color="warning">Collections</Button>
      </div>
      <div class="d-inline px-2">
          <Button size="lg" color="warning">Random</Button>
      </div>
      </div>
      <div right>
      <div class="d-inline px-2">
          <Button color="warning">Help</Button>
      </div>
      <div class="d-inline px-2">
          <Button color="warning">Settings</Button>
      </div>
      {#if !loggedIn}
        <LogInButton />
      {:else}
        <Button href="/profile" color="warning">Profile</Button>
    {/if}
      </div>
    </Navbar>
  </Container>
</div>
{:else}
  <Navbar>
      <div class="right">
        {#if !loggedIn}
          <LogInButton/>
        {:else}
          <Button href="/profile" color="warning">Profile</Button>
        {/if}
        <Button color="warning">Help</Button>
      </div>
  </Navbar>
{/if}

<style>
  .right{
    display: flex;
    margin-left: auto;
    gap: 1ex;
  }
</style>

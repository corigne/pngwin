<script>
  import {
    Container,
    Navbar,
    NavbarBrand,
    Button
  } from 'sveltestrap'
  import LogInButton from '../lib/loginButton.svelte'
  import { page } from '$app/stores'

  // Check if the current page is the root page
  let isRoot = $page.url.pathname === "/"
  console.log(isRoot)
</script>

{#if !isRoot}
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
        <LogInButton />
      </div>
    </Navbar>
  </Container>
</div>
{:else}
  <Navbar>
      <div class="right">
        <LogInButton/>
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

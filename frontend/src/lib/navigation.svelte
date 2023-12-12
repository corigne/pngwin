<script>
  import {
    Container,
    Navbar,
    NavbarBrand,
    Button,
    Collapse,
    NavbarToggler,
    Nav,
    NavItem,
    NavLink
  } from 'sveltestrap'
  import LogInButton from '../lib/loginButton.svelte'
  import SearchBar from './searchBar.svelte'
  import { page } from '$app/stores'
  import { onMount } from 'svelte';
  import { logged_in, user, search_tags } from '$lib/stores.js'
  import { handleLogout, automaticallyLogin } from "$lib/auth"
  import { jwtDecode } from 'jwt-decode'

  $: logged_in, search_tags

  const handleResize = () => {
    // Set isOpen to true when the window expands beyond a certain width
    isOpen = window.innerWidth > 768; // Adjust the width threshold as needed
  };

  onMount(() => {

    if(!$logged_in)
      automaticallyLogin()

    // Initialize isOpen based on the initial window width
    handleResize()

    // Add a resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component destruction
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  let isOpen = true;
</script>

{#if ($page.url.pathname !== "/")}
<div class="nav">
  <Navbar expand="md" style="flex-wrap:nowrap;">
    <NavbarBrand><img class="icon" href="/" src="/pngwin-modified.png" alt="png.win mascot"/></NavbarBrand>
    <NavItem class="ml-auto" navbar style="flex-grow: 2; min-width:30vw;">
        <SearchBar />
    </NavItem>
    {#if $logged_in}
      <NavItem>
        <NavLink href="/postImage" ><Button><b>+</b></Button></NavLink>
      </NavItem>
    {/if}
    <NavbarToggler on:click={() => isOpen = !isOpen}/>
  </Navbar>
  <Navbar expand="md" on:expand={() => isOpen = true} >
    <Collapse navbar {isOpen}>
      <Nav navbar underline class="right-buttons">
        <NavLink href="/search" >Images</NavLink>
        <NavLink >Collections</NavLink>
        <NavLink >Help</NavLink>
        <NavLink >Settings</NavLink>
        {#if ($logged_in)}
          <NavLink href="/profile" color="warning">Profile</NavLink>
          <NavLink color="warning" on:click={handleLogout}>Logout</NavLink>
        {:else}
          <LogInButton/>
        {/if}
    </Nav>
    </Collapse>
  </Navbar>
</div>
{:else}
  <Navbar>
      <div class="right-buttons" style="gap: 1ex;">
        {#if (!$logged_in)}
          <LogInButton/>
        {:else}
          <Button href="/postImage" color="warning">New Post <b>+</b></Button>
          <Button href="/profile" color="warning">Profile</Button>
          <Button on:click={handleLogout} color="warning">Logout</Button>
        {/if}
        <Button color="warning">Help</Button>
      </div>
  </Navbar>
{/if}

<style>
  :global(NavLink):hover {
    border-bottom: 2px solid #000000;
  }
</style>

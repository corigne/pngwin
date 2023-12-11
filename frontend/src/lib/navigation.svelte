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
  import { logged_in } from '$lib/stores.js'

  const handleResize = () => {
    // Set isOpen to true when the window expands beyond a certain width
    isOpen = window.innerWidth > 768; // Adjust the width threshold as needed
  };

  onMount(() => {
    // Initialize isOpen based on the initial window width
    handleResize();

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
  <Container fluid>
    <Navbar class="navbar-container" expand="md" on:expand={() => isOpen = true} >
      <NavbarBrand><img class="icon" href="/" src="pngwin-modified.png" alt="png.win mascot"/></NavbarBrand>
        <Nav class="ml-auto" navbar style="flex-grow: 2;">
          <NavItem style="flex-grow: 1; margin:1vw;">
              <SearchBar />
          </NavItem>
        </Nav>
        <NavbarToggler on:click={() => isOpen = !isOpen}/>
        <Collapse navbar {isOpen}>
          <Nav navbar class="ml-auto right-buttons">
            <NavItem>
                <NavLink href="/search" size="md" color="warning">Images</NavLink>
            </NavItem>
            <NavItem>
                <NavLink size="med" color="warning">Collections</NavLink>
            </NavItem>
            <NavItem>
                <NavLink size="med" color="warning">Random</NavLink>
            </NavItem>
            <NavItem>
              <NavLink color="warning">Help</NavLink>
            </NavItem>
            <NavItem>
              <NavLink color="warning">Settings</NavLink>
            </NavItem>
            <NavItem>
              <LogInButton />
            </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  </Container>
</div>
{:else}
  <Navbar>
      <div class="right-buttons">
        {#if (!$logged_in)}
          <LogInButton/>
        {:else}
          <Button href="/profile" color="warning">Profile</Button>
          <Button color="warning">Logout</Button>
        {/if}
        <Button color="warning">Help</Button>
      </div>
  </Navbar>
{/if}

<style>
  NavbarToggler {
    margin-inline: 0.2ex;
  }
</style>

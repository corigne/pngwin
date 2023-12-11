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
  import { jwtDecode } from 'jwt-decode'

  $: logged_in

  const handleResize = () => {
    // Set isOpen to true when the window expands beyond a certain width
    isOpen = window.innerWidth > 768; // Adjust the width threshold as needed
  };

  const automaticallyLogin = async () => {
    //check for cookie
    if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {

      const jwt = document.cookie.split(';').find((t) => t.trim().startsWith('jwt=')).split('=')[1]
      const { userid, session_id, role, exp } = jwtDecode(jwt)

      // expire token if exp passed, no fetch req
      if (Date.now() >= exp * 1000) {
        console.log("Token expired, logging you out.")
        handleLogout()
      }

      const gotName = await fetch(`http://localhost:3000/api/userName?userID=${userid}`)

      if(!gotName){
        return alert("Error in automatically logging in, please try logging in manually.")
      }

      const { username } = await gotName.json()

      if(!username)
        return alert("Login failed, username not found.")

      // otherwise fetch for login
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          jwt: jwt
        })
      })
      const data = await res.json();

      if (data.login) {
          logged_in.set(true)
          user.set({
            name: username,
            id: userid,
            role: role
          })
          console.log($user)
          return;
      }
      else {
          alert("Login Failed! \n" + data.error)
      }
      logged_in.set(true)
    }
    else {
      console.log("Not logged in.")
    }
  }

  const handleLogout = async () => {
    if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {

      const jwt = document.cookie.split(';').find((t) => t.trim().startsWith('jwt=')).split('=')[1]

      console.log(jwt)

      const result = await fetch('http://localhost:3000/api/logout', {
          method: "DELETE",
          headers: {
          'Authorization': `Bearer ${jwt}`
          }
        })
      const json_res = await result.json()

      console.log(result)
      console.log(json_res)
    }
    document.cookie = `jwt=; expires=${new Date(Date.now() - 1 )}; path=/`;
    logged_in.set(false)
    user.set(null)
  }

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
  <Container fluid>
    <Navbar class="navbar-container" expand="md" on:expand={() => isOpen = true} >
      <NavbarBrand><img class="icon" href="/" src="/pngwin-modified.png" alt="png.win mascot"/></NavbarBrand>
        <Nav class="ml-auto" navbar style="flex-grow: 2;">
          <NavItem style="flex-grow: 1; margin:1vw;">
              <SearchBar />
          </NavItem>
        </Nav>
        <NavbarToggler on:click={() => isOpen = !isOpen}/>
        <Collapse navbar {isOpen}>
          <Nav navbar underline class="ml-auto right-buttons">
            <NavItem>
                <NavLink href="/search" size="md" >Images</NavLink>
            </NavItem>
            <NavItem>
                <NavLink size="med">Collections</NavLink>
            </NavItem>
            <NavItem>
                <NavLink size="med">Random</NavLink>
            </NavItem>
            <NavItem>
              <NavLink >Help</NavLink>
            </NavItem>
            <NavItem>
              <NavLink >Settings</NavLink>
            </NavItem>
            {#if ($logged_in)}
              <NavItem>
                <NavLink href="/profile" color="warning">Profile</NavLink>
              </NavItem>
              <NavItem>
                <NavLink color="warning" on:click={handleLogout}>Logout</NavLink>
              </NavItem>
            {:else}
              <NavItem>
                <LogInButton/>
              </NavItem>
            {/if}
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
          <Button color="warning" on:click={handleLogout}>Logout</Button>
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

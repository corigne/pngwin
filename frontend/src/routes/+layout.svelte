<script>
  import '../styles/global.css'
  import LogInButton from '../lib/login-button.svelte'
  import {
    Container,
    Navbar,
    NavbarBrand,
    NavItem
  } from 'sveltestrap'
</script>

<header>
  <div class="nav">
    <Container fluid>
      <Navbar>
        <NavbarBrand><img class="icon" href="/" src="pngwin-modified.png" alt="png.win mascot"/></NavbarBrand>
        <NavItem>
          <LogInButton />
        </NavItem>
      </Navbar>
    </Container>
  </div>
</header>

<main>
  <!-- page content -->
  <slot></slot>
</main>

<footer>
</footer>

<style>
  img.icon {
      width: 2em;
      background-color: #949494;
  }
</style>

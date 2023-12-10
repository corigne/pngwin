<script>
  import '../styles/global.css'
    import "bootstrap/dist/css/bootstrap.min.css"
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
</style>

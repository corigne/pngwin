<script>
  import '../styles/global.css'
  import LogInButton from '../lib/login-button.svelte'
  import {
    Container,
    Col,
    Row
  } from 'sveltestrap'
</script>

<header>
  <div class="Login_btn">
      <Container fluid>
          <Row>
              <Col class="text-end">
                  <LogInButton />
              </Col>
          </Row>
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

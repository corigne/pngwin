<script>
    import SearchBar from "$lib/searchBar.svelte"
    import {
        Button,
        Container,
        Row,
        Col,
        Nav,
        NavItem,
    } from "sveltestrap";

    import { search_tags } from '$lib/stores.js'
    import { onMount } from "svelte";

    onMount(() => {
      search_tags.set(null)
    })
</script>

<div class="logo py-0">
    <Container>
        <Row>
            <Col class="text-center">
                <figure class="logo">
                    <img src="/pngwin-modified.png" alt="pngwin logo" class="logo" />
                    <figcaption class="logo_title">PNG.WIN</figcaption>
                </figure>
            </Col>
        </Row>
    </Container>
</div>

<Container fluid>
  <div class="main-search">
    <SearchBar />
  </div>
</Container>

<div class="mx-auto py-2 menu-items" >
  <Button href="/search?tags=" size="lg" color="warning">Images</Button>
  <Button size="lg" color="warning">Collections</Button>
  <Button size="lg" color="warning">Random</Button>
</div>

<style>
.menu-items {
  display: flex;
  justify-content: center;
  gap: 1.5ex;
}
</style>

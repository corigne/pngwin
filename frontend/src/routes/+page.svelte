<script>
    import SearchBar from "$lib/searchBar.svelte"
    import {
        Button,
        Container,
        Row,
        Col,
    } from "sveltestrap";

    import { search_tags } from '$lib/stores.js'
    import { onMount } from "svelte";
    import { logged_in } from '$lib/stores.js'

    onMount(() => {
      search_tags.set([])
      //check for cookie
        if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {
            logged_in.set(true)
        }
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

<div class="buttons">
    <Container>
        <Row>
            <div class="col-6 mx-auto my-auto py-2 text-center mb-3">
                <div class="d-inline px-2 mb-2">
                    <Button href="/search?tags=" size="lg" color="warning">Images</Button>
                </div>
                <div class="d-inline px-2 mb-2">
                    <Button size="lg" color="warning">Collections</Button>
                </div>
                <div class="d-inline px-2 mb-2">
                    <Button size="lg" color="warning">Random</Button>
                </div>
            </div>
        </Row>
    </Container>
</div>

<style>
</style>

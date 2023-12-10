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

    onMount(() => {
      search_tags.set([])
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

<div class="searchbar">
    <Container>
        <Row>
          <SearchBar />
        </Row>
    </Container>
</div>

<div class="buttons">
    <Container>
        <Row>
            <div class="col-6 mx-auto my-auto py-2 text-center mb-3">
                <div class="d-inline px-2 mb-2">
                    <Button href="/images" size="lg" color="warning"
                        >Images</Button
                    >
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

<script>
    import "bootstrap/dist/css/bootstrap.min.css"
    import LogInButton from "$lib/login-button.svelte"
    import SearchBar from "$lib/search-bar.svelte"
    import {
        Button,
        Container,
        Row,
        Col,
    } from "sveltestrap";
</script>

<div class="Login_btn">
    <Container fluid>
        <Row>
            <Col class="text-end">
                <LogInButton />
            </Col>
        </Row>
    </Container>
</div>

<div class="logo py-0">
    <Container>
        <Row>
            <Col class="text-center">
                <figure class="logo">
                    <img src="/pngwin-modified.png" alt="pngwin logo" />
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
            <div class="col-6 mx-auto my-auto py-2 text-center">
                <div class="d-inline px-2">
                    <Button href="/images" size="lg" color="warning"
                        >Images</Button
                    >
                </div>
                <div class="d-inline px-2">
                    <Button size="lg" color="warning">Collections</Button>
                </div>
                <div class="d-inline px-2">
                    <Button size="lg" color="warning">Random</Button>
                </div>
            </div>
        </Row>
    </Container>

    <Container>
        <Row>
            <div class="col-6 mx-auto my-2 text-center">
                <div class="d-inline px-2">
                    <Button color="warning">Help</Button>
                </div>
                <div class="d-inline px-2">
                    <Button color="warning">Settings</Button>
                </div>
            </div>
        </Row>
    </Container>
</div>

<style>
    :global(body) {
        background-color: #949494;
    }
    img {
        width: 30%;
        height: 30%;
    }
    figure.logo {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
        text-align: center;
    }
    .logo_title {
        display: block;
        font-family: Krungthep;
        font-size: 72px;
    }
</style>

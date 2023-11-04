<script lang="ts">
    import "bootstrap/dist/css/bootstrap.min.css";
    import {
        Button,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Container,
        Row,
        Col,
        Image,
        Figure,
        Input,
        InputGroup,
        InputGroupText,
    } from "sveltestrap";
    let open = false;
    const toggle = () => (open = !open);
</script>

<div class="Login_btn">
    <Container fluid>
        <Row>
            <Col class="text-end">
                <Button color="warning" on:click={toggle}>Login</Button>
                <Modal isOpen={open} backdrop={false} {toggle}>
                    <ModalHeader {toggle}>Login</ModalHeader>
                    <ModalBody>
                        <h6>Email</h6>
                        <InputGroup>
                            <Input
                                placeholder="Ex. bbygworlpngwin@pngwin.com"
                            />
                        </InputGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="warning" on:click={toggle}
                            >Sign Up</Button
                        >
                        <Button color="warning" on:click={toggle}>Submit</Button
                        >
                        <Button color="secondary" on:click={toggle}
                            >Cancel</Button
                        >
                    </ModalFooter>
                </Modal>
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
            <div class="col-9 mx-auto my-2 text-center">
                <InputGroup>
                    <Input placeholder="Search" />
                </InputGroup>
            </div>
        </Row>
    </Container>
</div>
<div class="buttons">
    <Container>
        <Row>
            <div class="col-6 mx-auto my-auto py-2 text-center">
                <div class="d-inline px-2">
                    <Button size="lg" color="warning">Home</Button>
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

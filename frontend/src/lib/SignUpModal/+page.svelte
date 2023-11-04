<script>
    import {
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Button,
        Input,
        InputGroup,
        Col,
    } from "sveltestrap";
    let signinopen = false;
    const signupToggle = () => (signinopen = !signinopen);
</script>

<div class="SignUpModal">
    <Button class="sign-up" color="warning" on:click={signupToggle}
        >Sign Up</Button
    >
    <Modal isOpen={signinopen} backdrop={false} {signupToggle}>
        <ModalHeader {signupToggle}>Sign Up</ModalHeader>
        <ModalBody>
            <h6>Enter a username.</h6>
            <InputGroup>
                <Input placeholder="Ex. bbygworlpngwin" />
            </InputGroup>
            <Col class="text-end py-2">
                <Button color="warning">Check Availibility</Button>
            </Col>
            <h6>Enter an email to receive a one time password at.</h6>
            <InputGroup>
                <Input placeholder="Ex. bbygworlpngwin@slay.com" />
            </InputGroup>
            <Col class="text-end py-2">
                <Button color="warning">Send OTP</Button>
            </Col>
            <h6>Enter unique one time password in the field below.</h6>
            <InputGroup>
                <Input placeholder="Ex. 123456" />
            </InputGroup>
            <Col class="text-end py-2">
                <Button color="warning">Verify</Button>
            </Col>
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" on:click={signupToggle}>Cancel</Button>
        </ModalFooter>
    </Modal>
</div>

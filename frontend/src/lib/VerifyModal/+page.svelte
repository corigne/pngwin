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
    let verifyopen = false;
    const verifyToggle = () => (verifyopen = !verifyopen);
</script>

<div class="VerifyModal">
    <Button class="verify-user" color="warning" on:click={verifyToggle}
        >Sign Up</Button
    >
    <Modal isOpen={verifyopen} backdrop={false} {verifyToggle}>
        <ModalHeader {verifyToggle}>Verify</ModalHeader>
        <ModalBody>
            <h6>Enter a username.</h6>
            <InputGroup>
                <Input placeholder="Ex. bbygworlpngwin" />
            </InputGroup>
            <Col class="text-front py-2">
                <Button color="warning">Check</Button>
            </Col>
            <h6>Enter an email to receive a one time password at.</h6>
            <InputGroup>
                <Input placeholder="Ex. bbygworlpngwin@slay.com" />
            </InputGroup>
            <Col class="text-front py-2">
                <Button color="warning">Send OTP</Button>
            </Col>
            <h6>Enter unique one time password in the field below.</h6>
            <InputGroup>
                <Input placeholder="Ex. 123456" />
            </InputGroup>
            <Col class="text-front py-2">
                <Button color="warning">Submit</Button>
            </Col>
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" on:click={verifyToggle}>Cancel</Button>
        </ModalFooter>
    </Modal>
</div>

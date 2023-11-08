<script>
    import SignUpModal from "$lib/VerifyModal/+page.svelte";
    import {
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
        Button,
        Input,
        InputGroup,
    } from "sveltestrap";
    let open = false;
    const toggle = () => (open = !open);
</script>

<Button class="login" color="warning" on:click={toggle}>Login</Button>
<div class="LogInModal">
    <Modal isOpen={open} backdrop={false} {toggle}>
        <ModalHeader {toggle}>Login</ModalHeader>
        <ModalBody>
            <h6>Username</h6>
            <InputGroup>
                <Input placeholder="Ex. _bbygworlpngwin" />
            </InputGroup>
        </ModalBody>
        <ModalFooter>
            <SignUpModal />
            <Button color="warning">Submit</Button>
            <Button color="secondary" on:click={toggle}>Cancel</Button>
        </ModalFooter>
    </Modal>
</div>

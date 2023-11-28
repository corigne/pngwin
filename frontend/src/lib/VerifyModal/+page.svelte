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
    let usernameOpen = true;
    let emailOpen = false;
    let usernameError = false;
    let username = "";

    const verifyUsername = async () => {
        const res = await fetch("http://localhost:3000/api/userID?username={$username}");
        const data = await res.json();
        console.log(data.error)
        if (data.user_exists) {
            usernameError = true;
            return;
        }
        else {
            usernameOpen = false;
            emailOpen = true;
        }
    };

    const handleUserSubmit = async (event) =>{
        event.preventDefault();
        await verifyUsername();
    }
    const verifyToggle = () => (verifyopen = !verifyopen);
</script>

<div class="VerifyModal">
    <Button class="verify-user" color="warning" on:click={verifyToggle}
        >Sign Up</Button
    >
    <Modal isOpen={verifyopen} backdrop={false} {verifyToggle}>
        {#if usernameOpen}
        <ModalHeader {verifyToggle}>Verify Username</ModalHeader>
        <ModalBody>
            <h6>Username</h6>
            <InputGroup>
                <Input bind:value={username} placeholder="Enter username" />
            </InputGroup>
            {#if usernameError}
            <Col class="text-center">
                <p class="text-danger">Username exists!</p>
            </Col>
            {/if}
        </ModalBody>
        <ModalFooter>
            <form on:submit={handleUserSubmit}>
                <Button color="primary" type="submit">
                    Submit
                </Button>
            </form>
            <Button color="secondary" on:click={verifyToggle}>
                Cancel
            </Button>
        </ModalFooter>
        {/if}
        {if}
    </Modal>
</div>

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
    let email = "";
    let emailError = false;
    let emailErrorMessage = "";

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

    const createUser = async () => {
        const res = await fetch("http://localhost:3000/api/createUser",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                email: email,
            }),
        });
        const data = await res.json();
        if(data.user_created){
            alert("user created");
            verifyToggle();
        }
        else{
            emailError = true;
            emailErrorMessage = data.reason;
            console.log("user not created");
        }
    };

    const handleUserSubmit = async (event) =>{
        event.preventDefault();
        await verifyUsername();
    }

    const handleEmailSubmit = async (event) =>{
        event.preventDefault();
        if(!(/.+@.+\..+/.test(email)))
        {
            emailError = true;
            emailErrorMessage = "Invalid email";
            return;
        }
        //check email against regex
        await createUser();
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
        {#if emailOpen}
            <ModalHeader {verifyToggle}>Verify Email</ModalHeader>
            <ModalBody>
                <h6>Email</h6>
                <InputGroup>
                    <Input bind:value={email} placeholder="Enter email" />
                </InputGroup>
                {#if emailError}
                <Col class="text-center">
                    <p class="text-danger">{emailErrorMessage}</p>
                </Col>
                {/if}
            </ModalBody>
            <ModalFooter>
                <form on:submit={handleEmailSubmit}>
                    <Button color="primary" type="submit">
                        Submit
                    </Button>
                </form>
                <Button color="secondary" on:click={verifyToggle}>
                    Cancel
                </Button>
            </ModalFooter>
        {/if}
    </Modal>
</div>

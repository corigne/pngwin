<script>
    import SignUpModal from "$lib/VerifyModal/+page.svelte";
    import { onMount } from "svelte";
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
    let username = '';
    let inputField;
    let rememberMe = false;

    const toggle = () => (open = !open);
    const login = () => {
        //fetch request to api/login through localhost:3000/api/login with username from input
        //if successful, set cookie and redirect to home
        //else, display error message
        console.log(username);
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: username, jwt: null, remembered: rememberMe})
        })
        .then(response => response.json())
        //log response
        .then(data => {
            console.log(data);
        })
    }
    const handleFormSubmit = (event) => {
        event.preventDefault();
        login();
    }
    onMount(() => {
        //focus on username input
        if(open && inputField){
            inputField.focus();
        } 
    });
</script>

<Button class="login" color="warning" on:click={toggle}>Login</Button>
<div class="LogInModal">
    <Modal isOpen={open} backdrop={false} {toggle}>
        <ModalHeader {toggle}>Login</ModalHeader>
        <ModalBody>
            <form on:submit={handleFormSubmit}>
                <h6>Username</h6>
                <InputGroup>
                    <Input bind:value={username} placeholder="Ex. _bbygworlpngwin" />
                </InputGroup>

                <label>
                    <input type="checkbox" bind:checked={rememberMe} />
                    Remember Me
                </label>
                
                <ModalFooter>
                    <SignUpModal />
                    <Button color="warning" type="submit">Login</Button>
                    <Button color="secondary" on:click={toggle}>Cancel</Button>
                </ModalFooter>
            </form>
        </ModalBody>
    </Modal>
</div>

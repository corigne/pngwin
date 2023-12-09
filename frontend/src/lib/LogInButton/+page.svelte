<script>
    import SignUpModal from "$lib/VerifyModal/+page.svelte";
    import OTPModal from "$lib/OTPModal/+page.svelte";
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
    let loginSuccess = false;
    let otpRequired = false;
    let otpOpen = false;
    let otp = '';
    let sessionuuid = '';

    const toggle = () => (open = !open);
    const otpToggle = () => (otpOpen = !otpOpen);

    const login = async () => {
        //check if cookie exists and await fetch login using jwt token
        if (document.cookie.split(';').some((item) => item.trim().startsWith('jwt='))) {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, jwt: document.cookie.split(';').find((item) => item.trim().startsWith('jwt=')).split('=')[1] })
            });
            const data = await res.json();
            if (data.login) {
                alert("Login Successful!");
                toggle();
                return;
            }
            else {
                alert("Login Failed! \n Error: " + data.error)
            }
            toggle();
            return;
        }
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, remembered: rememberMe })
        });

        const data = await res.json();

        if (data.login && data.otp_required) {
            // OTP is required
            otpRequired = true;
            sessionuuid = data.session_id;
        } 
        else {
            alert("Login Failed! \n Error: " + data.error)
        }
    }

    const otpLogin = async () => {
        const res = await fetch('http://localhost:3000/api/verifyOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ OTP: otp, session_id: sessionuuid })
        });

        const data = await res.json();

        if (data.valid) {
            // Login successful
            if (rememberMe) {
                //set cookie with jwt token with expiration of 30 days
                document.cookie = `jwt=${data.token}; expires=${new Date(Date.now() + 2592000000)}; path=/`;
            }
            else{
                //set cookie with jwt token with expiration of 1 day
                document.cookie = `jwt=${data.token}; expires=${new Date(Date.now() + 86400000)}; path=/`;
            }
            alert("Login Successful!");
            toggle();
        } 
        else {
            // Login failed
            alert("Login Failed! Please try again.");
        }
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await login();
    }
    const handleOTPSubmit = async (event) => {
        event.preventDefault();
        await otpLogin();
        otpRequired = false;
    }

    onMount(() => {
        // Focus on username input
        if (open && inputField) {
            inputField.focus();
        }
    });
</script>

<Button class="login" color="warning" on:click={toggle}>Login</Button>
<div class="LogInModal">
    {#if otpRequired}
    <Modal isOpen={open} backdrop = {false} toggle>
        <ModalHeader {toggle}>Enter OTP</ModalHeader>
        <ModalBody>
          <h6>OTP</h6>
          <InputGroup>
            <Input bind:value={otp} placeholder= "Enter OTP" />
          </InputGroup>
        </ModalBody>
        <ModalFooter>
            <form on:submit={handleOTPSubmit}>
                <Button color="primary" type="submit">
                Submit
                </Button>
            </form>
          <Button color="secondary" on:click={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    {:else}
        <Modal isOpen={open} backdrop={false} {toggle}>
            <ModalHeader {toggle}>Login</ModalHeader>
            <ModalBody>
                <h6>Username</h6>
                <InputGroup>
                    <Input bind:value={username} placeholder="Ex. _bbygworlpngwin" />
                </InputGroup>

                <label>
                    <input type="checkbox" bind:checked={rememberMe} />
                    Remember Me
                </label>
            </ModalBody>
            <ModalFooter>
                <SignUpModal/> 
                <form on:submit={handleFormSubmit}>
                    <Button color="warning" type="submit">Login</Button>
                </form>
                <Button color="secondary" on:click={toggle}>Cancel</Button>
            </ModalFooter>
        </Modal>
    {/if}
</div>
